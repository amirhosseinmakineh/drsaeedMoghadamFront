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
import { SecretaryDashboardService } from "../../core/secretary/secretary-dashboard.service";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";
import { SecretaryReservationsComponent } from "./secretary-reservations.component";

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./secretary-dashboard.component.html",
  styles: [
    `
      .dashboard-layout {
        display: grid;
        grid-template-columns: 300px minmax(0, 1fr);
        gap: 18px;
        width: min(1180px, calc(100% - 36px));
        margin: 0 auto;
        padding: 36px 0 86px;
      }
      .dashboard-sidebar,
      .dashboard-hero,
      .profile-lock-card,
      .status-card,
      .locked-panel {
        border: 1px solid var(--line);
        background: var(--surface);
        box-shadow: var(--shadow);
      }
      .dashboard-sidebar {
        position: sticky;
        top: 18px;
        display: grid;
        align-content: start;
        gap: 18px;
        min-height: calc(100vh - 72px);
        padding: 20px;
        border-radius: 34px;
      }
      .dashboard-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text);
        font-weight: 950;
      }
      .brand-mark,
      .avatar,
      .lock-icon {
        display: grid;
        place-items: center;
        border-radius: 16px;
        background: color-mix(in srgb, var(--brand) 18%, transparent);
        color: var(--brand);
      }
      .brand-mark {
        width: 42px;
        height: 42px;
      }
      .dashboard-user-card {
        display: grid;
        gap: 12px;
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: 28px;
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--brand) 12%, transparent),
          color-mix(in srgb, var(--surface-muted) 84%, transparent)
        );
      }
      .avatar {
        width: 62px;
        height: 62px;
        border-radius: 24px;
        font-size: 1.45rem;
      }
      .dashboard-user-card small {
        display: block;
        color: var(--muted);
        font-weight: 900;
      }
      .dashboard-user-card h1 {
        margin: 4px 0;
        font-size: 1.35rem;
      }
      .dashboard-user-card b {
        color: var(--brand);
      }
      .dashboard-nav {
        display: grid;
        gap: 10px;
      }
      .dashboard-nav button {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 52px;
        border: 1px solid var(--line);
        border-radius: 20px;
        padding: 12px 14px;
        background: var(--surface-muted);
        color: var(--text);
        font: inherit;
        font-weight: 950;
        text-align: start;
      }
      .dashboard-nav button.active {
        border-color: color-mix(in srgb, var(--brand) 40%, var(--line));
        background: color-mix(in srgb, var(--brand) 14%, transparent);
        color: var(--brand);
      }
      .secondary-btn,
      .primary-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 48px;
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 12px 16px;
        color: var(--text);
        font: inherit;
        font-weight: 950;
      }
      .primary-action {
        border: 0;
        background: linear-gradient(135deg, var(--brand), var(--brand-2));
        color: #1b1712;
      }
      .secondary-btn {
        background: var(--surface-muted);
      }
      .primary-action.full {
        width: 100%;
      }
      .compact {
        min-height: 40px;
        border-radius: 999px;
        padding: 9px 13px;
        font-size: 0.86rem;
      }
      .primary-action:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }
      .dashboard-content,
      .secretary-shell {
        display: grid;
        gap: 16px;
      }
      .dashboard-hero,
      .profile-lock-card,
      .status-card,
      .locked-panel {
        padding: 22px 24px;
        border-radius: 30px;
      }
      .dashboard-hero span,
      .panel-heading span {
        display: inline-flex;
        margin-bottom: 8px;
        padding: 5px 12px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--brand) 14%, transparent);
        color: var(--brand);
        font-weight: 950;
      }
      .dashboard-hero h2,
      .profile-lock-card h2,
      .locked-panel h2,
      .panel-heading h2 {
        margin: 0;
        font-size: 1.55rem;
      }
      .profile-lock-card p,
      .locked-panel p {
        margin: 0 0 16px;
        color: var(--muted);
        font-weight: 900;
      }
      .lock-icon {
        width: 54px;
        height: 54px;
        margin-bottom: 12px;
        font-size: 1.3rem;
      }
      .profile-form {
        display: grid;
        gap: 12px;
      }
      .profile-form label {
        display: grid;
        gap: 7px;
        color: var(--muted);
        font-weight: 850;
      }
      .profile-form input,
      .profile-form textarea {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 11px 12px;
        background: var(--surface-muted);
        color: var(--text);
        font: inherit;
      }
      .secretary-overview {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px;
      }
      .secretary-overview button {
        display: grid;
        gap: 8px;
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: 24px;
        background: var(--surface-muted);
        color: var(--text);
        font: inherit;
        text-align: start;
      }
      .secretary-overview span {
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        border-radius: 16px;
        background: color-mix(in srgb, var(--brand) 18%, transparent);
        color: var(--brand);
      }
      .secretary-overview strong {
        font-size: 1.05rem;
      }
      .secretary-overview small {
        color: var(--muted);
        font-weight: 900;
      }
      .feedback,
      .empty-copy {
        margin: 0;
        padding: 12px 14px;
        border-radius: 20px;
        font-weight: 950;
      }
      .feedback.success {
        background: color-mix(in srgb, #22c55e 16%, var(--surface));
        color: #166534;
      }
      .feedback.error {
        background: color-mix(in srgb, var(--danger) 15%, var(--surface));
        color: #991b1b;
      }
      .empty-copy {
        border: 1px dashed var(--line);
        color: var(--muted);
      }
      .locked-panel {
        display: grid;
        gap: 12px;
      }
      .dashboard-mobile-header {
        display: none;
      }
      .mobile-sidebar-backdrop,
      .mobile-sidebar-close,
      .mobile-sidebar-header,
      .mobile-menu-btn {
        display: none;
      }
      @media (max-width: 980px) {
        .dashboard-layout {
          grid-template-columns: 1fr;
          width: min(100% - 24px, 760px);
          padding-top: 14px;
        }
      }
      @media (max-width: 760px) {
        .dashboard-mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          position: sticky;
          top: 0;
          z-index: 90;
          margin-bottom: 10px;
          padding: 10px 12px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: var(--surface);
          box-shadow: 0 8px 22px rgba(93, 64, 32, 0.08);
        }
        .mobile-header-info {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .mobile-avatar {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 16px;
          background: color-mix(in srgb, var(--brand) 18%, transparent);
          color: var(--brand);
          flex-shrink: 0;
        }
        .mobile-header-info strong {
          display: block;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mobile-header-info small {
          display: block;
          color: var(--muted);
          font-weight: 900;
          font-size: 0.78rem;
        }
        .mobile-logout-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 8px 12px;
          background: var(--surface-muted);
          color: var(--text);
          font: inherit;
          font-weight: 950;
          font-size: 0.82rem;
        }
        .dashboard-layout.secretary-mode {
          width: 100%;
          padding: 10px 10px calc(24px + env(safe-area-inset-bottom, 0px));
        }
        .mobile-sidebar-backdrop {
          display: block;
          position: fixed;
          inset: 0;
          z-index: 95;
          border: 0;
          background: rgba(20, 16, 12, 0.42);
        }
        .mobile-menu-btn {
          display: inline-grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: var(--surface-muted);
          color: var(--brand);
          flex-shrink: 0;
        }
        .dashboard-layout.secretary-mode .dashboard-sidebar {
          position: fixed;
          z-index: 100;
          top: 0;
          inset-inline-start: 0;
          bottom: 0;
          width: min(300px, 86vw);
          margin: 0;
          padding: 18px 16px calc(18px + env(safe-area-inset-bottom, 0px));
          border-start-start-radius: 0;
          border-end-start-radius: 28px;
          border-end-end-radius: 28px;
          border-start-end-radius: 0;
          border-inline-start: 0;
          transition: transform 0.28s ease;
          overflow-y: auto;
          box-shadow: 12px 0 32px rgba(93, 64, 32, 0.16);
        }
        [dir="ltr"] .dashboard-layout.secretary-mode .dashboard-sidebar {
          transform: translateX(-105%);
        }
        [dir="rtl"] .dashboard-layout.secretary-mode .dashboard-sidebar {
          transform: translateX(105%);
        }
        .dashboard-layout.secretary-mode .dashboard-sidebar.mobile-sidebar-open {
          transform: translateX(0);
        }
        .mobile-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 4px;
        }
        .mobile-sidebar-header strong {
          font-size: 0.92rem;
        }
        .mobile-sidebar-close-x {
          display: inline-grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: var(--surface-muted);
          color: var(--text);
          flex-shrink: 0;
        }
        .secretary-mode .dashboard-brand,
        .secretary-mode .dashboard-user-card {
          display: grid;
        }
        .secretary-mode .logout-btn {
          display: none;
        }
        .mobile-sidebar-close {
          display: block;
          width: 100%;
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 10px 12px;
          background: var(--surface-muted);
          font: inherit;
          font-weight: 950;
        }
        .secretary-mode .dashboard-nav {
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .secretary-mode .dashboard-nav button {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 48px;
          padding: 10px 12px;
          border-radius: 16px;
          text-align: start;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        .secretary-mode .dashboard-nav button span {
          display: block;
          overflow: visible;
          -webkit-line-clamp: unset;
        }
        .secretary-mode .dashboard-nav app-fa-icon {
          color: var(--brand);
          font-size: 1rem;
          flex-shrink: 0;
        }
        .dashboard-content {
          padding-top: 10px;
        }
        .dashboard-hero,
        .profile-lock-card,
        .status-card,
        .locked-panel {
          border-radius: 24px;
          background: var(--surface);
          box-shadow: 0 8px 22px rgba(93, 64, 32, 0.06);
        }
      }
    `,
  ],
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

  profileForm: SecretaryProfileForm = {
    nationalityCode: "",
    address: "",
  };
  profileSaving = false;
  feedbackMessage = "";
  feedbackType: "success" | "error" = "success";

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

    return this.dashboardLinks.filter((item) => item.id !== "profile");
  }

  ngOnInit(): void {
    if (!this.isProfileReady()) {
      this.activeSection = "profile";
    }

    this.applySectionRouteParams(this.route.snapshot.queryParamMap);
    this.routeQueryParamsSubscription = this.route.queryParamMap.subscribe(
      (params) => this.applySectionRouteParams(params),
    );
    this.syncSectionQueryParam(this.activeSection);
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

  private resolveSection(
    section: SecretaryDashboardSection,
  ): SecretaryDashboardSection {
    if (section === "profile" && this.isProfileReady()) {
      return "overview";
    }

    if (
      (section === "overview" ||
        section === "reservations" ||
        section === "reviews") &&
      !this.isProfileReady()
    ) {
      return "profile";
    }

    return section;
  }

  private syncSectionQueryParam(section: SecretaryDashboardSection): void {
    const resolvedSection = this.resolveSection(section);
    const querySection =
      resolvedSection === "overview" ||
      (resolvedSection === "profile" && this.isProfileReady())
        ? null
        : resolvedSection;
    const currentSection = this.route.snapshot.queryParamMap.get("section");

    if ((currentSection ?? null) === querySection) return;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: querySection },
      queryParamsHandling: "merge",
      replaceUrl: false,
    });
  }

  private activateSectionFromRoute(
    section: SecretaryDashboardSection,
  ): void {
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
