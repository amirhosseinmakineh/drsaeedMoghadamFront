import { BaseModalComponent } from "../../basemadual";
import { AdminConsultantRewardRulesComponent } from "./admin-consultant-reward-rules.component";
import { readRewardLines, ServiceRewardLine } from "../../core/consultant/service-reward.models";
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import { ConsultantRewardItem, ConsultantRewardService, ConsultantRewardStatus } from "../../core/consultant/consultant-reward.service";
import { ToastService } from "../../core/toast/toast.service";
import { formatIranDateTime } from "../../utils/iran-datetime.util";

@Component({ selector: "app-admin-consultant-rewards", standalone: true, imports: [CommonModule, FormsModule, AdminConsultantRewardRulesComponent, BaseModalComponent], templateUrl: "./admin-consultant-rewards.component.html", styleUrl: "./admin-consultant-rewards.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class AdminConsultantRewardsComponent implements OnInit {
  tab: "rewards" | "rules" = "rewards";
  rewardLines(item: ConsultantRewardItem): ServiceRewardLine[] { return readRewardLines(item.rewardCalculationJson); }
  items: ConsultantRewardItem[] = []; status: ConsultantRewardStatus | undefined = "Pending"; loading = false; reviewingId: number | null = null;
  constructor(private readonly api: ConsultantRewardService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading = true; this.api.adminReport(this.status).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); })).subscribe({ next: items => this.items = items, error: e => this.toast.error(e?.error?.message || "دریافت گزارش انجام نشد") }); }
  reviewItem: ConsultantRewardItem | null = null;
  reviewApproved = true;
  rejectionReason = "";
  reviewError = "";
  review(item: ConsultantRewardItem, approved: boolean): void {
    if (this.reviewingId !== null) return;
    this.reviewItem = item; this.reviewApproved = approved; this.rejectionReason = ""; this.reviewError = "";
  }
  closeReview(): void { if (this.reviewingId === null) this.reviewItem = null; }
  reviewNote(item: ConsultantRewardItem): string {
    try { return item.rewardCalculationJson ? JSON.parse(item.rewardCalculationJson).AdminReviewNote || "" : ""; }
    catch { return ""; }
  }
  confirmReview(): void {
    const item = this.reviewItem;
    if (!item || this.reviewingId !== null) return;
    if (!this.reviewApproved && item.rewardCalculationJson && !this.rejectionReason.trim()) {
      this.reviewError = "دلیل رد پاداش را وارد کنید."; return;
    }
    this.reviewingId = item.reservationId; this.reviewError = "";
    const request = this.reviewApproved ? this.api.approve(item.reservationId) : this.api.reject(item.reservationId, this.rejectionReason.trim());
    request.pipe(finalize(() => { this.reviewingId = null; this.cdr.markForCheck(); })).subscribe({
      next: result => { this.reviewItem = null; this.toast.success(result.message); this.load(); },
      error: e => this.reviewError = e?.error?.message || "بررسی پاداش انجام نشد.",
    });
  }
  money(value: number): string { return `${new Intl.NumberFormat("fa-IR").format(value)} تومان`; } date(value?: string): string { return value ? formatIranDateTime(value) : "—"; }
}
