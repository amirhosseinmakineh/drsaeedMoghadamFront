import { CommonModule } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnDestroy, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { finalize, forkJoin, map, Observable, Subscription, switchMap } from "rxjs";
import { ToastService } from "../../../../../core/toast/toast.service";
import { PersianDatePickerComponent } from "../../../../../basemadual/forms/persian-date-picker/persian-date-picker.component";
import { BaseModalComponent } from "../../../../../basemadual/overlays/modal/modal.component";
import { SecretaryAccountShellComponent } from "../../../account/components/secretary-account-shell/secretary-account-shell.component";
import { PatientFilesService } from "../../../patient-files/patient-files.service";
import { CommitmentStatus, CreateChequeRequest, CreatePromissoryNoteRequest, DebtStatus, FinancialAgreementType, FinancialCaseStatus, FinancialSourceType, PaginatedResult, PatientCheque, PatientDebt, PatientFinancialCase, PatientFinancialCaseDetails, PatientFinancialCaseSummary, PatientFinancialCommitment, PatientFinancialTransaction, PatientGuid, PatientPromissoryNote } from "../../models/patient-finance.models";
import { PatientFinanceApiService } from "../../services/patient-finance-api.service";

type FinanceTab = "cases" | "create" | "cheques" | "notes" | "debts" | "transactions" | "due";
type ListItem = PatientFinancialCase | PatientCheque | PatientPromissoryNote | PatientDebt | PatientFinancialTransaction | PatientFinancialCommitment;
interface FinancePatientOption { patientFileId: number; financialPatientId: string | null; fileNumber: number; firstName: string; lastName: string; phoneNumber: string; }
type ChequeEditForm = FormGroup<{ amount: FormControl<number | null>; ownerName: FormControl<string | null> }>;
type NoteEditForm = FormGroup<{ amount: FormControl<number | null> }>;

const GUID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

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

@Component({
  selector: "app-patient-finance-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PersianDatePickerComponent, BaseModalComponent, SecretaryAccountShellComponent],
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
  activeTab: FinanceTab = "cases";
  items: ListItem[] = [];
  totalCount = 0;
  page = 1;
  readonly pageSize = 20;
  loading = false;
  submitting = false;
  actionId: number | null = null;
  details: PatientFinancialCaseDetails | null = null;
  summary: PatientFinancialCaseSummary | null = null;
  detailCheques: PatientCheque[] = [];
  detailNotes: PatientPromissoryNote[] = [];
  patientOptions: FinancePatientOption[] = [];
  patientSearch = "";
  patientOptionsLoading = false;
  patientDropdownOpen = false;
  commitmentModalCase: PatientFinancialCase | null = null;
  commitmentModalItems: Array<PatientCheque | PatientPromissoryNote> = [];
  commitmentModalLoading = false;
  private selectedFinancialPatientId: PatientGuid | null = null;
  private patientSearchTimer: ReturnType<typeof setTimeout> | null = null;
  private patientSearchSubscription: Subscription | null = null;

  readonly filters = this.fb.group({ search: [""], patientId: this.fb.control<string | null>(null, Validators.pattern(GUID_PATTERN)), status: [null as number | null], sourceType: [null as number | null], fromDate: [null as Date | null], toDate: [null as Date | null], year: [null as number | null], month: [null as number | null] });
  readonly createForm = this.fb.group({
    patientId: this.fb.control<string | null>(null, [Validators.required, Validators.pattern(GUID_PATTERN)]),
    serviceId: [null as number | null, Validators.required],
    totalAmount: [null as number | null, [Validators.required, Validators.min(1)]],
    prePaymentAmount: [0, [Validators.required, Validators.min(0)]],
    depositAmount: [0, [Validators.required, Validators.min(0)]],
    agreementType: [FinancialAgreementType.Deposit, Validators.required],
    cheques: this.fb.array([]), promissoryNotes: this.fb.array([]),
  }, { validators: [commitmentRequired, agreedAmountsWithinTotal] });
  readonly editForm = this.fb.group({
    totalAmount: [null as number | null, [Validators.required, Validators.min(1)]],
    prePaymentAmount: [0, [Validators.required, Validators.min(0)]],
    depositAmount: [0, [Validators.required, Validators.min(0)]],
    agreementType: [FinancialAgreementType.Deposit, Validators.required],
  }, { validators: agreedAmountsWithinTotal });
  readonly commitmentForm = this.fb.group({ type: [FinancialSourceType.Cheque, Validators.required], amount: [null as number | null, [Validators.required, Validators.min(1)]], identifier: ["", Validators.required], ownerName: [""], dueDate: [null as Date | null, Validators.required] });
  readonly chequeEditForms = new FormArray<ChequeEditForm>([]);
  readonly noteEditForms = new FormArray<NoteEditForm>([]);

  get activeTabLabel(): string { return this.tabs.find((tab) => tab.id === this.activeTab)?.label ?? ""; }
  private readonly destroyRef = inject(DestroyRef);
  constructor(private readonly fb: FormBuilder, private readonly api: PatientFinanceApiService, private readonly patientFilesApi: PatientFilesService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  ngOnDestroy(): void {
    if (this.patientSearchTimer !== null) clearTimeout(this.patientSearchTimer);
    this.patientSearchSubscription?.unsubscribe();
  }
  get cheques(): FormArray { return this.createForm.controls.cheques; }
  get notes(): FormArray { return this.createForm.controls.promissoryNotes; }
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
      next: result => { this.commitmentModalItems = result.items ?? []; },
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
  patientCanBeSelected(patient: FinancePatientOption): boolean { return patient.financialPatientId !== null; }
  selectPatient(patient: FinancePatientOption): void {
    if (!patient.financialPatientId) return;
    this.selectedFinancialPatientId = patient.financialPatientId;
    this.createForm.controls.patientId.setValue(patient.financialPatientId);
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
  addCheque(): void { this.cheques.push(this.fb.group({ amount: [null, [Validators.required, Validators.min(1)]], sayadNumber: ["", Validators.required], ownerName: ["", Validators.required], dueDate: [null as Date | null, Validators.required] })); this.createForm.updateValueAndValidity(); }
  addNote(): void { this.notes.push(this.fb.group({ serialNumber: ["", Validators.required], amount: [null, [Validators.required, Validators.min(1)]], dueDate: [null as Date | null, Validators.required] })); this.createForm.updateValueAndValidity(); }
  removeCheque(index: number): void { this.cheques.removeAt(index); this.createForm.updateValueAndValidity(); }
  removeNote(index: number): void { this.notes.removeAt(index); this.createForm.updateValueAndValidity(); }
  onCreateAgreementChange(): void { this.clearInactiveAgreementAmount(this.createForm); }
  onEditAgreementChange(): void { this.clearInactiveAgreementAmount(this.editForm); }
  applyFilters(): void {
    const { year, month } = this.filters.getRawValue();
    if (this.filters.controls.patientId.invalid) { this.filters.controls.patientId.markAsTouched(); this.toast.error("شناسه بیمار باید یک عدد معتبر باشد."); return; }
    if (this.activeTab === "debts" && ((year && !month) || (!year && month))) { this.toast.error("سال و ماه شمسی باید با هم وارد شوند."); return; }
    this.page = 1; this.load();
  }
  clearFilters(): void { this.filters.reset(); this.page = 1; this.load(); }
  changePage(delta: number): void { const next = this.page + delta; if (next < 1 || (delta > 0 && this.page * this.pageSize >= this.totalCount)) return; this.page = next; this.load(); }

  load(): void {
    if (this.activeTab === "create") return;
    this.loading = true;
    const raw = this.filters.getRawValue();
    const query = { ...raw, fromDate: this.apiDate(raw.fromDate), toDate: this.apiDate(raw.toDate), page: this.page, pageSize: this.pageSize };
    const request: Observable<PaginatedResult<ListItem>> = (this.activeTab === "cases" || this.isCommitmentTab ? this.api.getCases(query) : this.activeTab === "debts" ? this.api.getDebts(query) : this.activeTab === "transactions" ? this.api.getTransactions(query) : this.api.getDueCommitments(query)) as Observable<PaginatedResult<ListItem>>;
    request.pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result: PaginatedResult<any>) => {
      this.items = this.activeTab === "due" ? (result.items ?? []).filter((item: PatientFinancialCommitment) => this.isNearDue(item.dueDate)) : result.items ?? [];
      this.totalCount = this.activeTab === "due" ? this.items.length : result.totalCount ?? 0;
    }, error: (error: HttpErrorResponse) => this.showError(error) });
  }

  submitCase(): void {
    if (this.submitting) return;
    if (!this.selectedFinancialPatientId || !GUID_PATTERN.test(this.selectedFinancialPatientId) || this.createForm.invalid) { this.createForm.markAllAsTouched(); this.toast.error(this.createForm.hasError("commitmentRequired") ? "ثبت حداقل یک چک یا سفته الزامی است." : "لطفاً اطلاعات پرونده را کامل کنید."); return; }
    this.submitting = true;
    const value = this.createForm.getRawValue();
    this.api.createCase({ patientId: this.selectedFinancialPatientId, serviceId: Number(value.serviceId), totalAmount: Number(value.totalAmount), prePaymentAmount: Number(value.prePaymentAmount), depositAmount: Number(value.depositAmount), agreementType: Number(value.agreementType), cheques: value.cheques.map((x: any) => ({ ...x, amount: Number(x.amount), dueDate: this.iso(x.dueDate) })), promissoryNotes: value.promissoryNotes.map((x: any) => ({ ...x, amount: Number(x.amount), dueDate: this.iso(x.dueDate) })) }).pipe(finalize(() => { this.submitting = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => { if (!result.isSuccess || !result.data) { this.toast.error(result.message); return; } this.toast.success(result.message || "پرونده مالی با موفقیت ثبت شد."); this.createForm.reset({ prePaymentAmount: 0, depositAmount: 0, agreementType: FinancialAgreementType.Deposit }); this.selectedFinancialPatientId = null; this.patientSearch = ""; this.cheques.clear(); this.notes.clear(); this.selectTab("cases"); this.openDetails(result.data.id); }, error: (e) => this.showError(e) });
  }

  openDetails(id: number): void {
    this.loading = true;
    this.api.getCase(id).pipe(
      switchMap(details => forkJoin({
        details: [details],
        summary: this.api.getCaseSummary(id),
        cheques: details.cheques ? [details.cheques] : this.api.getCheques({ patientId: details.case.patientId, page: 1, pageSize: 200 }).pipe(map(result => result.items.filter(item => item.patientFinancialCaseId === id))),
        notes: details.promissoryNotes ? [details.promissoryNotes] : this.api.getPromissoryNotes({ patientId: details.case.patientId, page: 1, pageSize: 200 }).pipe(map(result => result.items.filter(item => item.patientFinancialCaseId === id))),
      })),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({ next: ({ details, summary, cheques, notes }) => {
      this.details = details;
      this.summary = summary;
      this.detailCheques = cheques;
      this.detailNotes = notes;
      this.buildCommitmentEditForms();
    }, error: (e) => this.showError(e) });
  }
  updateCase(): void {
    if (!this.details || this.editForm.invalid || this.submitting) { this.editForm.markAllAsTouched(); return; }
    const id = this.details.case.id;
    const value = this.editForm.getRawValue();
    this.submitting = true;
    this.api.updateCase(id, { totalAmount: Number(value.totalAmount), prePaymentAmount: Number(value.prePaymentAmount), depositAmount: Number(value.depositAmount), agreementType: Number(value.agreementType) }).pipe(finalize(() => { this.submitting = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: result => { if (!result.isSuccess) { this.toast.error(result.message); return; } this.toast.success(result.message || "اطلاعات پرونده به‌روزرسانی شد."); this.load(); this.openDetails(id); }, error: e => this.showError(e) });
  }
  closeDetails(): void { this.details = null; this.summary = null; this.detailCheques = []; this.detailNotes = []; this.chequeEditForms.clear(); this.noteEditForms.clear(); }
  canCancelCase(item: PatientFinancialCase): boolean { return item.status === FinancialCaseStatus.Active && item.agreementType === FinancialAgreementType.Deposit && item.totalPaidAmount === 0; }
  cancelCase(item: PatientFinancialCase): void { if (!this.canCancelCase(item) || !confirm("ودیعه مالی لغو شود؟ سابقه مالی حذف نخواهد شد.")) return; this.mutate(item.id, this.api.cancelCase(item.id), "ودیعه مالی لغو شد."); }
  saveCheque(index: number): void {
    const item = this.detailCheques[index]; const form = this.chequeEditForms.at(index);
    if (!item || item.status !== CommitmentStatus.Pending || form.invalid || this.actionId !== null) { form?.markAllAsTouched(); return; }
    const value = form.getRawValue() as { amount: number; ownerName: string };
    this.mutate(item.id, this.api.updateCheque(item.id, { amount: Number(value.amount), ownerName: value.ownerName.trim() }), "اطلاعات قابل ویرایش چک ذخیره شد.");
  }
  saveNote(index: number): void {
    const item = this.detailNotes[index]; const form = this.noteEditForms.at(index);
    if (!item || item.status !== CommitmentStatus.Pending || form.invalid || this.actionId !== null) { form?.markAllAsTouched(); return; }
    const value = form.getRawValue() as { amount: number };
    this.mutate(item.id, this.api.updatePromissoryNote(item.id, { amount: Number(value.amount) }), "مبلغ سفته ذخیره شد.");
  }
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
  payDebt(item: PatientDebt): void { if (item.status !== DebtStatus.Unpaid || !confirm("تسویه کامل این بدهی ثبت شود؟")) return; this.mutate(item.id, this.api.payDebt(item.id), "بدهی با موفقیت تسویه شد."); }
  addCommitment(): void {
    if (!this.details || this.commitmentForm.invalid || this.submitting) { this.commitmentForm.markAllAsTouched(); return; }
    const value = this.commitmentForm.getRawValue(); const caseId = this.details.case.id; const dueDate = this.iso(value.dueDate!); const type = Number(value.type);
    const request = type === FinancialSourceType.Cheque ? this.api.addCheque(caseId, { amount: Number(value.amount), sayadNumber: value.identifier!, ownerName: value.ownerName!, dueDate } as CreateChequeRequest) : this.api.addPromissoryNote(caseId, { amount: Number(value.amount), serialNumber: value.identifier!, dueDate } as CreatePromissoryNoteRequest);
    this.submitting = true; request.pipe(finalize(() => { this.submitting = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (r) => { if (!r.isSuccess) { this.toast.error(r.message); return; } this.toast.success("تعهد جدید ثبت شد."); this.commitmentForm.reset({ type: FinancialSourceType.Cheque }); this.openDetails(caseId); }, error: e => this.showError(e) });
  }
  caseItem(item: ListItem): PatientFinancialCase { return item as PatientFinancialCase; }
  chequeItem(item: ListItem): PatientCheque { return item as PatientCheque; }
  noteItem(item: ListItem): PatientPromissoryNote { return item as PatientPromissoryNote; }
  debtItem(item: ListItem): PatientDebt { return item as PatientDebt; }
  transactionItem(item: ListItem): PatientFinancialTransaction { return item as PatientFinancialTransaction; }
  dueItem(item: ListItem): PatientFinancialCommitment { return item as PatientFinancialCommitment; }
  money(value: number | null | undefined): string { return new Intl.NumberFormat("fa-IR").format(value ?? 0); }
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
  private clearInactiveAgreementAmount(form: typeof this.createForm | typeof this.editForm): void {
    if (form.controls.agreementType.value === FinancialAgreementType.PrePayment) form.controls.depositAmount.setValue(0);
    else form.controls.prePaymentAmount.setValue(0);
  }
  private buildCommitmentEditForms(): void {
    this.chequeEditForms.clear();
    this.noteEditForms.clear();
    this.detailCheques.forEach(item => this.chequeEditForms.push(this.fb.group({ amount: [item.amount, [Validators.required, Validators.min(1)]], ownerName: [item.ownerName, Validators.required] })));
    this.detailNotes.forEach(item => this.noteEditForms.push(this.fb.group({ amount: [item.amount, [Validators.required, Validators.min(1)]] })));
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
