import { CommonModule } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnDestroy, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { finalize, forkJoin, map, Observable, of, Subscription, switchMap } from "rxjs";
import { ToastService } from "../../../../../core/toast/toast.service";
import { PersianDatePickerComponent } from "../../../../../basemadual/forms/persian-date-picker/persian-date-picker.component";
import { BaseNumberInputComponent } from "../../../../../basemadual/forms/number-input/number-input.component";
import { BaseModalComponent } from "../../../../../basemadual/overlays/modal/modal.component";
import { SecretaryAccountShellComponent } from "../../../account/components/secretary-account-shell/secretary-account-shell.component";
import { PatientFilesService } from "../../../patient-files/patient-files.service";
import { CommitmentStatus, DebtStatus, FinancialAgreementType, FinancialCaseStatus, PaginatedResult, PatientCheque, PatientDebt, PatientFinancialCase, PatientFinancialCaseDetails, PatientFinancialCaseSummary, PatientFinancialCommitment, PatientFinancialTransaction, PatientGuid, PatientPromissoryNote } from "../../models/patient-finance.models";
import { PatientFinanceApiService } from "../../services/patient-finance-api.service";

type FinanceTab = "cases" | "create" | "cheques" | "notes" | "debts" | "transactions" | "due";
type ListItem = PatientFinancialCase | PatientCheque | PatientPromissoryNote | PatientDebt | PatientFinancialTransaction | PatientFinancialCommitment;
interface FinancePatientOption { patientFileId: number; financialPatientId: string | null; fileNumber: number; firstName: string; lastName: string; phoneNumber: string; }
type ChequeEditForm = FormGroup<{ amount: FormControl<number | null>; ownerName: FormControl<string | null> }>;
type NoteEditForm = FormGroup<{ amount: FormControl<number | null> }>;

const GUID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const SAYAD_NUMBER_PATTERN = /^\d{16}$/;
const PROMISSORY_NOTE_SERIAL_PATTERN = /^\d+$/;

function commitmentRequired(control: AbstractControl): ValidationErrors | null {
  const agreement = Number(control.get("agreementType")?.value);
  const count = (control.get("cheques") as FormArray)?.length + (control.get("promissoryNotes") as FormArray)?.length;
  return agreement === FinancialAgreementType.PrePayment && count === 0 ? { commitmentRequired: true } : null;
}

function agreedAmountsWithinTotal(control: AbstractControl): ValidationErrors | null {
  const total = Number(control.get("totalAmount")?.value ?? 0);
  const prePayment = Number(control.get("prePaymentAmount")?.value ?? 0);
  const deposit = Number(control.get("depositAmount")?.value ?? 0);
  return prePayment + deposit > total ? { agreedAmountsExceedTotal: true } : null;
}

function todayOrLater(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const selected = new Date(control.value); const today = new Date();
  selected.setHours(0, 0, 0, 0); today.setHours(0, 0, 0, 0);
  return selected.getTime() < today.getTime() ? { pastDate: true } : null;
}

@Component({
  selector: "app-patient-finance-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PersianDatePickerComponent, BaseNumberInputComponent, BaseModalComponent, SecretaryAccountShellComponent],
  templateUrl: "./patient-finance-page.component.html",
  styleUrl: "./patient-finance-page.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientFinancePageComponent implements OnInit, OnDestroy {
  readonly tabs: { id: FinanceTab; label: string }[] = [
    { id: "cases", label: "پرونده‌ها" }, { id: "create", label: "پرونده جدید" },
    { id: "cheques", label: "چک‌ها" }, { id: "notes", label: "سفته‌ها" },
    { id: "debts", label: "بدهی‌ها" }, { id: "transactions", label: "پرداخت‌ها" },
    { id: "due", label: "نزدیک سررسید" },
  ];
  readonly services = [{ id: 1, label: "کامپوزیت" }, { id: 2, label: "ایمپلنت" }, { id: 3, label: "لمینت" }];
  readonly Math = Math;
  readonly FinancialCaseStatus = FinancialCaseStatus;
  readonly CommitmentStatus = CommitmentStatus;
  readonly DebtStatus = DebtStatus;
  readonly today = (() => { const value = new Date(); value.setHours(0, 0, 0, 0); return value; })();
  activeTab: FinanceTab = "cases";
  items: ListItem[] = [];
  totalCount = 0;
  page = 1;
  readonly pageSize = 20;
  loading = false;
  submitting = false;
  createSubmitAttempted = false;
  actionId: number | null = null;
  details: PatientFinancialCaseDetails | null = null;
  summary: PatientFinancialCaseSummary | null = null;
  detailCheques: PatientCheque[] = [];
  detailNotes: PatientPromissoryNote[] = [];
  patientOptions: FinancePatientOption[] = [];
  patientSearch = "";
  patientOptionsLoading = false;
  resolvingPatientFileId: number | null = null;
  patientDropdownOpen = false;
  commitmentModalCase: PatientFinancialCase | null = null;
  commitmentModalItems: Array<PatientCheque | PatientPromissoryNote> = [];
  commitmentModalLoading = false;
  debtEligibilityLoading = false;
  readonly debtCaseIdsWithPendingCommitments = new Set<number>();
  private selectedFinancialPatientId: PatientGuid | null = null;
  private patientSearchTimer: ReturnType<typeof setTimeout> | null = null;
  private patientSearchSubscription: Subscription | null = null;

  readonly filters = this.fb.group({ search: [""], status: [null as number | null], sourceType: [null as number | null], fromDate: [null as Date | null], toDate: [null as Date | null] });
  readonly createForm = this.fb.group({
    patientId: this.fb.control<string | null>(null, [Validators.required, Validators.pattern(GUID_PATTERN)]),
    serviceId: [null as number | null, Validators.required],
    totalAmount: [null as number | null, Validators.required],
    prePaymentAmount: [0, Validators.required],
    depositAmount: [0, Validators.required],
    agreementType: [FinancialAgreementType.Deposit, Validators.required],
    cheques: this.fb.array([]), promissoryNotes: this.fb.array([]),
  }, { validators: [commitmentRequired, agreedAmountsWithinTotal] });
  // Kept as typed compatibility containers so older merged templates/helpers compile safely.
  // The current details modal does not render or populate these arrays.
  readonly chequeEditForms = new FormArray<ChequeEditForm>([]);
  readonly noteEditForms = new FormArray<NoteEditForm>([]);


  get activeTabLabel(): string { return this.tabs.find((tab) => tab.id === this.activeTab)?.label ?? ""; }
  get fromDateFilterLabel(): string { return this.dateFilterLabels.from; }
  get toDateFilterLabel(): string { return this.dateFilterLabels.to; }
  private get dateFilterLabels(): { from: string; to: string } {
    if (this.activeTab === "debts" || this.isCommitmentTab || this.activeTab === "due") {
      return { from: "سررسید از تاریخ", to: "سررسید تا تاریخ" };
    }
    return { from: "ثبت از تاریخ", to: "ثبت تا تاریخ" };
  }
  private readonly destroyRef = inject(DestroyRef);
  constructor(private readonly fb: FormBuilder, private readonly api: PatientFinanceApiService, private readonly patientFilesApi: PatientFilesService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  ngOnDestroy(): void {
    if (this.patientSearchTimer !== null) clearTimeout(this.patientSearchTimer);
    this.patientSearchSubscription?.unsubscribe();
  }
  get cheques(): FormArray { return this.createForm.controls.cheques; }
  get notes(): FormArray { return this.createForm.controls.promissoryNotes; }
  get createFormErrorMessage(): string {
    if (this.createForm.controls.patientId.invalid) return "یک بیمار معتبر را از فهرست انتخاب کنید.";
    if (this.createForm.controls.serviceId.invalid) return "خدمت درمانی را انتخاب کنید.";
    if (this.createForm.controls.totalAmount.invalid) return "مبلغ کل درمان باید بیشتر از صفر باشد.";
    if (this.createForm.hasError("agreedAmountsExceedTotal")) return "مجموع مبالغ توافق‌شده نباید از مبلغ کل بیشتر باشد.";
    if (this.createForm.hasError("commitmentRequired")) return "برای توافق پیش‌پرداخت حداقل یک چک یا سفته کامل ثبت کنید.";
    if (this.cheques.invalid) return "اطلاعات چک‌ها را کامل و معتبر وارد کنید.";
    if (this.notes.invalid) return "اطلاعات سفته‌ها را کامل و معتبر وارد کنید.";
    return "لطفاً فیلدهای مشخص‌شده را کامل کنید.";
  }
  selectTab(tab: FinanceTab): void {
    this.activeTab = tab;
    this.page = 1;
    this.items = [];
    this.details = null;
    this.closeCommitmentModal();
    if (tab === "create") {
      this.patientDropdownOpen = false;
      return;
    }
    this.load();
  }
  get isCommitmentTab(): boolean { return this.activeTab === "cheques" || this.activeTab === "notes"; }
  showPatientCommitments(item: PatientFinancialCase): void {
    this.commitmentModalCase = item;
    this.commitmentModalItems = [];
    this.commitmentModalLoading = true;
    const request = (this.activeTab === "cheques"
      ? this.api.getCheques({ patientFinancialCaseId: item.id, page: 1, pageSize: 100 })
      : this.api.getPromissoryNotes({ patientFinancialCaseId: item.id, page: 1, pageSize: 100 })) as Observable<PaginatedResult<PatientCheque | PatientPromissoryNote>>;
    request.pipe(
      finalize(() => { this.commitmentModalLoading = false; this.cdr.markForCheck(); }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: result => { this.commitmentModalItems = (result.items ?? []).filter(commitment => commitment.patientFinancialCaseId === item.id); },
      error: (error: HttpErrorResponse) => this.showError(error),
    });
  }
  closeCommitmentModal(): void { this.commitmentModalCase = null; this.commitmentModalItems = []; this.commitmentModalLoading = false; }
  loadPatientOptions(): void {
    if (this.patientOptionsLoading || this.patientOptions.length) return;
    this.requestPatientOptions("");
  }
  patientFileId(patient: FinancePatientOption): number { return patient.patientFileId; }
  patientName(patient: FinancePatientOption): string { return [patient.firstName, patient.lastName].filter(Boolean).join(" ").trim() || "بیمار بدون نام"; }
  patientPhone(patient: FinancePatientOption): string { return patient.phoneNumber ?? ""; }
  patientFileNumber(patient: FinancePatientOption): string { return String(patient.fileNumber ?? ""); }
  patientCanBeSelected(patient: FinancePatientOption): boolean { return this.resolvingPatientFileId !== patient.patientFileId; }
  selectPatient(patient: FinancePatientOption): void {
    if (patient.financialPatientId) {
      this.applySelectedPatient(patient, patient.financialPatientId);
      return;
    }

    if (this.resolvingPatientFileId !== null) return;
    this.resolvingPatientFileId = patient.patientFileId;
    this.patientFilesApi.ensureFinancialIdentity(patient.patientFileId).pipe(
      finalize(() => {
        this.resolvingPatientFileId = null;
        this.cdr.markForCheck();
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: identity => {
        if (!GUID_PATTERN.test(identity.financialPatientId)) {
          this.toast.error("شناسه مالی معتبر برای بیمار ایجاد نشد.");
          return;
        }
        patient.financialPatientId = identity.financialPatientId;
        this.applySelectedPatient(patient, identity.financialPatientId);
      },
      error: (error: HttpErrorResponse) => this.showError(error),
    });
  }
  private applySelectedPatient(patient: FinancePatientOption, financialPatientId: PatientGuid): void {
    this.selectedFinancialPatientId = financialPatientId;
    this.createForm.controls.patientId.setValue(financialPatientId);
    this.patientSearch = this.patientName(patient);
    this.patientDropdownOpen = false;
  }
  onPatientSearch(value: string): void {
    this.patientSearch = value;
    this.selectedFinancialPatientId = null;
    this.createForm.controls.patientId.setValue(null);
    this.patientDropdownOpen = true;
    if (this.patientSearchTimer !== null) clearTimeout(this.patientSearchTimer);
    this.patientSearchSubscription?.unsubscribe();
    this.patientOptionsLoading = false;
    this.patientSearchTimer = setTimeout(() => {
      this.patientSearchTimer = null;
      this.requestPatientOptions(value.trim());
    }, 400);
  }
  closePatientDropdown(): void { setTimeout(() => { this.patientDropdownOpen = false; this.cdr.markForCheck(); }, 150); }
  addCheque(): void { this.cheques.push(this.fb.group({ amount: [null, Validators.required], sayadNumber: ["", [Validators.required, Validators.pattern(SAYAD_NUMBER_PATTERN)]], ownerName: ["", Validators.required], dueDate: [null as Date | null, [Validators.required, todayOrLater]] })); this.createForm.updateValueAndValidity(); }
  addNote(): void { this.notes.push(this.fb.group({ serialNumber: ["", [Validators.required, Validators.pattern(PROMISSORY_NOTE_SERIAL_PATTERN)]], amount: [null, Validators.required], dueDate: [null as Date | null, [Validators.required, todayOrLater]] })); this.createForm.updateValueAndValidity(); }
  removeCheque(index: number): void { this.cheques.removeAt(index); this.createForm.updateValueAndValidity(); }
  removeNote(index: number): void { this.notes.removeAt(index); this.createForm.updateValueAndValidity(); }
  onCreateAgreementChange(): void { this.clearInactiveAgreementAmount(this.createForm); }
  applyFilters(): void {
    this.page = 1; this.load();
  }
  clearFilters(): void { this.filters.reset(); this.page = 1; this.load(); }
  changePage(delta: number): void { const next = this.page + delta; if (next < 1 || (delta > 0 && this.page * this.pageSize >= this.totalCount)) return; this.page = next; this.load(); }

  load(): void {
    if (this.activeTab === "create") return;
    this.loading = true;
    const raw = this.filters.getRawValue();
    const query = { ...raw, fromDate: this.apiDate(raw.fromDate), toDate: this.apiDate(raw.toDate), page: this.page, pageSize: this.pageSize };
    if (this.activeTab === "debts" && query.status === null) query.status = DebtStatus.Unpaid;
    if (this.activeTab !== "debts") this.debtCaseIdsWithPendingCommitments.clear();
    const request: Observable<PaginatedResult<ListItem>> = (this.isCommitmentTab
      ? this.getCasesWithSelectedCommitment(query)
      : this.activeTab === "cases"
        ? this.api.getCases(query)
        : this.activeTab === "debts"
          ? this.getDebtsWithEligibility(query)
          : this.activeTab === "transactions"
            ? this.api.getTransactions(query)
            : this.api.getDueCommitments(query)) as Observable<PaginatedResult<ListItem>>;
    request.pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result: PaginatedResult<any>) => {
      this.items = this.activeTab === "due" ? (result.items ?? []).filter((item: PatientFinancialCommitment) => this.isNearDue(item.dueDate)) : result.items ?? [];
      this.totalCount = this.activeTab === "due" ? this.items.length : result.totalCount ?? 0;
    }, error: (error: HttpErrorResponse) => this.showError(error) });
  }

  private getCasesWithSelectedCommitment(query: Record<string, string | number | boolean | null | undefined>): Observable<PaginatedResult<PatientFinancialCase>> {
    const commitmentQuery = { ...query, page: 1, pageSize: 100 };
    const commitments = (this.activeTab === "cheques"
      ? this.api.getCheques(commitmentQuery)
      : this.api.getPromissoryNotes(commitmentQuery)) as Observable<PaginatedResult<PatientCheque | PatientPromissoryNote>>;
    return forkJoin({ cases: this.api.getCases(query), commitments }).pipe(map(({ cases, commitments: result }) => {
      const caseIds = new Set((result.items ?? []).map(item => item.patientFinancialCaseId));
      const items = (cases.items ?? []).filter(item => caseIds.has(item.id));
      return { ...cases, items, totalCount: items.length, totalPages: items.length ? 1 : 0, hasPrevious: false, hasNext: false };
    }));
  }

  private getDebtsWithEligibility(query: Record<string, string | number | boolean | null | undefined>): Observable<PaginatedResult<PatientDebt>> {
    this.debtEligibilityLoading = true;
    this.debtCaseIdsWithPendingCommitments.clear();
    return this.api.getDebts(query).pipe(
      switchMap(debts => {
        const caseIds = [...new Set((debts.items ?? []).map(item => item.patientFinancialCaseId))];
        if (!caseIds.length) return of(debts);
        return forkJoin(caseIds.map(caseId => this.api.getCaseSummary(caseId).pipe(map(summary => ({ caseId, summary }))))).pipe(
          map(summaries => {
            summaries.filter(({ summary }) => summary.pendingChequeAmount > 0 || summary.pendingPromissoryNoteAmount > 0).forEach(({ caseId }) => this.debtCaseIdsWithPendingCommitments.add(caseId));
            return debts;
          }),
        );
      }),
      finalize(() => { this.debtEligibilityLoading = false; this.cdr.markForCheck(); }),
    );
  }

  submitCase(): void {
    if (this.submitting) return;
    this.createSubmitAttempted = true;
    if (!this.selectedFinancialPatientId || !GUID_PATTERN.test(this.selectedFinancialPatientId) || this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.toast.error(this.createFormErrorMessage);
      this.cdr.markForCheck();
      return;
    }
    this.submitting = true;
    const value = this.createForm.getRawValue();
    this.api.createCase({ patientId: this.selectedFinancialPatientId, serviceId: Number(value.serviceId), totalAmount: Number(value.totalAmount), prePaymentAmount: Number(value.prePaymentAmount), depositAmount: Number(value.depositAmount), agreementType: Number(value.agreementType), cheques: value.cheques.map((x: any) => ({ ...x, amount: Number(x.amount), dueDate: this.iso(x.dueDate) })), promissoryNotes: value.promissoryNotes.map((x: any) => ({ ...x, amount: Number(x.amount), dueDate: this.iso(x.dueDate) })) }).pipe(finalize(() => { this.submitting = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => { if (!result.isSuccess || !result.data) { this.toast.error(result.message); return; } this.toast.success(result.message || "پرونده مالی با موفقیت ثبت شد."); this.createForm.reset({ prePaymentAmount: 0, depositAmount: 0, agreementType: FinancialAgreementType.Deposit }); this.createSubmitAttempted = false; this.selectedFinancialPatientId = null; this.patientSearch = ""; this.cheques.clear(); this.notes.clear(); this.selectTab("cases"); this.openDetails(result.data.id); }, error: (e) => this.showError(e) });
  }

  openDetails(id: number): void {
    this.loading = true;
    forkJoin({ details: this.api.getCase(id), summary: this.api.getCaseSummary(id) }).pipe(
      finalize(() => { this.loading = false; this.cdr.markForCheck(); }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({ next: ({ details, summary }) => {
      this.details = details;
      this.summary = summary;
    }, error: (e) => this.showError(e) });
  }
  closeDetails(): void { this.details = null; this.summary = null; }
  canCancelCase(item: PatientFinancialCase): boolean { return item.status === FinancialCaseStatus.Active && item.agreementType === FinancialAgreementType.Deposit && item.totalPaidAmount === 0; }
  cancelCase(item: PatientFinancialCase): void { if (!this.canCancelCase(item) || !confirm("ودیعه مالی لغو شود؟ سابقه مالی حذف نخواهد شد.")) return; this.mutate(item.id, this.api.cancelCase(item.id), "ودیعه مالی لغو شد."); }
  updateStatus(kind: "cheque" | "note", id: number, status: 2 | 3 | 4, dueDate?: string): void {
    if (dueDate && !this.isCommitmentDue(dueDate)) {
      this.toast.error("ثبت نتیجه پرداخت فقط از روز سررسید امکان‌پذیر است.");
      return;
    }
    const label = status === 2
      ? "وصول این تعهد تأیید شود؟ مبلغ آن به‌عنوان پرداخت ثبت می‌شود."
      : status === 3
        ? "پرداخت‌نشدن این تعهد ثبت شود؟ مبلغ آن به بدهی بیمار تبدیل می‌شود."
        : "این تعهد لغو شود؟";
    if (!confirm(label)) return;
    const request = kind === "cheque" ? this.api.updateChequeStatus(id, status) : this.api.updatePromissoryNoteStatus(id, status);
    this.mutate(id, request, status === 3 ? "عدم پرداخت ثبت و مبلغ به بدهی بیمار تبدیل شد." : "وضعیت تعهد به‌روزرسانی شد.");
  }
  payDebt(item: PatientDebt): void { if (!this.canPayDebt(item) || !confirm("تسویه کامل این بدهی ثبت شود؟")) return; this.mutate(item.id, this.api.payDebt(item.id), "بدهی با موفقیت تسویه شد."); }
  canPayDebt(item: PatientDebt): boolean { return item.status === DebtStatus.Unpaid && !this.debtEligibilityLoading && !this.debtCaseIdsWithPendingCommitments.has(item.patientFinancialCaseId); }
  caseItem(item: ListItem): PatientFinancialCase { return item as PatientFinancialCase; }
  chequeItem(item: ListItem): PatientCheque { return item as PatientCheque; }
  noteItem(item: ListItem): PatientPromissoryNote { return item as PatientPromissoryNote; }
  debtItem(item: ListItem): PatientDebt { return item as PatientDebt; }
  transactionItem(item: ListItem): PatientFinancialTransaction { return item as PatientFinancialTransaction; }
  dueItem(item: ListItem): PatientFinancialCommitment { return item as PatientFinancialCommitment; }
  money(value: number | null | undefined): string { return `${new Intl.NumberFormat("fa-IR").format(value ?? 0)} تومان`; }
  setAmount(control: AbstractControl, value: number | null): void { control.setValue(value); control.markAsTouched(); }
  normalizeIdentifier(control: AbstractControl, event: Event, maxLength?: number): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value
      .replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
      .replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
      .replace(/\D/g, "");
    const normalized = maxLength === undefined ? digits : digits.slice(0, maxLength);
    input.value = normalized;
    control.setValue(normalized);
    control.markAsTouched();
  }
  date(value: string | null | undefined): string { return value ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(value)) : "—"; }
  statusLabel(value: number): string { return ({ 1: "در انتظار", 2: "پرداخت‌شده", 3: "پرداخت‌نشده", 4: "لغوشده" } as Record<number, string>)[value] ?? "نامشخص"; }
  isCommitmentDue(value: string | null | undefined): boolean {
    if (!value) return false;
    const dueDate = new Date(value);
    if (Number.isNaN(dueDate.getTime())) return false;
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return dueDate.getTime() <= today.getTime();
  }
  isNearDue(value: string | null | undefined): boolean {
    if (!value) return false;
    const dueDate = new Date(value); if (Number.isNaN(dueDate.getTime())) return false;
    const today = new Date(); dueDate.setHours(0, 0, 0, 0); today.setHours(0, 0, 0, 0);
    return Math.ceil((dueDate.getTime() - today.getTime()) / 86_400_000) <= 3;
  }
  patientReference(name: string | null | undefined, fileNumber: string | number | null | undefined): string { return `${name?.trim() || "بیمار"} به شماره پرونده ${fileNumber || "—"}`; }
  recordFileNumber(item: { patientFileNumber?: string | number | null; fileNumber?: string | number | null }): string | number | null { return item.patientFileNumber ?? item.fileNumber ?? null; }
  serviceLabel(serviceId: number | null | undefined, serviceName: string | null | undefined): string {
    const byId = this.services.find(service => service.id === Number(serviceId))?.label;
    if (byId) return byId;
    const normalized = serviceName?.trim().toLowerCase();
    return ({ composite: "کامپوزیت", implant: "ایمپلنت", laminate: "لمینت" } as Record<string, string>)[normalized ?? ""] ?? serviceName ?? "—";
  }
  private iso(value: Date): string { return value.toISOString(); }
  private apiDate(value: Date | null): string | null {
    if (!value) return null;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  private clearInactiveAgreementAmount(form: typeof this.createForm): void {
    if (form.controls.agreementType.value === FinancialAgreementType.PrePayment) form.controls.depositAmount.setValue(0);
    else form.controls.prePaymentAmount.setValue(0);
  }
  private buildCommitmentEditForms(): void {
    this.chequeEditForms.clear();
    this.noteEditForms.clear();
    this.detailCheques.forEach(item => this.chequeEditForms.push(this.fb.group({ amount: [item.amount, Validators.required], ownerName: [item.ownerName, Validators.required] })));
    this.detailNotes.forEach(item => this.noteEditForms.push(this.fb.group({ amount: [item.amount, Validators.required] })));
  }
  private requestPatientOptions(searchText: string): void {
    if (this.patientSearchTimer !== null) {
      clearTimeout(this.patientSearchTimer);
      this.patientSearchTimer = null;
    }
    this.patientSearchSubscription?.unsubscribe();
    this.patientOptionsLoading = true;
    this.cdr.markForCheck();
    this.patientSearchSubscription = this.patientFilesApi.getPatientFiles({
      search: searchText,
      fileNumber: "",
      sourceType: "",
      page: 1,
      pageSize: 20,
    }).pipe(
      finalize(() => {
        this.patientOptionsLoading = false;
        this.cdr.markForCheck();
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: result => {
        this.patientOptions = result.items.map(patient => {
          const financialPatientId = typeof patient.financialPatientId === "string" && GUID_PATTERN.test(patient.financialPatientId)
            ? patient.financialPatientId
            : null;
          return {
            patientFileId: patient.id,
            financialPatientId,
            fileNumber: patient.fileNumber,
            firstName: patient.firstName,
            lastName: patient.lastName,
            phoneNumber: patient.phoneNumber,
          };
        });
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => this.showError(error),
    });
  }
  private mutate(id: number, request: ReturnType<PatientFinanceApiService["payDebt"]>, success: string): void { if (this.actionId !== null) return; this.actionId = id; request.pipe(finalize(() => { this.actionId = null; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: r => { if (!r.isSuccess) { this.toast.error(r.message); return; } this.toast.success(r.message || success); this.load(); if (this.details) this.openDetails(this.details.case.id); }, error: e => this.showError(e) }); }
  private showError(error: HttpErrorResponse): void { this.toast.error(error.error?.message || error.message || "ارتباط با سرور انجام نشد."); }
}
