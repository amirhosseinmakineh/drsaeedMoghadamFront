import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  computed,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { AuthService } from "../../core/auth/auth.service";
import { PushNotificationService } from "../../core/push/push-notification.service";
import { ToastService } from "../../core/toast/toast.service";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";
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
  template: `
    <section class="dashboard-layout secretary-mode">
      <header class="dashboard-mobile-header">
        <div class="mobile-header-info">
          <span class="mobile-avatar"
            ><app-fa-icon name="calendar"></app-fa-icon
          ></span>
          <div>
            <strong>{{ displayName() }}</strong>
            <small>{{ roleLabel() }}</small>
          </div>
        </div>
        <button
          class="mobile-logout-btn"
          type="button"
          (click)="logout()"
          aria-label="خروج از حساب کاربری"
        >
          <app-fa-icon name="logout"></app-fa-icon>
          <span>خروج</span>
        </button>
      </header>

      <aside class="dashboard-sidebar mobile-app-nav">
        <a class="dashboard-brand" routerLink="/">
          <span class="brand-mark"
            ><app-fa-icon name="tooth"></app-fa-icon
          ></span>
          <strong>کلینیک دکتر سعید مقدم</strong>
        </a>

        <div class="dashboard-user-card">
          <span class="avatar"><app-fa-icon name="calendar"></app-fa-icon></span>
          <div>
            <small>کاربر وارد شده</small>
            <h1>{{ displayName() }}</h1>
            <b>{{ roleLabel() }}</b>
          </div>
        </div>

        <nav class="dashboard-nav" aria-label="داشبورد منشی">
          <button
            *ngFor="
              let item of visibleDashboardLinks;
              trackBy: trackDashboardLink
            "
            type="button"
            [class.active]="activeSection === item.id"
            (click)="setSection(item.id)"
          >
            <app-fa-icon [name]="item.icon"></app-fa-icon>
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <button
          class="secondary-btn logout-btn"
          type="button"
          (click)="logout()"
        >
          <app-fa-icon name="logout"></app-fa-icon>
          خروج از حساب کاربری
        </button>
      </aside>

      <main class="dashboard-content">
        <section class="secretary-shell">
          <header class="dashboard-hero secretary-hero">
            <span>داشبورد منشی</span>
            <h2>مدیریت رزرو و تایید حضور، {{ displayName() }}</h2>
          </header>

          @if (feedbackMessage) {
            <p
              class="feedback"
              [class.error]="feedbackType === 'error'"
              [class.success]="feedbackType === 'success'"
            >
              {{ feedbackMessage }}
            </p>
          }

          @if (activeSection === "overview") {
            <section class="secretary-overview">
              @if (!isProfileReady()) {
                <button type="button" (click)="setSection('profile')">
                  <span><app-fa-icon name="shield"></app-fa-icon></span>
                  <strong>تکمیل پروفایل</strong>
                  <small>برای دسترسی به رزروها و تایید حضور</small>
                </button>
              }
              @if (isProfileReady()) {
                <button type="button" (click)="setSection('reservations')">
                  <span><app-fa-icon name="calendar"></app-fa-icon></span>
                  <strong>رزروها</strong>
                  <small>مشاهده و تکمیل پرونده بیمار</small>
                </button>
                <button type="button" (click)="setSection('reviews')">
                  <span><app-fa-icon name="check"></app-fa-icon></span>
                  <strong>تایید حضور</strong>
                  <small>بررسی ادعای مشاور</small>
                </button>
              }
            </section>
          }

          @if (activeSection === "profile") {
            @if (!isProfileReady()) {
              <section class="profile-lock-card">
                <span class="lock-icon"
                  ><app-fa-icon name="shield"></app-fa-icon
                ></span>
                <h2>تکمیل پروفایل منشی</h2>
                <p>
                  برای مشاهده رزروها، تکمیل پرونده بیمار و بررسی تایید حضور،
                  ابتدا کد ملی و آدرس خود را ثبت کنید.
                </p>

                <form class="profile-form" (ngSubmit)="submitProfile()">
                  <label>
                    کد ملی
                    <input
                      [(ngModel)]="profileForm.nationalityCode"
                      [ngModelOptions]="ngModelBlurOptions"
                      name="secretaryNationalityCode"
                      inputmode="numeric"
                      maxlength="10"
                      placeholder="0012345678"
                    />
                  </label>
                  <label>
                    آدرس
                    <textarea
                      [(ngModel)]="profileForm.address"
                      [ngModelOptions]="ngModelBlurOptions"
                      name="secretaryAddress"
                      rows="4"
                      placeholder="آدرس کامل محل سکونت"
                    ></textarea>
                  </label>
                  <button
                    class="primary-action full"
                    type="submit"
                    [disabled]="profileSaving"
                  >
                    {{
                      profileSaving
                        ? "در حال ثبت..."
                        : "تکمیل پروفایل و ورود به داشبورد"
                    }}
                  </button>
                </form>
              </section>
            } @else {
              <section class="status-card">
                <header class="panel-heading">
                  <div>
                    <span>پروفایل</span>
                    <h2>پروفایل منشی تکمیل شده است</h2>
                  </div>
                </header>
                <p class="empty-copy">
                  پروفایل شما کامل است و به همه بخش‌های داشبورد دسترسی دارید.
                </p>
              </section>
            }
          }

          @if (activeSection === "reservations") {
            @if (!isProfileReady()) {
              <section class="locked-panel">
                <span class="lock-icon"
                  ><app-fa-icon name="shield"></app-fa-icon
                ></span>
                <div>
                  <h2>رزروها قفل هستند</h2>
                  <p>ابتدا پروفایل منشی را تکمیل کنید.</p>
                </div>
                <button
                  class="primary-action compact"
                  type="button"
                  (click)="setSection('profile')"
                >
                  تکمیل پروفایل
                </button>
              </section>
            } @else {
              <app-secretary-reservations
                [profileReady]="isProfileReady()"
                initialTab="all"
              ></app-secretary-reservations>
            }
          }

          @if (activeSection === "reviews") {
            @if (!isProfileReady()) {
              <section class="locked-panel">
                <span class="lock-icon"
                  ><app-fa-icon name="shield"></app-fa-icon
                ></span>
                <div>
                  <h2>تایید حضور قفل است</h2>
                  <p>ابتدا پروفایل منشی را تکمیل کنید.</p>
                </div>
                <button
                  class="primary-action compact"
                  type="button"
                  (click)="setSection('profile')"
                >
                  تکمیل پروفایل
                </button>
              </section>
            } @else {
              <app-secretary-reservations
                [profileReady]="isProfileReady()"
                initialTab="queue"
              ></app-secretary-reservations>
            }
          }
        </section>
      </main>
    </section>
  `,
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
      @media (max-width: 960px) {
        .dashboard-layout {
          grid-template-columns: 1fr;
          width: min(100% - 24px, 760px);
          padding-top: 14px;
        }
        .dashboard-mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 12px;
          border: 1px solid var(--line);
          border-radius: 24px;
          background: var(--surface);
          box-shadow: var(--shadow);
        }
        .mobile-header-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .mobile-avatar {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 16px;
          background: color-mix(in srgb, var(--brand) 18%, transparent);
          color: var(--brand);
        }
        .mobile-header-info strong,
        .mobile-header-info small {
          display: block;
        }
        .mobile-header-info small {
          color: var(--muted);
          font-weight: 900;
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
          padding: 10px 10px calc(108px + env(safe-area-inset-bottom, 0px));
        }
        .dashboard-layout.secretary-mode .dashboard-sidebar {
          position: fixed;
          z-index: 80;
          inset-inline: 10px;
          bottom: calc(10px + env(safe-area-inset-bottom, 0px));
          top: auto;
          min-height: 0;
          padding: 8px;
          border-radius: 28px;
          background: var(--surface);
          box-shadow: 0 8px 22px rgba(93, 64, 32, 0.08);
          contain: layout paint;
        }
        .secretary-mode .dashboard-brand,
        .secretary-mode .dashboard-user-card,
        .secretary-mode .logout-btn {
          display: none;
        }
        .secretary-mode .dashboard-nav button {
          display: grid;
          place-items: center;
          gap: 3px;
          min-height: 54px;
          padding: 6px 4px;
          border-radius: 18px;
          text-align: center;
          font-size: 0.68rem;
          line-height: 1.2;
        }
        .secretary-mode .dashboard-nav app-fa-icon {
          color: var(--brand);
          font-size: 1.1rem;
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
export class SecretaryDashboardComponent implements OnInit {
  readonly user = this.auth.user;
  activeSection: SecretaryDashboardSection = "overview";

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

  constructor(
    private auth: AuthService,
    private router: Router,
    private secretaryApi: SecretaryDashboardService,
    private pushNotifications: PushNotificationService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {
    this.markDirty = createCoalescedMarkForCheck(this.cdr, () => false);
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
    const user = this.user();
    if (user?.role === "consultant") {
      void this.router.navigateByUrl(this.auth.dashboardUrl(user));
      return;
    }

    if (!this.isProfileReady()) {
      this.activeSection = "profile";
    }
  }

  isProfileReady(): boolean {
    return this.auth.isRoleProfileComplete(this.user());
  }

  setSection(section: SecretaryDashboardSection): void {
    if (section === "profile" && this.isProfileReady()) {
      this.activeSection = "overview";
      this.markDirty();
      return;
    }

    if (
      (section === "reservations" || section === "reviews") &&
      !this.isProfileReady()
    ) {
      this.activeSection = "profile";
      this.markDirty();
      return;
    }

    this.activeSection = section;
    this.markDirty();
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
        error: (error) => {
          const message =
            error instanceof Error && error.message
              ? error.message
              : "تکمیل پروفایل انجام نشد";

          if (
            message.includes("نقش شما") ||
            message.includes("404") ||
            message.includes("Not Found")
          ) {
            this.auth.logout();
            this.toast.show(
              "نقش شما تغییر کرده است. لطفاً دوباره وارد شوید",
              "info",
            );
            void this.router.navigateByUrl("/");
            return;
          }

          this.showFeedback(message, "error");
        },
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
