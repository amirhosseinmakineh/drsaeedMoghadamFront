import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import { ConsultantRewardItem, ConsultantRewardService, ConsultantRewardStatus } from "../../core/consultant/consultant-reward.service";
import { ToastService } from "../../core/toast/toast.service";
import { formatIranDateTime } from "../../utils/iran-datetime.util";

@Component({ selector: "app-admin-consultant-rewards", standalone: true, imports: [CommonModule, FormsModule], templateUrl: "./admin-consultant-rewards.component.html", styleUrl: "./admin-consultant-rewards.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class AdminConsultantRewardsComponent implements OnInit {
  items: ConsultantRewardItem[] = []; status: ConsultantRewardStatus | undefined = "Pending"; loading = false; reviewingId: number | null = null;
  constructor(private readonly api: ConsultantRewardService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading = true; this.api.adminReport(this.status).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); })).subscribe({ next: items => this.items = items, error: e => this.toast.error(e?.error?.message || "دریافت گزارش انجام نشد") }); }
  review(item: ConsultantRewardItem, approved: boolean): void { if (this.reviewingId || !confirm(approved ? `پاداش ${item.consultantName} تأیید و کیف پول شارژ شود؟` : "این پاداش رد شود؟")) return; this.reviewingId = item.reservationId; const request = approved ? this.api.approve(item.reservationId) : this.api.reject(item.reservationId); request.pipe(finalize(() => { this.reviewingId = null; this.cdr.markForCheck(); })).subscribe({ next: result => { this.toast.success(result.message); this.load(); }, error: e => this.toast.error(e?.error?.message || "بررسی پاداش انجام نشد") }); }
  money(value: number): string { return `${new Intl.NumberFormat("fa-IR").format(value)} تومان`; } date(value?: string): string { return value ? formatIranDateTime(value) : "—"; }
}
