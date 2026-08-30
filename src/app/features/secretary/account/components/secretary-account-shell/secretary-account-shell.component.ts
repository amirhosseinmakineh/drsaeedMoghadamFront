import { ChangeDetectionStrategy, Component, computed } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../../../core/auth/auth.service";
import { FaIconComponent } from "../../../../../shared/ui/fa-icon/fa-icon.component";

@Component({
  selector: "app-secretary-account-shell",
  standalone: true,
  imports: [RouterLink, FaIconComponent],
  templateUrl: "./secretary-account-shell.component.html",
  styleUrls: [
    "../../../../../pages/secretary-dashboard/secretary-dashboard.component.scss",
    "./secretary-account-shell.component.scss",
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryAccountShellComponent {
  mobileSidebarOpen = false;
  readonly displayName = computed(() => {
    const user = this.auth.user();
    return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "کاربر";
  });

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl("/");
  }
}
