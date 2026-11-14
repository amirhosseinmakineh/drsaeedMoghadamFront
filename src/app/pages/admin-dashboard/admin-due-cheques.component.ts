import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
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
  @Input() kind: "cheques" | "notes" = "cheques";
  get title(): string { return this.kind === "notes" ? "سفته‌ها" : "چک‌ها"; }
  fromDate = startOfIranDay(new Date());
  toDate = startOfIranDay(new Date());
  readonly fromDateLabel = { fa: "از تاریخ سررسید", en: "From due date" };
  readonly toDateLabel = { fa: "تا تاریخ سررسید", en: "To due date" };
  report: AdminPatientChequesDueReport | null = null;
  collecting = false;
  collectionMessage = "";
  loading = false;
  error = "";
  private request?: Subscription;
  constructor(private api: AdminDashboardService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  ngOnDestroy(): void { this.request?.unsubscribe(); }
  select(date: Date, end = false): void {
    if (end) this.toDate = date; else this.fromDate = date;
    this.request?.unsubscribe(); this.report = null; this.error = ""; this.loading = false;
  }
  today(): void { this.fromDate = startOfIranDay(new Date()); this.toDate = startOfIranDay(new Date()); this.load(); }
  load(page = 1): void {
    this.request?.unsubscribe();
    if (toIranDateInputValue(this.fromDate) > toIranDateInputValue(this.toDate)) {
      this.report = null; this.loading = false; this.error = "تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد."; return;
    }
    this.loading = true;
    this.error = "";
    this.report = null;
    this.request = this.api.getPatientChequesDue(toIranDateInputValue(this.fromDate), page, this.kind, toIranDateInputValue(this.toDate)).subscribe({
      next: report => { this.report = report; this.loading = false; this.cdr.markForCheck(); },
      error: error => { this.error = error?.message || "دریافت چک‌ها انجام نشد."; this.loading = false; this.cdr.markForCheck(); },
    });
  }
  collect(id: number): void {
    if (this.collecting || !window.confirm("وصول چک ضمانت فقط بابت مجموع بدهی‌های ثبت‌شده و سررسیدشده این پرونده ثبت می‌شود و اقساط مربوط تسویه می‌شوند. تأیید می‌کنید وجه وصول شده است؟")) return;
    this.collecting = true;
    this.collectionMessage = "";
    this.api.collectGuaranteeCheque(id).subscribe({
      next: result => { this.collecting = false; this.collectionMessage = result.message + " مبلغ: " + this.money(result.amount); this.load(this.report?.pageNumber ?? 1); this.cdr.markForCheck(); },
      error: error => { this.collecting = false; this.collectionMessage = error?.message || "وصول ضمانت انجام نشد."; this.cdr.markForCheck(); },
    });
  }
  date(value: string | Date): string { return formatIranDate(value); }
  money(value: number): string { return `${value.toLocaleString("fa-IR")} تومان`; }
  status(value: number): string { return ({ 1: "در انتظار وصول", 2: "وصول‌شده", 3: "وصول‌نشده", 4: "لغوشده" } as Record<number, string>)[value] || "نامشخص"; }
  get pages(): number { return this.report ? Math.ceil(this.report.totalCount / this.report.pageSize) : 0; }
}
