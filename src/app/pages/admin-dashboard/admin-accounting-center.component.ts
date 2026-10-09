import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import { ToastService } from "../../core/toast/toast.service";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import { downloadBlob, reportFileName } from "../../utils/file-download.util";
import { formatIranDateTime, toIranDateInputValue } from "../../utils/iran-datetime.util";
import { AdminPatientReferralsComponent } from "../../features/patient-referrals/admin/pages/admin-patient-referrals/admin-patient-referrals.component";
import { AdminSecretarySalesApprovalComponent } from "./admin-secretary-sales-approval.component";
import { AdminConsultantRewardsComponent } from "./admin-consultant-rewards.component";
import { AdminAccountingFilters, AdminAccountingReport, AdminStaffAccountingRow } from "./admin-accounting.models";
import { AdminAccountingService } from "./admin-accounting.service";

type AccountingTab = "overview" | "secretaries" | "consultants" | "referrals";

@Component({
  selector: "app-admin-accounting-center",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseDatepickerComponent,
    AdminSecretarySalesApprovalComponent,
    AdminConsultantRewardsComponent,
    AdminPatientReferralsComponent,
  ],
  templateUrl: "./admin-accounting-center.component.html",
  styleUrl: "./admin-accounting-center.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAccountingCenterComponent implements OnInit {
  tab: AccountingTab = "overview";
  report: AdminAccountingReport | null = null;
  filters: AdminAccountingFilters = { search: "" };
  fromDate?: Date;
  toDate?: Date;
  loading = false;
  exporting = false;
  readonly fromDateLabel = { fa: "از تاریخ", en: "From date" };
  readonly toDateLabel = { fa: "تا تاریخ", en: "To date" };

  constructor(
    private readonly api: AdminAccountingService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  selectTab(tab: AccountingTab): void {
    this.tab = tab;
  }

  setFromDate(date: Date): void {
    this.fromDate = date;
    this.filters.fromDate = toIranDateInputValue(date);
  }

  setToDate(date: Date): void {
    this.toDate = date;
    this.filters.toDate = toIranDateInputValue(date);
  }

  clearFilters(): void {
    this.fromDate = undefined;
    this.toDate = undefined;
    this.filters = { search: "" };
    this.load();
  }

  load(): void {
    if (this.filters.fromDate && this.filters.toDate && this.filters.fromDate > this.filters.toDate) {
      this.toast.error("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.");
      return;
    }
    this.loading = true;
    this.api.report(this.filters).pipe(finalize(() => {
      this.loading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: (report) => this.report = report,
      error: (error) => this.toast.error(error?.error?.message || "دریافت گزارش جامع حسابداری انجام نشد."),
    });
  }

  export(): void {
    if (this.exporting) return;
    this.exporting = true;
    this.api.export(this.filters).pipe(finalize(() => {
      this.exporting = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: (blob) => {
        downloadBlob(blob, reportFileName("admin-accounting"));
        this.toast.success("خروجی حسابداری آماده شد.");
      },
      error: () => this.toast.error("ساخت خروجی حسابداری انجام نشد."),
    });
  }

  roleLabel(role: AdminStaffAccountingRow["role"]): string {
    return role === "Secretary" ? "منشی" : "مشاور";
  }

  money(value: number): string {
    return `${new Intl.NumberFormat("fa-IR").format(value || 0)} تومان`;
  }

  date(value?: string): string {
    return value ? formatIranDateTime(value) : "—";
  }
}
