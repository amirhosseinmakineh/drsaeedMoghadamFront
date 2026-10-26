import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, computed } from "@angular/core";






import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";








@Component({
  selector: "app-select-dashboard",
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./select-dashboard.component.html",
  styleUrl: "./select-dashboard.component.scss",
})
export class SelectDashboardComponent {
    __init() {this.optionCopy


 = {
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
  }}

   __init2() {this.dashboardOptions = computed(() => {
    return this.auth
      .selectableDashboardRoles()
      .map((role) => ({
        role,
        ...this.optionCopy[role],
      }));
  })}

  constructor(
     auth,
     router,
     pushNotifications,
  ) {;this.auth = auth;this.router = router;this.pushNotifications = pushNotifications;SelectDashboardComponent.prototype.__init.call(this);SelectDashboardComponent.prototype.__init2.call(this);
    const user = this.auth.user();
    if (!user) {
      void this.router.navigateByUrl("/");
      return;
    }

    if (!this.auth.needsRoleSelection(user)) {
      void this.router.navigateByUrl(this.auth.dashboardUrl(user));
    }
  }

  selectDashboard(role) {
    this.auth.setActiveRole(role);

    if (role === "consultant") {
      void this.pushNotifications.registerForConsultantOnLogin();
    } else {
      void this.pushNotifications.syncForCurrentProfile();
    }

    void this.router.navigateByUrl(this.auth.dashboardUrl(this.auth.user(), role));
  }

  logout() {
    this.pushNotifications.resetRegisteredTokenCache();
    this.auth.logout();
    void this.router.navigateByUrl("/");
  }
}
