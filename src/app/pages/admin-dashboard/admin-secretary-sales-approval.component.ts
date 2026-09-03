import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BaseConfirmDialogComponent } from "../../basemadual/overlays/confirm-dialog/confirm-dialog.component";
import { ToastService } from "../../core/toast/toast.service";
import { SecretarySale, SecretarySaleService, SecretarySaleStatus, saleStatusLabel, toman } from "../../features/secretary/sales/models/secretary-sales.models";
import { SecretarySalesService } from "../../features/secretary/sales/services/secretary-sales.service";
import { formatIranDateTime } from "../../utils/iran-datetime.util";

@Component({ selector: "app-admin-secretary-sales-approval", standalone: true, imports: [FormsModule, BaseConfirmDialogComponent], templateUrl: "./admin-secretary-sales-approval.component.html", styleUrl: "./admin-secretary-sales.shared.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class AdminSecretarySalesApprovalComponent implements OnInit {
  readonly statuses = SecretarySaleStatus; readonly statusLabel = saleStatusLabel; readonly toman = toman; readonly date = formatIranDateTime;
  items: SecretarySale[] = []; services: SecretarySaleService[] = []; search = ""; status?: SecretarySaleStatus; serviceId?: number; fromDate = ""; toDate = ""; page = 1; totalPages = 1; loading = false; reviewing = false; target: SecretarySale | null = null; reviewAction: "approve" | "reject" = "approve";
  private readonly destroyRef = inject(DestroyRef);
  constructor(private readonly api: SecretarySalesService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.api.adminServices({ page: 1, pageSize: 100 }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => { this.services = result.items; this.cdr.markForCheck(); }); this.load(); }
  apply(): void { this.page = 1; this.load(); }
  ask(sale: SecretarySale, action: "approve" | "reject"): void { this.target = sale; this.reviewAction = action; }
  closeReview(): void { if (!this.reviewing) this.target = null; }
  get reviewMessage(): string { if (!this.target) return ""; return this.reviewAction === "approve" ? `فروش ${this.target.serviceTitle} برای ${this.target.patientName} تأیید شود؟ با تأیید، مبلغ ${this.toman(this.target.secretaryReward)} به کیف پول ${this.target.secretaryName} اضافه خواهد شد.` : `فروش ${this.target.serviceTitle} برای ${this.target.patientName} رد شود؟ کیف پول منشی تغییری نخواهد کرد.`; }
  review(): void {
    if (!this.target || this.reviewing) return; const id = this.target.saleId; this.reviewing = true; const request = this.reviewAction === "approve" ? this.api.approve(id) : this.api.reject(id);
    request.pipe(finalize(() => { this.reviewing = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => { if (!result.isSuccess) { this.toast.error(result.message); return; } const item = this.items.find((x) => x.saleId === id); if (item) { item.status = this.reviewAction === "approve" ? SecretarySaleStatus.Approved : SecretarySaleStatus.Rejected; item.reviewedAt = new Date().toISOString(); } this.toast.success(result.message); this.target = null; this.cdr.markForCheck(); }, error: (error) => this.toast.error(error?.error?.message || "بررسی فروش انجام نشد.") });
  }
  changePage(page: number): void { if (page < 1 || page > this.totalPages || page === this.page) return; this.page = page; this.load(); }
  private load(): void { this.loading = true; this.api.adminSales({ search: this.search, status: this.status, serviceId: this.serviceId, fromDate: this.fromDate, toDate: this.toDate, page: this.page, pageSize: 10 }).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => { this.items = result.items; this.totalPages = Math.max(result.totalPages, 1); }, error: () => this.toast.error("دریافت فروش‌های منشی انجام نشد.") }); }
}
