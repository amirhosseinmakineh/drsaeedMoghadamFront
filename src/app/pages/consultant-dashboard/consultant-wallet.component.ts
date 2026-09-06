import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { finalize } from "rxjs";
import { ConsultantRewardItem, ConsultantRewardService, ConsultantWalletReport } from "../../core/consultant/consultant-reward.service";
import { formatIranDateTime } from "../../utils/iran-datetime.util";

@Component({ selector: "app-consultant-wallet", standalone: true, imports: [CommonModule], templateUrl: "./consultant-wallet.component.html", styleUrl: "./consultant-wallet.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class ConsultantWalletComponent implements OnInit {
  report: ConsultantWalletReport = { balance: 0, totalApprovedRewards: 0, approvedPatientCount: 0, pendingPatientCount: 0, items: [] };
  loading = false;
  constructor(private readonly api: ConsultantRewardService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading = true; this.api.wallet().pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); })).subscribe(report => this.report = report); }
  money(value: number): string { return `${new Intl.NumberFormat("fa-IR").format(value || 0)} تومان`; }
  date(value?: string): string { return value ? formatIranDateTime(value) : "—"; }
  status(item: ConsultantRewardItem): string { return item.status === "Approved" ? "واریز شده" : item.status === "Rejected" ? "رد شده" : "در انتظار ادمین"; }
}
