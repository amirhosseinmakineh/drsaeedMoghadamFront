import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { AdminDashboardService, AdminPatientChequesDueReport } from "../../core/admin/admin-dashboard.service";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import { formatIranDate, startOfIranDay, toIranDateInputValue } from "../../utils/iran-datetime.util";

@Component({
  selector: "app-admin-due-cheques",
  standalone: true,
  imports: [BaseDatepickerComponent],
  templateUrl: "./admin-due-cheques.component.html",
  styleUrl: "./admin-due-cheques.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDueChequesComponent implements OnInit, OnDestroy {
  selectedDate = startOfIranDay(new Date());
  readonly dateLabel = { fa: "تاریخ سررسید چک", en: "Cheque due date" };
  report: AdminPatientChequesDueReport | null = null;
  loading = false;
  error = "";
  private request?: Subscription;
  constructor(private api: AdminDashboardService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  ngOnDestroy(): void { this.request?.unsubscribe(); }
  select(date: Date): void { this.selectedDate = date; this.load(); }
  today(): void { this.select(startOfIranDay(new Date())); }
  load(page = 1): void {
    this.request?.unsubscribe();
    this.loading = true;
    this.error = "";
    this.report = null;
    this.request = this.api.getPatientChequesDue(toIranDateInputValue(this.selectedDate), page).subscribe({
      next: report => { this.report = report; this.loading = false; this.cdr.markForCheck(); },
      error: error => { this.error = error?.message || "دریافت چک‌ها انجام نشد."; this.loading = false; this.cdr.markForCheck(); },
    });
  }
  date(value: string | Date): string { return formatIranDate(value); }
  money(value: number): string { return `${value.toLocaleString("fa-IR")} تومان`; }
  status(value: number): string { return ({ 1: "در انتظار وصول", 2: "وصول‌شده", 3: "وصول‌نشده", 4: "لغوشده" } as Record<number, string>)[value] || "نامشخص"; }
  get pages(): number { return this.report ? Math.ceil(this.report.totalCount / this.report.pageSize) : 0; }
}
