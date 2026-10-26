 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { finalize } from "rxjs";
import { AdminDashboardService, } from "../../core/admin/admin-dashboard.service";
import { ToastService } from "../../core/toast/toast.service";

@Component({
  selector: "app-admin-lead-sheets",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./admin-lead-sheets.component.html",
  styleUrl: "./admin-lead-sheets.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLeadSheetsComponent {constructor() { AdminLeadSheetsComponent.prototype.__init.call(this);AdminLeadSheetsComponent.prototype.__init2.call(this);AdminLeadSheetsComponent.prototype.__init3.call(this);AdminLeadSheetsComponent.prototype.__init4.call(this);AdminLeadSheetsComponent.prototype.__init5.call(this);AdminLeadSheetsComponent.prototype.__init6.call(this);AdminLeadSheetsComponent.prototype.__init7.call(this);AdminLeadSheetsComponent.prototype.__init8.call(this);AdminLeadSheetsComponent.prototype.__init9.call(this);AdminLeadSheetsComponent.prototype.__init10.call(this);AdminLeadSheetsComponent.prototype.__init11.call(this);AdminLeadSheetsComponent.prototype.__init12.call(this); }
    __init() {this.api = inject(AdminDashboardService)}
    __init2() {this.toast = inject(ToastService)}
    __init3() {this.cdr = inject(ChangeDetectorRef)}

  __init4() {this.sheetName = ""}
  __init5() {this.sheets = []}
  __init6() {this.activeSheet = null}
  __init7() {this.phoneNumber = ""}
  __init8() {this.firstName = ""}
  __init9() {this.lastName = ""}
  __init10() {this.creatingSheet = false}
  __init11() {this.loadingSheets = false}
  __init12() {this.addingLead = false}

  ngOnInit() { this.loadSheets(); }

  loadSheets() {
    this.loadingSheets = true;
    this.api.getAdminLeadSheets().pipe(finalize(() => { this.loadingSheets = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (sheets) => { this.sheets = sheets; if (!this.activeSheet && sheets.length) this.activeSheet = sheets[0]; }, error: (error) => this.toast.error(this.errorMessage(error, "دریافت شیت‌ها انجام نشد.")) });
  }

  selectSheet(sheet) { this.activeSheet = sheet; }

  createSheet() {
    const name = this.sheetName.trim();
    if (!name || this.creatingSheet) return;
    this.creatingSheet = true;
    this.api.createAdminLeadSheet(name).pipe(finalize(() => { this.creatingSheet = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (sheet) => { this.sheets = [sheet, ...this.sheets]; this.activeSheet = sheet; this.sheetName = ""; this.toast.success("شیت با موفقیت ساخته شد."); },
        error: (error) => this.toast.error(this.errorMessage(error, "ساخت شیت انجام نشد.")),
      });
  }

  addLead() {
    if (!this.activeSheet || this.addingLead || !this.isLeadValid()) return;
    this.addingLead = true;
    this.api.addAdminSheetLead(this.activeSheet.id, {
      phoneNumber: this.normalizePhone(this.phoneNumber),
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
    }).pipe(finalize(() => { this.addingLead = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.phoneNumber = this.firstName = this.lastName = ""; this.toast.success("لید ثبت شد و وارد صف پردازش شیت شد."); },
        error: (error) => this.toast.error(this.errorMessage(error, "ثبت لید انجام نشد.")),
      });
  }

  isLeadValid() {
    return /^09\d{9}$/.test(this.normalizePhone(this.phoneNumber)) &&
      !!this.firstName.trim() && !!this.lastName.trim();
  }

   normalizePhone(value) {
    let phone = (value || "").trim().replace(/[\s-]/g, "");
    if (phone.startsWith("+98")) phone = "0" + phone.slice(3);
    else if (phone.startsWith("98") && phone.length === 12) phone = "0" + phone.slice(2);
    else if (phone.startsWith("9") && phone.length === 10) phone = "0" + phone;
    return phone;
  }

   errorMessage(error, fallback) {
    const payload = error instanceof HttpErrorResponse ? error.error : error;
    if (typeof payload === "string" && payload.trim()) return payload;
    return _optionalChain([(payload ), 'optionalAccess', _ => _.message]) || fallback;
  }
}
