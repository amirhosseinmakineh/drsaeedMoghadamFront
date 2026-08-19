import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import {
  AdminDashboardService,
  LeadCallReportExportFilters,
} from "../../core/admin/admin-dashboard.service";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import { downloadBlob } from "../../utils/file-download.util";
import { ToastService } from "../../core/toast/toast.service";
import { nowInIran, toIranDateInputValue } from "../../utils/iran-datetime.util";

@Component({
  selector: "app-admin-lead-call-reports",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDatepickerComponent],
  templateUrl: "./admin-lead-call-reports.component.html",
  styleUrl: "./admin-lead-call-reports.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLeadCallReportsComponent {
  fromDate: Date | null = null;
  toDate: Date | null = null;
  downloading = false;
  feedback = "";
  feedbackType: "success" | "error" = "success";
  readonly fromDatePickerLabel = { fa: "از تاریخ", en: "From date" };
  readonly toDatePickerLabel = { fa: "تا تاریخ", en: "To date" };

  constructor(
    private adminApi: AdminDashboardService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  setFromDate(date: Date): void {
    this.fromDate = date;
    this.markDirty();
  }
  setToDate(date: Date): void {
    this.toDate = date;
    this.markDirty();
  }

  resetFilters(): void {
    this.fromDate = null;
    this.toDate = null;
    this.feedback = "";
    this.markDirty();
  }

validateFilters(): string | null {
  if (this.fromDate && this.toDate) {
    const from = new Date(this.fromDate);
    from.setHours(0, 0, 0, 0);

    const to = new Date(this.toDate);
    to.setHours(0, 0, 0, 0);

    if (from.getTime() > to.getTime()) {
      return "تاریخ شروع نباید بعد از تاریخ پایان باشد";
    }
  }

  return null;
}

  download(): void {
    const validationError = this.validateFilters();
    if (validationError) {
      this.showFeedback(validationError, "error");
      return;
    }

    const filters: LeadCallReportExportFilters = {
      ...(this.fromDate ? { from: this.toDateString(this.fromDate) } : {}),
      ...(this.toDate ? { to: this.toDateString(this.toDate) } : {}),
    };

    this.downloading = true;
    this.feedback = "";
    this.markDirty();
    this.adminApi
      .exportLeadCallReports(filters)
      .pipe(
        finalize(() => {
          this.downloading = false;
          this.markDirty();
        }),
      )
      .subscribe({
        next: (blob) => {
          downloadBlob(blob, this.fileName(filters));
          this.showFeedback(
            "فایل گزارش تماس درخواست‌های مشاوره دانلود شد",
            "success",
          );
        },
        error: (error) =>
          this.showFeedback(
            error instanceof Error && error.message
              ? error.message
              : "خطا در دریافت گزارش. لطفاً دوباره تلاش کنید.",
            "error",
          ),
      });
  }

  private fileName(filters: LeadCallReportExportFilters): string {
    const today = this.toDateString(nowInIran()).replaceAll("-", "");
    const from = filters.from?.replaceAll("-", "") ?? today;
    const to = filters.to?.replaceAll("-", "") ?? from;
    return `lead-call-reports-${from}-${to}.csv`;
  }

  private toDateString(date: Date): string {
    return toIranDateInputValue(date);
  }
  private showFeedback(message: string, type: "success" | "error"): void {
    this.feedback = message;
    this.feedbackType = type;
    if (type === "success") {
      this.toast.success(message);
    } else {
      this.toast.error(message);
    }
    this.markDirty();
  }

  private markDirty(): void {
    this.cdr.markForCheck();
  }
}
