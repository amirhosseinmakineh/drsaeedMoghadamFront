import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/auth/auth.service";
import { PushNotificationService } from "../../core/push/push-notification.service";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";
import { SecretaryReservationAttendanceReviewsComponent } from "./secretary-reservation-attendance-reviews.component";

@Component({
  selector: "app-secretary-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FaIconComponent,
    SecretaryReservationAttendanceReviewsComponent,
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
          <button type="button" class="active">
            <app-fa-icon name="calendar"></app-fa-icon>
            <span>تایید حضور</span>
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
            <h2>تایید حضور، {{ displayName() }}</h2>
          </header>

          <app-secretary-reservation-attendance-reviews></app-secretary-reservation-attendance-reviews>
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
      .dashboard-hero {
        border: 1px solid var(--line);
        background: color-mix(in srgb, var(--surface) 86%, transparent);
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
      .brand-mark {
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        border-radius: 16px;
        background: color-mix(in srgb, var(--brand) 18%, transparent);
        color: var(--brand);
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
        display: grid;
        place-items: center;
        width: 62px;
        height: 62px;
        border-radius: 24px;
        background: color-mix(in srgb, var(--brand) 18%, transparent);
        color: var(--brand);
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
      .secondary-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 48px;
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 12px 16px;
        background: var(--surface-muted);
        color: var(--text);
        font: inherit;
        font-weight: 950;
      }
      .dashboard-content {
        display: grid;
        gap: 16px;
      }
      .secretary-shell {
        display: grid;
        gap: 16px;
      }
      .dashboard-hero {
        padding: 22px 24px;
        border-radius: 30px;
      }
      .dashboard-hero span {
        display: inline-flex;
        margin-bottom: 8px;
        padding: 5px 12px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--brand) 14%, transparent);
        color: var(--brand);
        font-weight: 950;
      }
      .dashboard-hero h2 {
        margin: 0;
        font-size: 1.55rem;
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
        .dashboard-hero {
          border-radius: 24px;
          background: var(--surface);
          box-shadow: 0 8px 22px rgba(93, 64, 32, 0.06);
          contain: paint;
          overflow: hidden;
        }
      }
    `,
  ],
})
export class SecretaryDashboardComponent {
  readonly user = this.auth.user;

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

  constructor(
    private auth: AuthService,
    private router: Router,
    private pushNotifications: PushNotificationService,
  ) {}

  logout(): void {
    this.pushNotifications.resetRegisteredTokenCache();
    this.auth.logout();
    this.router.navigateByUrl("/");
  }
}
