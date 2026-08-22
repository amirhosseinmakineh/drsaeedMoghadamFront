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
import { ActivatedRoute, ParamMap, Router, RouterLink } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../../core/auth/auth.service";
import { PushNotificationService } from "../../core/push/push-notification.service";
import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";
import { bindDashboardMobileSidebar } from "../../shared/dashboard/dashboard-mobile-sidebar";
import { bindDashboardRouteHistory } from "../../shared/dashboard/dashboard-route-history";
import { SecretaryAccessResult, SecretaryDashboardService, SecretaryPermission } from "../../core/secretary/secretary-dashboard.service";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";
import { SecretaryReservationsComponent } from "./secretary-reservations.component";
import { SecretaryFollowUpsComponent } from "./secretary-follow-ups.component";
import { SecretaryReservationRequestsComponent } from "./secretary-reservation-requests.component";
import {
  SecretaryDashboardPreset,
  SecretaryOverviewComponent,
} from "./secretary-overview.component";

type SecretaryDashboardSection =
  | "overview"
  | "reservations"
  | "reviews"
  | "follow-ups";

interface SecretaryDashboardLink {
  id: SecretaryDashboardSection;
  label: string;
  icon: string;
}

const SECRETARY_DASHBOARD_SECTIONS: SecretaryDashboardSection[] = [
  "overview",
  "reservations",
  "reviews",
  "follow-ups",
];

@Component({
  selector: "app-secretary-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FaIconComponent,
    SecretaryReservationsComponent,
    SecretaryFollowUpsComponent,
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
    { id: "reservations", label: "رزروها", icon: "calendar" },
    { id: "reviews", label: "تایید حضور", icon: "check" },
    { id: "follow-ups", label: "دفترچه پیگیری", icon: "clipboard" },
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

  feedbackMessage = "";
  feedbackType: "success" | "error" = "success";
  reservationPreset: SecretaryDashboardPreset | null = null;
  accessLoading = true;
  access: SecretaryAccessResult | null = null;

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
    return this.dashboardLinks.filter((item) => {
      if (item.id === "follow-ups") return true;
      if (item.id === "reviews") return this.hasPermission("ConfirmAttendance");
      return this.hasPermission("ViewReservations");
    });
  }

  ngOnInit(): void {
    this.closeMobileSidebar();
    this.applySectionRouteParams(this.route.snapshot.queryParamMap);
    this.routeQueryParamsSubscription = this.route.queryParamMap.subscribe(
      (params) => this.applySectionRouteParams(params),
    );
    this.syncSectionQueryParam(this.activeSection);
    this.secretaryApi.getAccess().subscribe({
      next: (access) => {
        this.access = access;
        this.accessLoading = false;
        if (!this.visibleDashboardLinks.some((item) => item.id === this.activeSection)) {
          this.setSection(this.visibleDashboardLinks[0]?.id ?? "overview");
        }
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
    if (section === "reviews" && !this.hasPermission("ConfirmAttendance")) return "overview";
    if (section === "follow-ups") return section;
    if ((section === "overview" || section === "reservations") && !this.hasPermission("ViewReservations")) {
      return this.hasPermission("ConfirmAttendance") ? "reviews" : "overview";
    }

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

    this.activateSectionFromRoute("overview");
  }

  toggleMobileSidebar(): void {
    this.mobileSidebar.toggleMobileSidebar();
  }

  closeMobileSidebar(): void {
    this.mobileSidebar.closeMobileSidebar();
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

}
