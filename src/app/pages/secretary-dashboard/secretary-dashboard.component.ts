import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, ParamMap, Router, RouterLink } from "@angular/router";
import { finalize, Subscription } from "rxjs";
import { AuthService } from "../../core/auth/auth.service";
import { PushNotificationService } from "../../core/push/push-notification.service";
import { ToastService } from "../../core/toast/toast.service";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";
import { bindDashboardMobileSidebar } from "../../shared/dashboard/dashboard-mobile-sidebar";
import { bindDashboardRouteHistory } from "../../shared/dashboard/dashboard-route-history";
import { SecretaryAccessResult, SecretaryDashboardService, SecretaryPermission } from "../../core/secretary/secretary-dashboard.service";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";
import { SecretaryReservationsComponent } from "./secretary-reservations.component";
import { SecretaryReservationRequestsComponent } from "./secretary-reservation-requests.component";
import {
  SecretaryDashboardPreset,
  SecretaryOverviewComponent,
} from "./secretary-overview.component";

interface SecretaryProfileForm {
  nationalityCode: string;
  address: string;
}

type SecretaryDashboardSection =
  | "overview"
  | "profile"
  | "reservations"
  | "reviews";

interface SecretaryDashboardLink {
  id: SecretaryDashboardSection;
  label: string;
  icon: string;
}

const SECRETARY_DASHBOARD_SECTIONS: SecretaryDashboardSection[] = [
  "overview",
  "profile",
  "reservations",
  "reviews",
];

@Component({
  selector: "app-secretary-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    FaIconComponent,
    SecretaryReservationsComponent,
    SecretaryReservationRequestsComponent,
    SecretaryOverviewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./secretary-dashboard.component.html",
  styleUrl: "./secretary-dashboard.component.scss",
})
export class SecretaryDashboardComponent implements OnInit, OnDestroy {
  readonly user = this.auth.user;
  activeSection: SecretaryDashboardSection = "overview";
  mobileSidebarOpen = false;

  readonly dashboardLinks: SecretaryDashboardLink[] = [
    { id: "overview", label: "نمای کلی", icon: "dashboard" },
    { id: "profile", label: "پروفایل", icon: "shield" },
    { id: "reservations", label: "رزروها", icon: "calendar" },
    { id: "reviews", label: "تایید حضور", icon: "check" },
  ];

  readonly displayName = computed(() => {
    const user = this.user();
    const name = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name || "کاربر";
  });

  readonly roleLabel = computed(() => {
    const user = this.user();
    return user ? this.auth.roleLabel(user.role, "fa") : "منشی";
  });

  readonly secretaryTypeLabel = computed(() => {
    const type = this.user()?.secretaryType?.toLowerCase();
    if (type === "assistant") return "منشی کمکی";
    if (type === "main") return "منشی اصلی";
    return "منشی";
  });

  readonly secretaryAllowedDayLabels = computed(() =>
    (this.user()?.allowedDays ?? []).map(
      (day) =>
        ({
          Saturday: "شنبه",
          Sunday: "یکشنبه",
          Monday: "دوشنبه",
          Tuesday: "سه‌شنبه",
          Wednesday: "چهارشنبه",
          Thursday: "پنجشنبه",
          Friday: "جمعه",
        })[day] ?? day,
    ),
  );

  profileForm: SecretaryProfileForm = {
    nationalityCode: "",
    address: "",
  };
  profileSaving = false;
  feedbackMessage = "";
  feedbackType: "success" | "error" = "success";
  reservationPreset: SecretaryDashboardPreset | null = null;
  accessLoading = true;
  access: SecretaryAccessResult | null = null;

  readonly ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR;
  private readonly markDirty: () => void;
  private readonly destroyRef = inject(DestroyRef);
  private routeQueryParamsSubscription: Subscription | null = null;
  private readonly mobileSidebar = bindDashboardMobileSidebar(
    this,
    () => this.markDirty(),
    this.destroyRef,
  );

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private secretaryApi: SecretaryDashboardService,
    private pushNotifications: PushNotificationService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {
    this.markDirty = createCoalescedMarkForCheck(this.cdr, () => false);
    bindDashboardRouteHistory(
      this.router,
      this.route,
      (params) => this.applySectionRouteParams(params),
      this.destroyRef,
    );
  }

  get visibleDashboardLinks(): SecretaryDashboardLink[] {
    if (!this.isProfileReady()) {
      return this.dashboardLinks.filter(
        (item) => item.id !== "reservations" && item.id !== "reviews",
      );
    }

    return this.dashboardLinks.filter((item) => {
      if (item.id === "profile") return true;
      if (item.id === "reviews") return this.hasPermission("ConfirmAttendance");
      return this.hasPermission("ViewReservations");
    });
  }

  ngOnInit(): void {
    this.closeMobileSidebar();
    if (!this.isProfileReady()) {
      this.activeSection = "profile";
    }

    this.applySectionRouteParams(this.route.snapshot.queryParamMap);
    this.routeQueryParamsSubscription = this.route.queryParamMap.subscribe(
      (params) => this.applySectionRouteParams(params),
    );
    this.syncSectionQueryParam(this.activeSection);
    this.secretaryApi.getAccess().subscribe({
      next: (access) => {
        this.access = access;
        this.accessLoading = false;
        if (!this.visibleDashboardLinks.some((item) => item.id === this.activeSection)) this.setSection("profile");
        this.markDirty();
      },
      error: () => {
        this.accessLoading = false;
        this.feedbackType = "error";
        this.feedbackMessage = "دریافت سطح دسترسی منشی انجام نشد. دوباره تلاش کنید.";
        this.markDirty();
      },
    });
  }

  hasPermission(permission: SecretaryPermission): boolean {
    if (this.access?.hasFullAccess) return true;
    if (!this.access && this.user()?.secretaryType?.toLowerCase() === "main") return true;
    return this.access?.permissions.includes(permission) ??
      this.user()?.secretaryPermissions?.includes(permission) ?? false;
  }

  ngOnDestroy(): void {
    this.routeQueryParamsSubscription?.unsubscribe();
  }

  isProfileReady(): boolean {
    return this.auth.isRoleProfileComplete(this.user());
  }

  setSection(section: SecretaryDashboardSection): void {
    const resolvedSection = this.resolveSection(section);
    if (resolvedSection === this.activeSection) {
      this.syncSectionQueryParam(resolvedSection);
      return;
    }

    this.activeSection = resolvedSection;
    this.syncSectionQueryParam(resolvedSection);
    this.closeMobileSidebar();
    this.markDirty();
  }

  openDashboardList(preset: SecretaryDashboardPreset): void {
    this.reservationPreset = preset;
    this.setSection("reservations");
  }

  private resolveSection(
    section: SecretaryDashboardSection,
  ): SecretaryDashboardSection {
    if (
      (section === "overview" ||
        section === "reservations" ||
        section === "reviews") &&
      !this.isProfileReady()
    ) {
      return "profile";
    }

    if (section === "reviews" && !this.hasPermission("ConfirmAttendance")) return "profile";
    if ((section === "overview" || section === "reservations") && !this.hasPermission("ViewReservations")) return "profile";

    return section;
  }

  private syncSectionQueryParam(section: SecretaryDashboardSection): void {
    const resolvedSection = this.resolveSection(section);
    const querySection =
      resolvedSection === "overview" ? null : resolvedSection;
    const currentSection = this.route.snapshot.queryParamMap.get("section");

    if ((currentSection ?? null) === querySection) return;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: querySection },
      queryParamsHandling: "merge",
      replaceUrl: false,
    });
  }

  private activateSectionFromRoute(section: SecretaryDashboardSection): void {
    const resolvedSection = this.resolveSection(section);
    if (resolvedSection === this.activeSection) return;

    this.activeSection = resolvedSection;
    this.closeMobileSidebar();
    this.markDirty();
  }

  private applySectionRouteParams(params: ParamMap): void {
    const section = params.get("section") as SecretaryDashboardSection | null;

    if (section && SECRETARY_DASHBOARD_SECTIONS.includes(section)) {
      this.activateSectionFromRoute(section);
      return;
    }

    this.activateSectionFromRoute(
      this.isProfileReady() ? "overview" : "profile",
    );
  }

  toggleMobileSidebar(): void {
    this.mobileSidebar.toggleMobileSidebar();
  }

  closeMobileSidebar(): void {
    this.mobileSidebar.closeMobileSidebar();
  }

  submitProfile(): void {
    const validationError = this.validateProfileForm();
    if (validationError) {
      this.showFeedback(validationError, "error");
      return;
    }

    const userId = this.user()?.userId;
    if (!userId) {
      this.showFeedback("شناسه کاربر منشی در دسترس نیست", "error");
      return;
    }

    this.profileSaving = true;
    this.clearFeedback();

    this.secretaryApi
      .completeProfile({
        userId,
        nationalityCode: this.profileForm.nationalityCode.trim(),
        address: this.profileForm.address.trim(),
        isCompleteProfile: true,
      })
      .pipe(
        finalize(() => {
          this.profileSaving = false;
          this.markDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          this.auth.updateSecretaryProfile(true);
          this.showFeedback(
            response.message || "پروفایل منشی کامل شد",
            "success",
          );
          this.activeSection = "overview";
        },
        error: (error) =>
          this.showFeedback(
            error instanceof Error && error.message
              ? error.message
              : "تکمیل پروفایل انجام نشد",
            "error",
          ),
      });
  }

  validateProfileForm(): string | null {
    const code = this.profileForm.nationalityCode.trim();
    if (!/^\d{10}$/.test(code)) return "کد ملی باید ۱۰ رقم باشد";
    if (
      !this.profileForm.address.trim() ||
      this.profileForm.address.trim().length < 5
    ) {
      return "آدرس منشی الزامی است";
    }
    return null;
  }

  trackDashboardLink(
    _: number,
    item: SecretaryDashboardLink,
  ): SecretaryDashboardSection {
    return item.id;
  }

  logout(): void {
    this.pushNotifications.resetRegisteredTokenCache();
    this.auth.logout();
    this.router.navigateByUrl("/");
  }

  private showFeedback(message: string, type: "success" | "error"): void {
    this.feedbackMessage = message;
    this.feedbackType = type;
    if (type === "success") {
      this.toast.success(message);
      return;
    }
    this.toast.error(message);
    this.markDirty();
  }

  private clearFeedback(): void {
    this.feedbackMessage = "";
    this.markDirty();
  }
}
