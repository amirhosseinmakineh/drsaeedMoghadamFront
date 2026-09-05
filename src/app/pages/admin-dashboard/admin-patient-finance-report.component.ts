import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import {
  AdminDashboardService,
  PatientFinanceReportFilters,
  PatientFinanceReportResponse,
} from "../../core/admin/admin-dashboard.service";
import { ToastService } from "../../core/toast/toast.service";
import { downloadBlob } from "../../utils/file-download.util";
import { formatIranDateTime } from "../../utils/iran-datetime.util";

@Component({
  selector: "app-admin-patient-finance-report",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./admin-patient-finance-report.component.html",
  styleUrl: "./admin-patient-finance-report.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPatientFinanceReportComponent implements OnInit {
  filters: PatientFinanceReportFilters = { page: 1, pageSize: 20 };
  report: PatientFinanceReportResponse | null = null;
  loading = false;
  downloading = false;
  errorMessage = "";

  readonly services = [
    { value: 1, label: "کامپوزیت" },
    { value: 2, label: "ایمپلنت" },
    { value: 3, label: "لمینت" },
  ];

  constructor(
    private readonly api: AdminDashboardService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void { this.load(); }

  load(resetPage = false): void {
    if (this.loading) return;
    if (resetPage) this.filters.page = 1;
    this.loading = true;
    this.errorMessage = "";
    this.api.getPatientFinanceReport(this.filters)
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: report => { this.report = report; this.cdr.markForCheck(); },
        error: error => {
          this.errorMessage = error?.message || "دریافت گزارش انجام نشد";
          this.toast.error(this.errorMessage);
        },
      });
  }

  clear(): void {
    this.filters = { page: 1, pageSize: 20 };
    this.load();
  }

  download(): void {
    if (this.downloading) return;
    this.downloading = true;
    this.api.exportPatientFinanceReport(this.filters)
      .pipe(finalize(() => { this.downloading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: blob => {
          downloadBlob(blob, `patient-finance-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
          this.toast.success("خروجی اکسل حسابداری بیماران دانلود شد");
        },
        error: error => this.toast.error(error?.message || "دریافت فایل انجام نشد"),
      });
  }

  goTo(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.filters.page) return;
    this.filters.page = page;
    this.load();
  }

  money(value: number): string {
    return `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 3 }).format(value || 0)} تومان`;
  }

  agreement(value: number): string { return value === 1 ? "پیش‌پرداخت" : value === 2 ? "ودیعه" : "—"; }
  status(value: number): string { return value === 1 ? "فعال" : value === 2 ? "تسویه‌شده" : value === 3 ? "لغوشده" : "—"; }
  date(value: string): string { return formatIranDateTime(value); }
  trackCase(_: number, item: { caseId: string }): string { return item.caseId; }

  get totalPages(): number {
    return Math.max(1, Math.ceil((this.report?.totalCount || 0) / this.filters.pageSize));
  }
}
