 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";

import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import { downloadBlob, reportFileName } from "../../utils/file-download.util";
import { formatIranDateTime, toIranDateInputValue } from "../../utils/iran-datetime.util";
import { AdminPatientReferralsComponent } from "../../features/patient-referrals/admin/pages/admin-patient-referrals/admin-patient-referrals.component";
import { AdminSecretarySalesApprovalComponent } from "./admin-secretary-sales-approval.component";
import { AdminConsultantRewardsComponent } from "./admin-consultant-rewards.component";





@Component({
  selector: "app-admin-accounting-center",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseDatepickerComponent,
    AdminSecretarySalesApprovalComponent,
    AdminConsultantRewardsComponent,
    AdminPatientReferralsComponent,
  ],
  templateUrl: "./admin-accounting-center.component.html",
  styleUrl: "./admin-accounting-center.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAccountingCenterComponent  {
  __init() {this.tab = "overview"}
  __init2() {this.report = null}
  __init3() {this.filters = { search: "" }}
  
  
  __init4() {this.loading = false}
  __init5() {this.exporting = false}
   __init6() {this.fromDateLabel = { fa: "از تاریخ", en: "From date" }}
   __init7() {this.toDateLabel = { fa: "تا تاریخ", en: "To date" }}

  constructor(
      api,
      toast,
      cdr,
  ) {;this.api = api;this.toast = toast;this.cdr = cdr;AdminAccountingCenterComponent.prototype.__init.call(this);AdminAccountingCenterComponent.prototype.__init2.call(this);AdminAccountingCenterComponent.prototype.__init3.call(this);AdminAccountingCenterComponent.prototype.__init4.call(this);AdminAccountingCenterComponent.prototype.__init5.call(this);AdminAccountingCenterComponent.prototype.__init6.call(this);AdminAccountingCenterComponent.prototype.__init7.call(this);}

  ngOnInit() {
    this.load();
  }

  selectTab(tab) {
    this.tab = tab;
  }

  setFromDate(date) {
    this.fromDate = date;
    this.filters.fromDate = toIranDateInputValue(date);
  }

  setToDate(date) {
    this.toDate = date;
    this.filters.toDate = toIranDateInputValue(date);
  }

  clearFilters() {
    this.fromDate = undefined;
    this.toDate = undefined;
    this.filters = { search: "" };
    this.load();
  }

  load() {
    if (this.filters.fromDate && this.filters.toDate && this.filters.fromDate > this.filters.toDate) {
      this.toast.error("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.");
      return;
    }
    this.loading = true;
    this.api.report(this.filters).pipe(finalize(() => {
      this.loading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: (report) => this.report = report,
      error: (error) => this.toast.error(_optionalChain([error, 'optionalAccess', _ => _.error, 'optionalAccess', _2 => _2.message]) || "دریافت گزارش جامع حسابداری انجام نشد."),
    });
  }

  export() {
    if (this.exporting) return;
    this.exporting = true;
    this.api.export(this.filters).pipe(finalize(() => {
      this.exporting = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: (blob) => {
        downloadBlob(blob, reportFileName("admin-accounting"));
        this.toast.success("خروجی حسابداری آماده شد.");
      },
      error: () => this.toast.error("ساخت خروجی حسابداری انجام نشد."),
    });
  }

  roleLabel(role) {
    return role === "Secretary" ? "منشی" : "مشاور";
  }

  money(value) {
    return `${new Intl.NumberFormat("fa-IR").format(value || 0)} تومان`;
  }

  date(value) {
    return value ? formatIranDateTime(value) : "—";
  }
}
