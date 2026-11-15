import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { finalize, Subscription } from "rxjs";
import { BaseModalComponent } from "../../basemadual";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import { ToastService } from "../../core/toast/toast.service";
import { formatIranDate, formatIranDateTime, fromIranDateInputValue, toIranDateInputValue } from "../../utils/iran-datetime.util";
import { AdminInstallment, AdminInstallmentsFilters, AdminInstallmentsReport, AdminInstallmentsService } from "./admin-installments.service";

@Component({
  selector: "app-admin-installments",
  standalone: true,
  imports: [FormsModule, BaseDatepickerComponent, BaseModalComponent],
  templateUrl: "./admin-installments.component.html",
  styleUrl: "./admin-installments.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminInstallmentsComponent {
  private readonly destroyRef = inject(DestroyRef);
  private request?: Subscription;
  filters: AdminInstallmentsFilters = { search: "", status: "" };
  fromDate?: Date;
  toDate?: Date;
  readonly fromLabel = { fa: "از سررسید", en: "From due date" };
  readonly toLabel = { fa: "تا سررسید", en: "To due date" };
  report: AdminInstallmentsReport | null = null;
  loading = false;
  saving = false;
  error = "";
  paymentError = "";
  selected: AdminInstallment | null = null;

  constructor(private readonly api: AdminInstallmentsService, private readonly cdr: ChangeDetectorRef,
    private readonly toast: ToastService) {}
  ngOnInit(): void { this.load(); }
  get pages(): number { return Math.max(1, Math.ceil((this.report?.totalCount ?? 0) / (this.report?.pageSize ?? 50))); }
  load(page = 1): void {
    this.request?.unsubscribe();
    if (this.filters.fromDate && this.filters.toDate && this.filters.fromDate > this.filters.toDate) {
      this.loading = false; this.report = null; this.error = "تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد."; return;
    }
    this.loading = true; this.error = ""; this.report = null;
    this.request = this.api.list({ ...this.filters, search: this.filters.search.trim() }, page)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({ next: report => { this.report = report; }, error: e => this.error = this.message(e) });
  }
  setDate(value: Date, end = false): void {
    if (end) { this.toDate = value; this.filters.toDate = toIranDateInputValue(value); }
    else { this.fromDate = value; this.filters.fromDate = toIranDateInputValue(value); }
  }
  clear(): void { this.filters = { search: "", status: "" }; this.fromDate = undefined; this.toDate = undefined; this.load(); }
  openPayment(row: AdminInstallment): void {
    if (this.saving || row.paidAtUtc) return;
    this.selected = row; this.paymentError = "";
  }
  closePayment(): void { if (!this.saving) { this.selected = null; this.paymentError = ""; } }
  recordPayment(): void {
    if (!this.selected || this.saving) return;
    this.saving = true; this.paymentError = "";
    const page = this.report?.pageNumber ?? 1;
    this.api.recordPayment(this.selected).pipe(takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.saving = false; this.cdr.markForCheck(); })).subscribe({
      next: () => { this.selected = null; this.toast.success("پرداخت قسط در حساب بیمار ثبت شد."); this.load(page); },
      error: e => this.paymentError = this.message(e),
    });
  }
  money(value: number): string { return `${value.toLocaleString("fa-IR")} تومان`; }
  dueDate(value: string): string { return formatIranDate(fromIranDateInputValue(value)); }
  paidDate(value: string): string { return formatIranDateTime(value); }
  status(row: AdminInstallment): string { return row.status === "paid" ? "پرداخت‌شده" : row.status === "overdue" ? "معوق" : "پرداخت‌نشده / جاری"; }
  private message(e: any): string { return e?.error?.message || e?.message || "عملیات اقساط انجام نشد؛ دوباره تلاش کنید."; }
}
