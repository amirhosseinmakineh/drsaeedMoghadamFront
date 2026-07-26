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
  styleUrl: "./select-dashboard.component.scss",
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
