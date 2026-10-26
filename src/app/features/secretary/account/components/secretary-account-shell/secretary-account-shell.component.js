 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { ChangeDetectionStrategy, computed } from "@angular/core";
import { RouterLink } from "@angular/router";

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
  __init() {this.mobileSidebarOpen = false}
  __init2() {this.accountingMenuOpen = true}
  
  
  
   __init3() {this.displayName = computed(() => {
    const user = this.auth.user();
    return [_optionalChain([user, 'optionalAccess', _3 => _3.firstName]), _optionalChain([user, 'optionalAccess', _4 => _4.lastName])].filter(Boolean).join(" ") || "کاربر";
  })}

  constructor(  auth,   router) {;this.auth = auth;this.router = router;SecretaryAccountShellComponent.prototype.__init.call(this);SecretaryAccountShellComponent.prototype.__init2.call(this);SecretaryAccountShellComponent.prototype.__init3.call(this);
    this.patientFinanceActive = this.router.url.startsWith("/secretary/patient-finance");
    this.patientFilesActive = this.router.url.startsWith("/secretary/accounting/patient-files");
    this.clinicAccountingActive = !this.patientFinanceActive && !this.patientFilesActive;
  }

  logout() {
    this.auth.logout();
    void this.router.navigateByUrl("/");
  }
}
