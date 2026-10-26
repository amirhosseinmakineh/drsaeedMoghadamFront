 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { ChangeDetectionStrategy, DestroyRef, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BaseConfirmDialogComponent } from "../../basemadual/overlays/confirm-dialog/confirm-dialog.component";

import { SecretarySaleStatus, saleStatusLabel, toman } from "../../features/secretary/sales/models/secretary-sales.models";

import { formatIranDateTime } from "../../utils/iran-datetime.util";

@Component({ selector: "app-admin-secretary-sales-approval", standalone: true, imports: [FormsModule, BaseConfirmDialogComponent], templateUrl: "./admin-secretary-sales-approval.component.html", styleUrl: "./admin-secretary-sales.shared.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class AdminSecretarySalesApprovalComponent  {
   __init() {this.statuses = SecretarySaleStatus}  __init2() {this.statusLabel = saleStatusLabel}  __init3() {this.toman = toman}  __init4() {this.date = formatIranDateTime}
  __init5() {this.items = []} __init6() {this.services = []} __init7() {this.search = ""}   __init8() {this.fromDate = ""} __init9() {this.toDate = ""} __init10() {this.page = 1} __init11() {this.totalPages = 1} __init12() {this.loading = false} __init13() {this.reviewing = false} __init14() {this.target = null} __init15() {this.reviewAction = "approve"}
    __init16() {this.destroyRef = inject(DestroyRef)}
  constructor(  api,   toast,   cdr) {;this.api = api;this.toast = toast;this.cdr = cdr;AdminSecretarySalesApprovalComponent.prototype.__init.call(this);AdminSecretarySalesApprovalComponent.prototype.__init2.call(this);AdminSecretarySalesApprovalComponent.prototype.__init3.call(this);AdminSecretarySalesApprovalComponent.prototype.__init4.call(this);AdminSecretarySalesApprovalComponent.prototype.__init5.call(this);AdminSecretarySalesApprovalComponent.prototype.__init6.call(this);AdminSecretarySalesApprovalComponent.prototype.__init7.call(this);AdminSecretarySalesApprovalComponent.prototype.__init8.call(this);AdminSecretarySalesApprovalComponent.prototype.__init9.call(this);AdminSecretarySalesApprovalComponent.prototype.__init10.call(this);AdminSecretarySalesApprovalComponent.prototype.__init11.call(this);AdminSecretarySalesApprovalComponent.prototype.__init12.call(this);AdminSecretarySalesApprovalComponent.prototype.__init13.call(this);AdminSecretarySalesApprovalComponent.prototype.__init14.call(this);AdminSecretarySalesApprovalComponent.prototype.__init15.call(this);AdminSecretarySalesApprovalComponent.prototype.__init16.call(this);}
  ngOnInit() { this.api.adminServices({ page: 1, pageSize: 100 }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => { this.services = result.items; this.cdr.markForCheck(); }); this.load(); }
  apply() { this.page = 1; this.load(); }
  ask(sale, action) { this.target = sale; this.reviewAction = action; }
  closeReview() { if (!this.reviewing) this.target = null; }
  get reviewMessage() { if (!this.target) return ""; return this.reviewAction === "approve" ? `فروش ${this.target.serviceTitle} برای ${this.target.patientName} تأیید شود؟ با تأیید، مبلغ ${this.toman(this.target.secretaryReward)} به کیف پول ${this.target.secretaryName} اضافه خواهد شد.` : `فروش ${this.target.serviceTitle} برای ${this.target.patientName} رد شود؟ کیف پول منشی تغییری نخواهد کرد.`; }
  review() {
    if (!this.target || this.reviewing) return; const id = this.target.saleId; this.reviewing = true; const request = this.reviewAction === "approve" ? this.api.approve(id) : this.api.reject(id);
    request.pipe(finalize(() => { this.reviewing = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => { if (!result.isSuccess) { this.toast.error(result.message); return; } this.toast.success(result.message); this.target = null; this.load(); }, error: (error) => this.toast.error(_optionalChain([error, 'optionalAccess', _ => _.error, 'optionalAccess', _2 => _2.message]) || "بررسی فروش انجام نشد.") });
  }
  changePage(page) { if (page < 1 || page > this.totalPages || page === this.page) return; this.page = page; this.load(); }
   load() { this.loading = true; this.api.adminSales({ search: this.search, status: this.status, serviceId: this.serviceId, fromDate: this.fromDate, toDate: this.toDate, page: this.page, pageSize: 10 }).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => { this.items = result.items; this.totalPages = Math.max(result.totalPages, 1); }, error: () => this.toast.error("دریافت فروش‌های منشی انجام نشد.") }); }
}
