 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";


import { formatIranDateTime } from "../../utils/iran-datetime.util";

@Component({ selector: "app-admin-consultant-rewards", standalone: true, imports: [CommonModule, FormsModule], templateUrl: "./admin-consultant-rewards.component.html", styleUrl: "./admin-consultant-rewards.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class AdminConsultantRewardsComponent  {
  __init() {this.items = []} __init2() {this.status = "Pending"} __init3() {this.loading = false} __init4() {this.reviewingId = null}
  constructor(  api,   toast,   cdr) {;this.api = api;this.toast = toast;this.cdr = cdr;AdminConsultantRewardsComponent.prototype.__init.call(this);AdminConsultantRewardsComponent.prototype.__init2.call(this);AdminConsultantRewardsComponent.prototype.__init3.call(this);AdminConsultantRewardsComponent.prototype.__init4.call(this);}
  ngOnInit() { this.load(); }
  load() { this.loading = true; this.api.adminReport(this.status).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); })).subscribe({ next: items => this.items = items, error: e => this.toast.error(_optionalChain([e, 'optionalAccess', _ => _.error, 'optionalAccess', _2 => _2.message]) || "دریافت گزارش انجام نشد") }); }
  review(item, approved) { if (this.reviewingId || !confirm(approved ? `پاداش ${item.consultantName} تأیید و کیف پول شارژ شود؟` : "این پاداش رد شود؟")) return; this.reviewingId = item.reservationId; const request = approved ? this.api.approve(item.reservationId) : this.api.reject(item.reservationId); request.pipe(finalize(() => { this.reviewingId = null; this.cdr.markForCheck(); })).subscribe({ next: result => { this.toast.success(result.message); this.load(); }, error: e => this.toast.error(_optionalChain([e, 'optionalAccess', _3 => _3.error, 'optionalAccess', _4 => _4.message]) || "بررسی پاداش انجام نشد") }); }
  money(value) { return `${new Intl.NumberFormat("fa-IR").format(value)} تومان`; } date(value) { return value ? formatIranDateTime(value) : "—"; }
}
