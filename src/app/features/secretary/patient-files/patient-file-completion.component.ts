import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize, switchMap } from "rxjs";
import { BaseButtonComponent, BaseNumberInputComponent } from "../../../basemadual";
import { PersianDatePickerComponent } from "../../../basemadual/forms/persian-date-picker/persian-date-picker.component";
import { toIranDateInputValue, formatIranDate, startOfIranDay } from "../../../utils/iran-datetime.util";
import { PatientFinanceApiService } from "../patient-finance/services/patient-finance-api.service";
import { PatientFinancialCaseDetails } from "../patient-finance/models/patient-finance.models";
import { PatientFile } from "./patient-file.models";
import { PatientFilesService } from "./patient-files.service";

interface ChequeDraft { amount: number | null; number: string; ownerName: string; dueDate: Date | null; installment: boolean; }
interface NoteDraft { amount: number | null; number: string; dueDate: Date | null; }

@Component({
  selector: "app-patient-file-completion",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseButtonComponent, BaseNumberInputComponent, PersianDatePickerComponent],
  templateUrl: "./patient-file-completion.component.html",
  styleUrl: "./patient-file-completion.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientFileCompletionComponent implements OnInit {
  @Input({ required: true }) file!: PatientFile;
  @Output() saved = new EventEmitter<void>();
  @Output() busyChange = new EventEmitter<boolean>();
  private readonly destroyRef = inject(DestroyRef);
  readonly today = startOfIranDay();
  readonly services = [
    { id: 1, key: "composite", label: "کامپوزیت" }, { id: 2, key: "implant", label: "ایمپلنت" },
    { id: 3, key: "laminate", label: "لمینت" }, { id: 4, key: "crown", label: "روکش" },
    { id: 5, key: "root", label: "عصب‌کشی" }, { id: 6, key: "filling", label: "ترمیم" },
    { id: 7, key: "extraction", label: "کشیدن دندان" },
  ];
  loading = true;
  saving = false;
  error = "";
  paymentMode: "cash" | "installments" = "cash";
  totalAmount: number | null = null;
  cashReceived: number | null = 0;
  serviceUnits: Record<number, number> = {};
  cheques: ChequeDraft[] = [];
  notes: NoteDraft[] = [];
  receiptConfirmed = false;
  reviewConfirmed = false;
  newFinanceConfirmed = false;
  details: PatientFinancialCaseDetails | null = null;

  constructor(private readonly filesApi: PatientFilesService, private readonly financeApi: PatientFinanceApiService,
    private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }
  get existingCases() { return (this.file.finance?.cases ?? []).filter(c => c.status !== 3); }
  linkExisting(id: string): void {
    if (this.saving || this.loading) return;
    this.setBusy(true); this.error = "";
    this.filesApi.linkFinance(this.file.id, id).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.setBusy(false)))
      .subscribe({ next: () => this.saved.emit(), error: e => { this.error = this.message(e); this.cdr.markForCheck(); } });
  }
  load(): void {
    this.loading = true; this.error = "";
    if (this.file.financeCompleted && this.file.completionFinancialCaseId) {
      this.financeApi.getCase(this.file.completionFinancialCaseId).pipe(
        takeUntilDestroyed(this.destroyRef), finalize(() => { this.loading = false; this.cdr.markForCheck(); }),
      ).subscribe({ next: data => this.details = data, error: e => this.error = this.message(e) });
    } else {
      this.filesApi.getPaperRecord(this.file.id).pipe(
        takeUntilDestroyed(this.destroyRef), finalize(() => { this.loading = false; this.cdr.markForCheck(); }),
      ).subscribe({
        next: record => {
          const total = (record.treatments ?? []).reduce((sum, t) => sum + Number(t.cost || 0), 0);
          this.totalAmount = total > 0 ? total : null;
          const units: Record<number, number> = {};
          for (const value of Object.values(record.dentalChart ?? {})) {
            const service = this.services.find(s => s.key === (value as { service?: string })?.service);
            if (service) units[service.id] = (units[service.id] ?? 0) + 1;
          }
          this.serviceUnits = units;
        },
        error: e => this.error = this.message(e),
      });
    }
  }
  toggleService(id: number, selected: boolean): void {
    if (selected) this.serviceUnits[id] = 1;
    else delete this.serviceUnits[id];
  }
  changeMode(mode: "cash" | "installments"): void {
    this.paymentMode = mode; this.receiptConfirmed = false; this.error = "";
    if (mode === "cash") { this.cheques = []; this.notes = []; this.cashReceived = 0; }
  }
  addCheque(installment: boolean): void {
    this.cheques.push({ amount: null, number: "", ownerName: "", dueDate: null, installment });
    this.receiptConfirmed = false;
  }
  addNote(): void { this.notes.push({ amount: null, number: "", dueDate: null }); this.receiptConfirmed = false; }
  get documentTotal(): number {
    return this.cheques.reduce((sum, x) => sum + Number(x.amount || 0), 0) + this.notes.reduce((sum, x) => sum + Number(x.amount || 0), 0);
  }
  get uncoveredAmount(): number { return Number(this.totalAmount || 0) - Number(this.cashReceived || 0) - this.documentTotal; }
  money(amount: number | null | undefined): string { return `${new Intl.NumberFormat("fa-IR").format(amount ?? 0)} تومان`; }
  date(value: string): string { return formatIranDate(value); }
  status(status: number): string { return ({ 1: "در انتظار وصول", 2: "پرداخت‌شده", 3: "پرداخت‌نشده", 4: "لغوشده" } as Record<number, string>)[status] ?? "—"; }
  normalizeNumber(value: string): string {
    return value.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).trim();
  }
  private validate(): string | null {
    if (this.existingCases.length && !this.newFinanceConfirmed) return "صورت‌حساب قبلی را انتخاب کنید یا ثبت یک درمان جدید و جداگانه را تأیید کنید.";
    if (!this.totalAmount || this.totalAmount <= 0) return "هزینه درمان را وارد کنید.";
    if (!Object.keys(this.serviceUnits).length || Object.values(this.serviceUnits).some(x => !Number.isInteger(x) || x < 1 || x > 100))
      return "خدمات و تعداد واحد معتبر را انتخاب کنید.";
    if (!this.receiptConfirmed) return "دریافت وجه یا تحویل گرفتن اصل اسناد را تأیید کنید.";
    if (this.paymentMode === "cash") return null;
    if (!this.cheques.length && !this.notes.length) return "حداقل یک چک یا سفته اضافه کنید.";
    if (this.cheques.some(x => !x.amount || x.amount <= 0 || !x.number.trim() || !x.ownerName.trim() || (x.installment && !x.dueDate)))
      return "شماره، مبلغ و نام صاحب چک و سررسید چک اقساط را کامل کنید.";
    if (this.notes.some(x => !x.amount || x.amount <= 0 || !x.number.trim() || !x.dueDate)) return "شماره، مبلغ و سررسید سفته را کامل کنید.";
    if (this.cashReceived === null || this.cashReceived < 0 || this.uncoveredAmount !== 0)
      return "جمع دریافتی نقدی و اسناد باید برابر هزینه درمان باشد.";
    return null;
  }
  submit(): void {
    if (this.loading || this.saving) return;
    this.error = this.validate() ?? "";
    if (this.error) return;
    this.setBusy(true);
    this.filesApi.ensureFinancialIdentity(this.file.id).pipe(
      switchMap(identity => this.filesApi.completeFinance(this.file.id, {
        patientId: identity.financialPatientId, paymentMode: this.paymentMode, totalAmount: this.totalAmount!,
        cashReceived: this.paymentMode === "cash" ? this.totalAmount! : Number(this.cashReceived || 0),
        serviceUnitCounts: this.serviceUnits,
        cheques: this.cheques.map(x => ({ amount: x.amount!, number: this.normalizeNumber(x.number), ownerName: x.ownerName.trim(),
          dueDate: x.installment && x.dueDate ? toIranDateInputValue(x.dueDate) : null, installment: x.installment })),
        notes: this.notes.map(x => ({ amount: x.amount!, number: this.normalizeNumber(x.number), dueDate: x.dueDate ? toIranDateInputValue(x.dueDate) : null })),
      })), takeUntilDestroyed(this.destroyRef), finalize(() => this.setBusy(false)),
    ).subscribe({ next: () => this.saved.emit(), error: e => { this.error = this.message(e); this.cdr.markForCheck(); } });
  }
  approve(): void {
    if (this.loading || this.saving || !this.details || !this.reviewConfirmed) return;
    this.setBusy(true); this.error = "";
    this.filesApi.approveService(this.file.id).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.setBusy(false)),
    ).subscribe({ next: () => this.saved.emit(), error: e => { this.error = this.message(e); this.cdr.markForCheck(); } });
  }
  private setBusy(value: boolean): void { this.saving = value; this.busyChange.emit(value); this.cdr.markForCheck(); }
  private message(error: any): string { return error?.error?.message || error?.message || "ثبت اطلاعات انجام نشد؛ دوباره تلاش کنید."; }
}
