import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize, switchMap } from "rxjs";
import { BaseButtonComponent, BaseNumberInputComponent } from "../../../basemadual";
import { PersianDatePickerComponent } from "../../../basemadual/forms/persian-date-picker/persian-date-picker.component";
import { toIranDateInputValue, fromIranDateInputValue, formatIranDate, startOfIranDay } from "../../../utils/iran-datetime.util";
import { PatientFinanceApiService } from "../patient-finance/services/patient-finance-api.service";
import { PatientFinancialCaseDetails } from "../patient-finance/models/patient-finance.models";
import { CompletePatientFileRequest, PatientFile } from "./patient-file.models";
import { PatientFilesService } from "./patient-files.service";
import { toothServiceIds } from "./dental-chart/dental-chart.models";

interface ChequeDraft { id?: number; amount: number | null; number: string; ownerName: string; dueDate: Date | null; installment: boolean; isGuarantee?: boolean; }
interface InstallmentDraft { amount: number | null; dueDate: Date | null; }
interface NoteDraft { id?: number; isGuarantee?: boolean; amount: number | null; number: string; dueDate: Date | null; }

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
  @Input() editFinance = false;
  @Output() saved = new EventEmitter<void>();
  @Output() busyChange = new EventEmitter<boolean>();
  @Output() editChartRequested = new EventEmitter<void>();
  private readonly destroyRef = inject(DestroyRef);
  readonly today = startOfIranDay(new Date());
  editHash = "";
  private editPatientId = "";
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
  installmentDescription = "";
  totalAmount: number | null = null;
  cashReceived: number | null = 0;
  treatmentPaid = 0;
  serviceUnits: Record<number, number> = {};
  cheques: ChequeDraft[] = [];
  notes: NoteDraft[] = [];
  installments: InstallmentDraft[] = [];
  useInstallmentTable = false;
  addInstallment(): void { this.installments.push({ amount: null, dueDate: null }); this.receiptConfirmed = false; }
  get installmentTotal(): number { return this.useInstallmentTable ? this.installments.reduce((sum, x) => sum + Number(x.amount || 0), 0) : 0; }
  receiptConfirmed = false;
  reviewConfirmed = false;
  newFinanceConfirmed = false;
  details: PatientFinancialCaseDetails | null = null;
  existingInstallments: { id: number; amount: number; dueDate: string; paidAtUtc: string | null }[] = [];
  payingInstallmentId: number | null = null;
  loadInstallments(caseId: string): void {
    this.filesApi.getInstallments(caseId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rows => { this.existingInstallments = rows; this.cdr.markForCheck(); },
      error: e => { this.error = this.message(e); this.cdr.markForCheck(); }
    });
  }
  markInstallmentPaid(id: number): void {
    if (!this.details || this.payingInstallmentId !== null || !confirm("پرداخت این قسط ثبت شود؟")) return;
    const caseId = this.details.case.id;
    this.payingInstallmentId = id;
    this.filesApi.payInstallment(caseId, id).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => {
      this.payingInstallmentId = null; this.cdr.markForCheck();
    })).subscribe({
      next: () => {
        this.loadInstallments(caseId);
        this.financeApi.getCase(caseId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: data => { this.details = data; this.cdr.markForCheck(); }
        });
      },
      error: e => { this.error = this.message(e); this.cdr.markForCheck(); }
    });
  }

  constructor(private readonly filesApi: PatientFilesService, private readonly financeApi: PatientFinanceApiService,
    private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }
  get existingCases() { return (this.file.finance?.cases ?? []).filter(c => c.status !== 3); }
  linkExisting(id: string): void {
    if (this.saving || this.loading) return;
    if (!this.hasChartServices) { this.error = "ابتدا دندان‌ها و خدمات را در چارت پرونده ثبت کنید."; return; }
    this.setBusy(true); this.error = "";
    this.filesApi.linkFinance(this.file.id, id).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.setBusy(false)))
      .subscribe({ next: () => this.saved.emit(), error: e => { this.error = this.message(e); this.cdr.markForCheck(); } });
  }
  load(): void {
    this.loading = true; this.error = "";
    if (this.editFinance) {
      this.editHash = "";
      this.filesApi.getFinanceEdit(this.file.id).pipe(
        takeUntilDestroyed(this.destroyRef), finalize(() => { this.loading = false; this.cdr.markForCheck(); }),
      ).subscribe({ next: draft => {
        const f = draft.finance;
        this.editHash = draft.expectedFinanceHash; this.editPatientId = f.patientId;
        this.paymentMode = f.paymentMode; this.totalAmount = f.totalAmount; this.cashReceived = f.cashReceived;
        this.installmentDescription = f.installmentDescription ?? "";
        this.serviceUnits = { ...f.serviceUnitCounts };
        this.cheques = f.cheques.map(x => ({ ...x, dueDate: x.dueDate ? fromIranDateInputValue(x.dueDate) : null }));
        this.notes = f.notes.map(x => ({ ...x, dueDate: x.dueDate ? fromIranDateInputValue(x.dueDate) : null }));
        // Installment due dates are calendar days; the edit API may also include a time portion.
        this.installments = (f.installments ?? []).map(x => ({ amount: x.amount, dueDate: x.dueDate ? fromIranDateInputValue(x.dueDate.slice(0, 10)) : null }));
        this.useInstallmentTable = this.installments.length > 0;
        this.receiptConfirmed = false;
      }, error: e => this.error = this.message(e) });
      return;
    }
    if (this.file.financeCompleted && this.file.completionFinancialCaseId) {
      this.financeApi.getCase(this.file.completionFinancialCaseId).pipe(
        takeUntilDestroyed(this.destroyRef), finalize(() => { this.loading = false; this.cdr.markForCheck(); }),
      ).subscribe({ next: data => { this.details = data; this.loadInstallments(data.case.id); }, error: e => this.error = this.message(e) });
    } else {
      this.filesApi.getPaperRecord(this.file.id).pipe(
        takeUntilDestroyed(this.destroyRef), finalize(() => { this.loading = false; this.cdr.markForCheck(); }),
      ).subscribe({
        next: record => {
          const total = (record.treatments ?? []).reduce((sum, t) => sum + Number(t.cost || 0), 0);
          this.totalAmount = total > 0 ? total : null;
          this.treatmentPaid = (record.treatments ?? []).reduce((sum, t) => sum + Number(t.paidAmount || 0), 0);
          this.cashReceived = this.treatmentPaid;
          const units: Record<number, number> = {};
          for (const [tooth, value] of Object.entries(record.dentalChart ?? {})) {
            const number = Number(tooth);
            if (!Number.isInteger(number) || number < 1 || number > 32 || String(number) !== tooth) continue;
            for (const id of toothServiceIds(value)) {
              const service = this.services.find(s => s.key === id);
              if (service) units[service.id] = (units[service.id] ?? 0) + 1;
            }
          }
          this.serviceUnits = units;
        },
        error: e => this.error = this.message(e),
      });
    }
  }
  get hasChartServices(): boolean { return Object.keys(this.serviceUnits).length > 0; }
  get chartServices() { return this.services.filter(s => !!this.serviceUnits[s.id]); }
  changeMode(mode: "cash" | "installments"): void {
    this.paymentMode = mode; this.receiptConfirmed = false; this.error = "";
    if (mode === "cash") { this.cheques = []; this.notes = []; this.installments = []; this.useInstallmentTable = false; this.cashReceived = this.treatmentPaid; }
  }
  addCheque(isGuarantee: boolean): void {
    this.cheques.push({ amount: null, number: "", ownerName: "", dueDate: null, installment: true, isGuarantee });
    this.receiptConfirmed = false;
  }
  addNote(): void { this.notes.push({ isGuarantee: true, amount: null, number: "", dueDate: null }); this.receiptConfirmed = false; }
  get documentTotal(): number {
    return this.cheques.reduce((sum, x) => sum + Number(x.amount || 0), 0) + this.notes.reduce((sum, x) => sum + Number(x.amount || 0), 0);
  }
  get guaranteeTotal(): number { return this.cheques.filter(x => x.isGuarantee === true).reduce((sum, x) => sum + Number(x.amount || 0), 0) + this.notes.filter(x => x.isGuarantee !== false).reduce((sum, x) => sum + Number(x.amount || 0), 0); }
  get paymentDocumentTotal(): number { return this.documentTotal - this.guaranteeTotal; }
  get paymentExcess(): number { return Math.max(0, Number(this.cashReceived || 0) + this.paymentDocumentTotal + this.installmentTotal - Number(this.totalAmount || 0)); }
  get uncoveredAmount(): number { return Math.max(0, Number(this.totalAmount || 0) - Number(this.cashReceived || 0) - this.documentTotal - this.installmentTotal); }
  get excessGuarantee(): number { return Math.max(0, this.guaranteeTotal - Math.max(0, Number(this.totalAmount || 0) - Number(this.cashReceived || 0) - this.paymentDocumentTotal - this.installmentTotal)); }
  money(amount: number | null | undefined): string { return `${new Intl.NumberFormat("fa-IR").format(amount ?? 0)} تومان`; }
  date(value: string): string { return formatIranDate(value); }
  status(status: number): string { return ({ 1: "در انتظار وصول", 2: "پرداخت‌شده", 3: "پرداخت‌نشده", 4: "لغوشده" } as Record<number, string>)[status] ?? "—"; }
  normalizeNumber(value: string): string {
    return value.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).trim();
  }
  validationAttempted = false;
  documentError(kind: "cheque" | "note" | "installment", index: number): string {
    const row = kind === "cheque" ? this.cheques[index] : kind === "note" ? this.notes[index] : this.installments[index];
    if (!row) return "";
    const missing: string[] = [];
    if (!Number.isFinite(row.amount) || Number(row.amount) <= 0) missing.push("مبلغ معتبر و بیشتر از صفر");
    if ("number" in row && (typeof row.number !== "string" || !row.number.trim())) missing.push("شماره سند");
    if ("ownerName" in row && (typeof row.ownerName !== "string" || !row.ownerName.trim())) missing.push("نام صاحب چک");
    if ((!("installment" in row) || row.installment) && (!(row.dueDate instanceof Date) || !Number.isFinite(row.dueDate.getTime()))) missing.push("تاریخ سررسید معتبر");
    return missing.length ? missing.join("، ") + " را وارد کنید." : "";
  }
  private validate(): string | null {
    if (this.installmentDescription.length > 4000) return "توضیحات نحوه پرداخت اقساط حداکثر ۴۰۰۰ کاراکتر است.";
    if (!this.editFinance && this.existingCases.length && !this.newFinanceConfirmed) return "صورت‌حساب قبلی را انتخاب کنید یا ثبت یک درمان جدید و جداگانه را تأیید کنید.";
    if (this.editFinance && !this.editHash) return "ابتدا اطلاعات مالی را دوباره دریافت کنید.";
    if (!Number.isFinite(this.totalAmount) || !this.totalAmount || this.totalAmount <= 0) return "هزینه درمان را وارد کنید.";
    if (!Object.keys(this.serviceUnits).length || Object.values(this.serviceUnits).some(x => !Number.isInteger(x) || x < 1 || x > 100))
      return "ابتدا دندان‌ها و خدمات را در چارت پرونده ثبت کنید؛ خدمات مالی فقط از چارت خوانده می‌شوند.";
    if (!this.receiptConfirmed) return "دریافت وجه یا تحویل گرفتن اصل اسناد را تأیید کنید.";
    if (this.paymentMode === "cash") return null;
    if (!this.cheques.length && !this.notes.length && !(this.useInstallmentTable && this.installments.length)) return "جدول اقساط را تکمیل کنید یا یک سند پرداخت اضافه کنید؛ ضمانت اختیاری است.";
    if (this.useInstallmentTable && !this.installments.length) return "حداقل یک قسط وارد کنید.";
    for (const kind of ["installment", "cheque", "note"] as const) {
      const rows = kind === "installment" ? (this.useInstallmentTable ? this.installments : []) : kind === "cheque" ? this.cheques : this.notes;
      for (let i = 0; i < rows.length; i++) {
        const error = this.documentError(kind, i);
        if (error) return (kind === "cheque" ? "چک" : kind === "note" ? "سفته" : "قسط") + " ردیف " + (i + 1) + ": " + error;
      }
    }
    if (!Number.isFinite(this.cashReceived) || this.cashReceived === null || this.cashReceived < this.treatmentPaid || this.uncoveredAmount !== 0 || this.paymentExcess > 0)
      return "نقد و اسناد پرداخت نباید از هزینه درمان بیشتر شوند؛ مانده باید با جدول اقساط یا اسناد پوشش داده شود؛ دریافت ضمانت اختیاری است.";
    return null;
  }
  submit(): void {
    if (this.loading || this.saving) return;
    this.validationAttempted = true;
    this.error = this.validate() ?? "";
    if (this.error) return;
    this.setBusy(true);
    const body: CompletePatientFileRequest = {
        patientId: this.editPatientId, paymentMode: this.paymentMode, totalAmount: this.totalAmount!,
        installmentDescription: this.installmentDescription.trim() || null,
        cashReceived: this.paymentMode === "cash" ? this.totalAmount! : Number(this.cashReceived || 0),
        serviceUnitCounts: this.serviceUnits,
        installments: this.useInstallmentTable ? this.installments.map(x => ({ amount: x.amount!, dueDate: toIranDateInputValue(x.dueDate!) })) : [],
        cheques: this.cheques.map(x => ({ id: x.id, amount: x.amount!, number: this.normalizeNumber(x.number), ownerName: x.ownerName.trim(),
          dueDate: x.installment && x.dueDate ? toIranDateInputValue(x.dueDate) : null, installment: x.installment, isGuarantee: x.isGuarantee === true })),
        notes: this.notes.map(x => ({ id: x.id, isGuarantee: x.isGuarantee !== false, amount: x.amount!, number: this.normalizeNumber(x.number), dueDate: x.dueDate ? toIranDateInputValue(x.dueDate) : null })),
    };
    const request = this.editFinance ? this.filesApi.updateFinance(this.file.id, { expectedFinanceHash: this.editHash, finance: body }) :
      this.filesApi.ensureFinancialIdentity(this.file.id).pipe(
        switchMap(identity => this.filesApi.completeFinance(this.file.id, { ...body, patientId: identity.financialPatientId })));
    request.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.setBusy(false)),
    ).subscribe({ next: () => this.saved.emit(), error: e => { this.error = this.message(e); this.cdr.markForCheck(); } });
  }
  confirmFinance(): void {
    if (this.loading || this.saving || !this.reviewConfirmed) return;
    this.setBusy(true); this.error = "";
    this.filesApi.confirmFinance(this.file.id).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.setBusy(false)),
    ).subscribe({ next: () => this.saved.emit(), error: e => { this.error = this.message(e); this.cdr.markForCheck(); } });
  }
  confirmProfile(): void {
    if (this.loading || this.saving || !this.reviewConfirmed) return;
    this.setBusy(true); this.error = "";
    this.filesApi.confirmProfile(this.file.id).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.setBusy(false)),
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
  private message(error: any): string {
    const body = error?.error;
    if (typeof body === "string" && body.trim() && !body.trim().startsWith("<")) return body;
    const errors = body?.errors;
    if (errors && typeof errors === "object") {
      const messages = Object.values(errors).flat().filter((x): x is string => typeof x === "string" && !!x.trim());
      if (messages.length) return messages.join(" — ");
    }
    if (body?.message || body?.detail || body?.title) return body.message || body.detail || body.title;
    if (error?.status === 0) return "ارتباط با سرور برقرار نشد؛ اتصال اینترنت را بررسی و دوباره تلاش کنید.";
    return "ثبت اطلاعات انجام نشد؛ دوباره تلاش کنید.";
  }
}
