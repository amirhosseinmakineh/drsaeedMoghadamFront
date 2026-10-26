import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, } from "@angular/core";
import { finalize } from "rxjs";

import { formatIranDateTime } from "../../utils/iran-datetime.util";

@Component({ selector: "app-consultant-wallet", standalone: true, imports: [CommonModule], templateUrl: "./consultant-wallet.component.html", styleUrl: "./consultant-wallet.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class ConsultantWalletComponent  {
  __init() {this.report = { balance: 0, totalApprovedRewards: 0, approvedPatientCount: 0, pendingPatientCount: 0, items: [] }}
  __init2() {this.loading = false}
  constructor(  api,   cdr) {;this.api = api;this.cdr = cdr;ConsultantWalletComponent.prototype.__init.call(this);ConsultantWalletComponent.prototype.__init2.call(this);}
  ngOnInit() { this.load(); }
  load() { this.loading = true; this.api.wallet().pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); })).subscribe(report => this.report = report); }
  money(value) { return `${new Intl.NumberFormat("fa-IR").format(value || 0)} تومان`; }
  date(value) { return value ? formatIranDateTime(value) : "—"; }
  status(item) { return item.status === "Approved" ? "واریز شده" : item.status === "Rejected" ? "رد شده" : "در انتظار ادمین"; }
}
