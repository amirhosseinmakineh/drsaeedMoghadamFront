import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminDashboardService, LeadCallReportExportFilters } from '../../core/admin/admin-dashboard.service';
import { BaseDatepickerComponent } from '../../shared/base/base-datepicker/base-datepicker.component';

@Component({
  selector: 'app-admin-lead-call-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDatepickerComponent],
  template: `
    <section class="admin-panel report-panel">
      <header class="panel-heading">
        <div>
          <span>گزارش‌ها</span>
          <h2>خروجی گزارش تماس لیدها</h2>
          <p>بازه تاریخ را انتخاب کنید و فایل CSV قابل باز شدن در Excel را دریافت کنید. اگر تاریخی انتخاب نشود، گزارش روز جاری دانلود می‌شود.</p>
        </div>
        <button class="secondary-action compact" type="button" [disabled]="downloading" (click)="resetFilters()">پاک‌سازی</button>
      </header>

      <form class="filter-grid" (ngSubmit)="download()">
        <label>
          از تاریخ
          <app-base-datepicker
            [label]="fromDatePickerLabel"
            [selectedDate]="fromDate ?? undefined"
            [maxDate]="toDate ?? undefined"
            [allowToday]="true"
            (dateChange)="setFromDate($event)"
          ></app-base-datepicker>
        </label>
        <label>
          تا تاریخ
          <app-base-datepicker
            [label]="toDatePickerLabel"
            [selectedDate]="toDate ?? undefined"
            [minDate]="fromDate ?? undefined"
            [allowToday]="true"
            (dateChange)="setToDate($event)"
          ></app-base-datepicker>
        </label>
        <button class="primary-filter" type="submit" [disabled]="downloading">{{ downloading ? 'در حال دانلود...' : 'دانلود Excel/CSV' }}</button>
      </form>

      @if (feedback) {
        <p class="feedback" [class.error]="feedbackType === 'error'" [class.success]="feedbackType === 'success'">{{ feedback }}</p>
      }

      <div class="report-hint">
        <strong>ستون‌های خروجی:</strong>
        <span>LeadId، LeadName، LeadPhone، ConsultantName، ConsultantPhone، CallResult، ReportDescription، ReportSubmittedAt، ContactedAt، PatientCity، PatientRegion، BusinessName، AttendanceProbabilityPercent، AssignmentType، LeadState</span>
      </div>
    </section>
  `,
  styles: [`
    .report-panel{display:grid;gap:16px;padding:18px;border:1px solid var(--line);border-radius:30px;background:color-mix(in srgb,var(--surface) 88%,transparent);box-shadow:var(--shadow)}
    .panel-heading{display:flex;justify-content:space-between;gap:12px}.panel-heading span{display:inline-flex;margin-bottom:8px;padding:5px 12px;border-radius:999px;background:color-mix(in srgb,var(--brand) 14%,transparent);color:var(--brand);font-weight:950}.panel-heading h2{margin:0;font-size:1.35rem}.panel-heading p{margin:8px 0 0;color:var(--muted)}
    .filter-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:end}label{display:grid;gap:8px;color:var(--muted);font-weight:950}.primary-filter{min-height:50px;border:0;border-radius:18px;background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#1b1712;font:inherit;font-weight:950}.secondary-action{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border:1px solid var(--line);border-radius:18px;padding:12px 16px;background:var(--surface-muted);color:var(--text);font:inherit;font-weight:950}.compact{min-height:40px;border-radius:999px;padding:9px 13px;font-size:.86rem}.feedback{margin:0;padding:10px 12px;border-radius:18px;font-weight:900}.feedback.error{background:color-mix(in srgb,var(--danger) 14%,transparent);color:#fecaca}.feedback.success{background:color-mix(in srgb,var(--success) 14%,transparent);color:#bbf7d0}.report-hint{display:grid;gap:8px;padding:14px;border:1px dashed var(--line);border-radius:22px;color:var(--muted);line-height:1.9}.report-hint strong{color:var(--text)}@media (max-width:760px){.report-panel{padding:14px;border-radius:24px}.filter-grid{grid-template-columns:1fr}}
  `]
})
export class AdminLeadCallReportsComponent {
  fromDate: Date | null = null;
  toDate: Date | null = null;
  downloading = false;
  feedback = '';
  feedbackType: 'success' | 'error' = 'success';
  readonly fromDatePickerLabel = { fa: 'از تاریخ', en: 'From date' };
  readonly toDatePickerLabel = { fa: 'تا تاریخ', en: 'To date' };

  constructor(private adminApi: AdminDashboardService) {}

  setFromDate(date: Date): void { this.fromDate = date; }
  setToDate(date: Date): void { this.toDate = date; }

  resetFilters(): void {
    this.fromDate = null;
    this.toDate = null;
    this.feedback = '';
  }

  download(): void {
    if (this.fromDate && this.toDate && this.startOfDay(this.fromDate).getTime() > this.startOfDay(this.toDate).getTime()) {
      this.showFeedback('تاریخ شروع نباید بعد از تاریخ پایان باشد', 'error');
      return;
    }

    const filters: LeadCallReportExportFilters = {
      ...(this.fromDate ? { from: this.toDateString(this.fromDate) } : {}),
      ...(this.toDate ? { to: this.toDateString(this.toDate) } : {})
    };

    this.downloading = true;
    this.feedback = '';
    this.adminApi.exportLeadCallReports(filters).pipe(finalize(() => this.downloading = false)).subscribe({
      next: blob => {
        this.saveBlob(blob, this.fileName(filters));
        this.showFeedback('فایل گزارش تماس لیدها دانلود شد', 'success');
      },
      error: error => this.showFeedback(error instanceof Error && error.message ? error.message : 'دانلود گزارش انجام نشد', 'error')
    });
  }

  private saveBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  private fileName(filters: LeadCallReportExportFilters): string {
    const today = this.toDateString(new Date()).replaceAll('-', '');
    const from = filters.from?.replaceAll('-', '') ?? today;
    const to = filters.to?.replaceAll('-', '') ?? from;
    return `lead-call-reports-${from}-${to}.csv`;
  }

  private toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private startOfDay(date: Date): Date { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
  private showFeedback(message: string, type: 'success' | 'error'): void { this.feedback = message; this.feedbackType = type; }
}
