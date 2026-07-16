import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed } from "@angular/core";
import { Router } from "@angular/router";
import {
  AuthRole,
  AuthService,
} from "../../core/auth/auth.service";
import { PushNotificationService } from "../../core/push/push-notification.service";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";

interface DashboardOption {
  role: AuthRole;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: "app-select-dashboard",
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./select-dashboard.component.html",
  styles: [
    `
      .select-dashboard-page {
        display: grid;
        place-items: center;
        min-height: 100vh;
        padding: 24px 16px calc(24px + env(safe-area-inset-bottom, 0px));
        background:
          radial-gradient(
            circle at top right,
            color-mix(in srgb, var(--brand) 16%, transparent),
            transparent 42%
          ),
          var(--surface-muted, #eefafa);
      }
      .select-dashboard-card {
        display: grid;
        gap: 18px;
        width: min(100%, 560px);
        padding: 28px 24px;
        border: 1px solid var(--line, #dbe6ee);
        border-radius: 32px;
        background: var(--surface, #fff);
        box-shadow: 0 18px 42px rgba(93, 64, 32, 0.1);
      }
      .select-badge {
        display: inline-flex;
        width: fit-content;
        padding: 6px 12px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--brand, #a8793f) 14%, transparent);
        color: var(--brand, #a8793f);
        font-weight: 950;
      }
      h1 {
        margin: 0;
        font-size: clamp(1.35rem, 4vw, 1.8rem);
        line-height: 1.5;
      }
      p {
        margin: 0;
        color: var(--muted, #786a59);
        font-weight: 900;
        line-height: 1.8;
      }
      .dashboard-options {
        display: grid;
        gap: 12px;
      }
      .dashboard-option {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 14px;
        width: 100%;
        padding: 16px 18px;
        border: 1px solid var(--line, #dbe6ee);
        border-radius: 22px;
        background: var(--surface-muted, #eefafa);
        color: var(--text, #14222e);
        font: inherit;
        text-align: start;
        cursor: pointer;
        transition:
          transform 0.18s ease,
          border-color 0.18s ease,
          box-shadow 0.18s ease;
      }
      .dashboard-option:hover {
        transform: translateY(-1px);
        border-color: color-mix(in srgb, var(--brand, #a8793f) 34%, var(--line));
        box-shadow: 0 12px 28px rgba(93, 64, 32, 0.08);
      }
      .option-icon {
        display: grid;
        place-items: center;
        width: 52px;
        height: 52px;
        border-radius: 18px;
        background: color-mix(in srgb, var(--brand, #a8793f) 16%, transparent);
        color: var(--brand, #a8793f);
        font-size: 1.2rem;
      }
      .option-copy {
        display: grid;
        gap: 4px;
      }
      .option-copy strong {
        font-size: 1rem;
      }
      .option-copy small {
        color: var(--muted, #786a59);
        font-weight: 900;
        line-height: 1.6;
      }
      .option-arrow {
        color: var(--brand, #a8793f);
        font-size: 1.2rem;
        font-weight: 900;
      }
      .logout-link {
        justify-self: center;
        border: 0;
        background: transparent;
        color: var(--muted, #786a59);
        font: inherit;
        font-weight: 900;
        cursor: pointer;
      }
      @media (max-width: 560px) {
        .select-dashboard-card {
          padding: 22px 18px;
          border-radius: 28px;
        }
        .dashboard-option {
          grid-template-columns: auto 1fr;
        }
        .option-arrow {
          display: none;
        }
      }
    `,
  ],
})
export class SelectDashboardComponent {
  private readonly optionCopy: Record<
    AuthRole,
    { title: string; description: string; icon: string }
  > = {
    admin: {
      title: "داشبورد ادمین",
      description: "مدیریت کاربران، مشاوران، لیدها و رزروها",
      icon: "dashboard",
    },
    consultant: {
      title: "داشبورد مشاور",
      description: "مدیریت لیدها، گزارش تماس و رزروهای مشاوره",
      icon: "doctor",
    },
    secretary: {
      title: "داشبورد منشی",
      description: "مدیریت رزروها و تایید حضور بیماران",
      icon: "calendar",
    },
    patient: {
      title: "داشبورد بیمار",
      description: "مشاهده وضعیت حساب و خدمات کلینیک",
      icon: "user",
    },
  };

  readonly dashboardOptions = computed(() => {
    return this.auth
      .selectableDashboardRoles()
      .map((role) => ({
        role,
        ...this.optionCopy[role],
      }));
  });

  constructor(
    private auth: AuthService,
    private router: Router,
    private pushNotifications: PushNotificationService,
  ) {
    const user = this.auth.user();
    if (!user) {
      void this.router.navigateByUrl("/");
      return;
    }

    if (!this.auth.needsRoleSelection(user)) {
      void this.router.navigateByUrl(this.auth.dashboardUrl(user));
    }
  }

  selectDashboard(role: AuthRole): void {
    this.auth.setActiveRole(role);

    if (role === "consultant") {
      void this.pushNotifications.registerForConsultantOnLogin();
    } else {
      void this.pushNotifications.syncForCurrentProfile();
    }

    void this.router.navigateByUrl(this.auth.dashboardUrl(this.auth.user(), role));
  }

  logout(): void {
    this.pushNotifications.resetRegisteredTokenCache();
    this.auth.logout();
    void this.router.navigateByUrl("/");
  }
}
