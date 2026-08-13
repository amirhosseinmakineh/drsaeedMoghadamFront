import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import {
  AdminDashboardService,
  Consultant,
  DailyReservationReportItem,
  DailyReservationsReport,
  DailyReservationsReportFilters,
} from "../../core/admin/admin-dashboard.service";
import { ToastService } from "../../core/toast/toast.service";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import { downloadBlob } from "../../utils/file-download.util";
import {
  formatIranDateTime,
  nowInIran,
  toIranDateInputValue,
} from "../../utils/iran-datetime.util";

@Component({
  selector: "app-admin-daily-reservations-report",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDatepickerComponent],
  templateUrl: "./admin-daily-reservations-report.component.html",
  styleUrl: "./admin-daily-reservations-report.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDailyReservationsReportComponent implements OnInit {
  selectedDate = nowInIran();
  consultantProfileId: number | null = null;
  requestStatus: number | null = null;
  consultants: Consultant[] = [];
  consultantsLoading = false;
  consultantsLoadError = "";
  report: DailyReservationsReport | null = null;
  loading = false;
  downloading = false;
  errorMessage = "";

  readonly datePickerLabel = { fa: "تاریخ ثبت رزرو", en: "Created date" };
  readonly requestStatuses = [
    { value: 1, label: "در انتظار بررسی منشی" },
    { value: 2, label: "تایید شده" },
    { value: 3, label: "زمان‌بندی مجدد" },
    { value: 4, label: "رد شده" },
    { value: 5, label: "لغو شده" },
    { value: 6, label: "در انتظار تایید بیمار" },
    { value: 7, label: "نیازمند پیگیری" },
  ];

  constructor(
    private readonly adminApi: AdminDashboardService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadConsultants(true);
    this.loadReport();
  }

  setDate(date: Date): void {
    this.selectedDate = date;
    this.cdr.markForCheck();
  }

  loadReport(): void {
    if (this.loading) return;
    this.loading = true;
    this.errorMessage = "";
    this.cdr.markForCheck();
    this.adminApi
      .getDailyReservationsReport(this.filters())
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (report) => { this.report = report; this.cdr.markForCheck(); },
        error: (error) => {
          this.errorMessage = this.errorText(error);
          this.toast.error(this.errorMessage);
          this.cdr.markForCheck();
        },
      });
  }

  download(): void {
    if (this.downloading) return;
    const filters = this.filters();
    this.downloading = true;
    this.cdr.markForCheck();
    this.adminApi
      .exportDailyReservationsReport(filters)
      .pipe(finalize(() => { this.downloading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (blob) => {
          downloadBlob(blob, `daily-reservations-${filters.date!.replaceAll("-", "")}.csv`);
          this.toast.success("فایل گزارش روزانه رزروها دانلود شد");
        },
        error: (error) => this.toast.error(this.errorText(error)),
      });
  }

  formatDateTime(value: string | null | undefined): string {
    return formatIranDateTime(value);
  }

  trackReservation(_: number, item: DailyReservationReportItem): number {
    return item.reservationId;
  }

  consultantId(consultant: Consultant): number {
    return consultant.profileId ?? consultant.ProfileId!;
  }

  consultantName(consultant: Consultant): string {
    const fullName = [
      consultant.firstName || consultant.FirstName,
      consultant.lastName || consultant.LastName,
    ].filter(Boolean).join(" ");
    return fullName || `مشاور ${this.consultantId(consultant)}`;
  }

  private filters(): DailyReservationsReportFilters {
    return {
      date: toIranDateInputValue(this.selectedDate),
      ...(this.consultantProfileId !== null
        ? { consultantProfileId: this.consultantProfileId }
        : {}),
      ...(this.requestStatus ? { requestStatus: this.requestStatus } : {}),
    };
  }

  loadConsultants(force = false): void {
    if (this.consultantsLoading) return;
    if (!force && this.consultants.length) return;

    this.consultantsLoading = true;
    this.consultantsLoadError = "";
    this.cdr.markForCheck();
    this.adminApi
      .getConsultantsList({ pageNumber: 1, pageSize: 500 })
      .pipe(finalize(() => {
        this.consultantsLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: ({ items }) => {
          this.consultants = items.filter((item) =>
            Number.isFinite(this.consultantId(item)),
          );
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.consultantsLoadError = this.errorText(error);
          this.toast.error(this.consultantsLoadError);
          this.cdr.markForCheck();
        },
      });
  }

  private errorText(error: unknown): string {
    return error instanceof Error && error.message
      ? error.message
      : "خطا در دریافت گزارش. لطفاً دوباره تلاش کنید.";
  }
}
