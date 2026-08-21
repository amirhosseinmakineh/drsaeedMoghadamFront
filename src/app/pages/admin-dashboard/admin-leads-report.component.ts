import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import {
  AdminDashboardService, Consultant, LeadsReportFilters, LeadsReportItem,
  LeadsReportResponse,
} from "../../core/admin/admin-dashboard.service";
import { ToastService } from "../../core/toast/toast.service";
import { downloadBlob } from "../../utils/file-download.util";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import { toIranDateInputValue } from "../../utils/iran-datetime.util";

@Component({
  selector: "app-admin-leads-report",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDatepickerComponent],
  templateUrl: "./admin-leads-report.component.html",
  styleUrl: "./admin-leads-report.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLeadsReportComponent implements OnInit {
  filters: LeadsReportFilters = { pageNumber: 1, pageSize: 25 };
  report: LeadsReportResponse | null = null;
  consultants: Consultant[] = [];
  loading = false;
  downloading = false;
  errorMessage = "";
  fromDate?: Date;
  toDate?: Date;
  readonly fromDateLabel = { fa: "از تاریخ ایجاد لید", en: "From date" };
  readonly toDateLabel = { fa: "تا تاریخ ایجاد لید", en: "To date" };

  readonly assignmentStates = [
    [1, "جدید"], [2, "تخصیص داده شده"], [3, "تماس گرفته شده"],
    [4, "در انتظار"], [5, "تبدیل شده"], [6, "منقضی"], [7, "رد شده"],
  ];
  readonly assignmentTypes = [[1, "آنی"], [3, "بیمار مشاور"]];
  readonly callResults = [
    [1, "تماس موفق"], [2, "تبدیل به رزرو"], [3, "رد شده"], [4, "بدون پاسخ"],
    [5, "شماره اشتباه"], [6, "نیاز به پیگیری"], [7, "مشغول"], [8, "قطع تماس بیمار"],
  ];

  constructor(
    private readonly api: AdminDashboardService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.api.getConsultantsList({ pageNumber: 1, pageSize: 500 }).subscribe({
      next: ({ items }) => { this.consultants = items; this.cdr.markForCheck(); },
      error: () => this.toast.error("دریافت فهرست مشاوران انجام نشد"),
    });
    this.load();
  }

  applyFilters(): void {
    if (this.loading) return;
    if (this.filters.from && this.filters.to && this.filters.from > this.filters.to) {
      this.toast.error("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد");
      return;
    }
    this.filters.pageNumber = 1;
    this.load();
  }

  resetFilters(): void {
    if (this.loading) return;
    this.filters = { pageNumber: 1, pageSize: 25 };
    this.fromDate = undefined;
    this.toDate = undefined;
    this.load();
  }

  setFromDate(date: Date): void {
    this.fromDate = date;
    this.filters.from = toIranDateInputValue(date);
  }

  setToDate(date: Date): void {
    this.toDate = date;
    this.filters.to = toIranDateInputValue(date);
  }

  changePage(page: number): void {
    if (page < 1 || page > (this.report?.totalPages || 1) || this.loading) return;
    this.filters.pageNumber = page;
    this.load();
  }

  load(): void {
    if (this.loading) return;
    this.loading = true;
    this.errorMessage = "";
    this.cdr.markForCheck();
    this.api.getLeadsReport(this.filters)
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (report) => { this.report = report; this.cdr.markForCheck(); },
        error: (error) => {
          this.errorMessage = error?.message || "دریافت گزارش لیدها انجام نشد";
          this.toast.error(this.errorMessage);
        },
      });
  }

  download(): void {
    if (this.downloading) return;
    this.downloading = true;
    this.cdr.markForCheck();
    this.api.exportFilteredLeadsReport(this.filters)
      .pipe(finalize(() => { this.downloading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (blob) => {
          downloadBlob(blob, `leads-report-${new Date().toISOString().slice(0, 10)}.csv`);
          this.toast.success("فایل گزارش لیدها دانلود شد");
        },
        error: (error) => this.toast.error(error?.message || "دانلود گزارش انجام نشد"),
      });
  }

  consultantId(item: Consultant): number { return item.profileId ?? item.ProfileId ?? 0; }
  consultantName(item: Consultant): string {
    return [item.firstName || item.FirstName, item.lastName || item.LastName].filter(Boolean).join(" ") || `مشاور ${this.consultantId(item)}`;
  }
  trackLead(_: number, item: LeadsReportItem): number { return item.leadId; }
}
