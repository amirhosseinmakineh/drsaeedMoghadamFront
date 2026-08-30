import { CommonModule } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AbstractControl, FormArray, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { finalize, forkJoin, Observable } from "rxjs";
import { ToastService } from "../../../../../core/toast/toast.service";
import { SecretaryPatientOption } from "../../../../../core/secretary/secretary-dashboard.service";
import { PersianDatePickerComponent } from "../../../../../basemadual/forms/persian-date-picker/persian-date-picker.component";
import { SecretaryAccountShellComponent } from "../../../account/components/secretary-account-shell/secretary-account-shell.component";
import { PatientFilesService } from "../../../patient-files/patient-files.service";
import { CommitmentStatus, CreateChequeRequest, CreatePromissoryNoteRequest, DebtStatus, FinancialAgreementType, FinancialCaseStatus, FinancialSourceType, PaginatedResult, PatientCheque, PatientDebt, PatientFinancialCase, PatientFinancialCaseDetails, PatientFinancialCaseSummary, PatientFinancialCommitment, PatientFinancialTransaction, PatientPromissoryNote } from "../../models/patient-finance.models";
import { PatientFinanceApiService } from "../../services/patient-finance-api.service";

type FinanceTab = "cases" | "create" | "cheques" | "notes" | "debts" | "transactions" | "due";
type ListItem = PatientFinancialCase | PatientCheque | PatientPromissoryNote | PatientDebt | PatientFinancialTransaction | PatientFinancialCommitment;

function commitmentRequired(control: AbstractControl): ValidationErrors | null {
  const agreement = Number(control.get("agreementType")?.value);
  const count = (control.get("cheques") as FormArray)?.length + (control.get("promissoryNotes") as FormArray)?.length;
  return agreement === FinancialAgreementType.PrePayment && count === 0 ? { commitmentRequired: true } : null;
}

@Component({
  selector: "app-patient-finance-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PersianDatePickerComponent, SecretaryAccountShellComponent],
  templateUrl: "./patient-finance-page.component.html",
  styleUrl: "./patient-finance-page.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientFinancePageComponent implements OnInit {
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
  patientOptions: SecretaryPatientOption[] = [];
  patientSearch = "";
  patientOptionsLoading = false;
  patientOptionsLoaded = false;
  patientDropdownOpen = false;

  readonly filters = this.fb.group({ search: [""], patientId: [null as number | null], status: [null as number | null], sourceType: [null as number | null], fromDate: [null as Date | null], toDate: [null as Date | null], year: [null as number | null], month: [null as number | null] });
  readonly createForm = this.fb.group({
    patientId: [null as number | null, [Validators.required, Validators.min(1)]],
    serviceId: [null as number | null, Validators.required],
    totalAmount: [null as number | null, [Validators.required, Validators.min(1)]],
    agreementType: [FinancialAgreementType.Deposit, Validators.required],
    cheques: this.fb.array([]), promissoryNotes: this.fb.array([]),
  }, { validators: commitmentRequired });
  readonly commitmentForm = this.fb.group({ type: [FinancialSourceType.Cheque, Validators.required], amount: [null as number | null, [Validators.required, Validators.min(1)]], identifier: ["", Validators.required], ownerName: [""], dueDate: [null as Date | null, Validators.required] });

  get activeTabLabel(): string { return this.tabs.find((tab) => tab.id === this.activeTab)?.label ?? ""; }
  private readonly destroyRef = inject(DestroyRef);
  constructor(private readonly fb: FormBuilder, private readonly api: PatientFinanceApiService, private readonly patientFilesApi: PatientFilesService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  get cheques(): FormArray { return this.createForm.controls.cheques; }
  get notes(): FormArray { return this.createForm.controls.promissoryNotes; }
  selectTab(tab: FinanceTab): void { this.activeTab = tab; this.page = 1; this.items = []; this.details = null; if (tab === "create") this.loadPatientOptions(); else this.load(); }
  loadPatientOptions(): void {
    if (this.patientOptionsLoading || this.patientOptionsLoaded) return;
    this.patientOptionsLoading = true;
    this.patientFilesApi.getPatientFiles({ search: "", fileNumber: "", sourceType: "System", page: 1, pageSize: 100 }).pipe(finalize(() => { this.patientOptionsLoading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.patientOptions = result.items
          .filter(patient => Number.isFinite(Number(patient.patientId)) && Number(patient.patientId) > 0)
          .map(patient => ({
            patientId: Number(patient.patientId),
            firstName: patient.firstName,
            lastName: patient.lastName,
            phoneNumber: patient.phoneNumber,
          }));
        this.patientOptionsLoaded = true;
      },
      error: (error: HttpErrorResponse) => this.showError(error),
    });
  }
  get filteredPatientOptions(): SecretaryPatientOption[] {
    const query = this.normalizePatientText(this.patientSearch);
    if (!query) return this.patientOptions;
    return this.patientOptions.filter(patient => this.normalizePatientText(`${this.patientName(patient)} ${this.patientPhone(patient)}`).includes(query));
  }
  patientId(patient: SecretaryPatientOption): number { return Number(patient.patientId ?? patient.PatientId ?? patient.leadAssignmentId ?? patient.LeadAssignmentId ?? patient.id ?? patient.Id); }
  patientName(patient: SecretaryPatientOption): string {
    const person = patient.user ?? patient.User ?? patient.lead ?? patient.Lead ?? {};
    const name = patient.fullName?.trim() || patient.FullName?.trim() || [patient.firstName ?? patient.FirstName ?? person["firstName"] ?? person["FirstName"], patient.lastName ?? patient.LastName ?? person["lastName"] ?? person["LastName"]].filter(Boolean).join(" ").trim();
    return name || patient.userName || patient.UserName || "بیمار بدون نام";
  }
  patientPhone(patient: SecretaryPatientOption): string {
    const person = patient.user ?? patient.User ?? patient.lead ?? patient.Lead ?? {};
    return String(patient.phoneNumber ?? patient.PhoneNumber ?? person["phoneNumber"] ?? person["PhoneNumber"] ?? "");
  }
  selectPatient(patient: SecretaryPatientOption): void {
    const id = this.patientId(patient);
    if (!Number.isFinite(id) || id < 1) return;
    this.createForm.controls.patientId.setValue(id);
    this.patientSearch = this.patientName(patient);
    this.patientDropdownOpen = false;
  }
  onPatientSearch(value: string): void { this.patientSearch = value; this.createForm.controls.patientId.setValue(null); this.patientDropdownOpen = true; }
  closePatientDropdown(): void { setTimeout(() => { this.patientDropdownOpen = false; this.cdr.markForCheck(); }, 150); }
  addCheque(): void { this.cheques.push(this.fb.group({ amount: [null, [Validators.required, Validators.min(1)]], sayadNumber: ["", Validators.required], ownerName: ["", Validators.required], dueDate: [null as Date | null, Validators.required] })); this.createForm.updateValueAndValidity(); }
  addNote(): void { this.notes.push(this.fb.group({ serialNumber: ["", Validators.required], amount: [null, [Validators.required, Validators.min(1)]], dueDate: [null as Date | null, Validators.required] })); this.createForm.updateValueAndValidity(); }
  removeCheque(index: number): void { this.cheques.removeAt(index); this.createForm.updateValueAndValidity(); }
  removeNote(index: number): void { this.notes.removeAt(index); this.createForm.updateValueAndValidity(); }
  applyFilters(): void {
    const { year, month } = this.filters.getRawValue();
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
    const request: Observable<PaginatedResult<ListItem>> = (this.activeTab === "cases" ? this.api.getCases(query) : this.activeTab === "cheques" ? this.api.getCheques(query) : this.activeTab === "notes" ? this.api.getPromissoryNotes(query) : this.activeTab === "debts" ? this.api.getDebts(query) : this.activeTab === "transactions" ? this.api.getTransactions(query) : this.api.getDueCommitments(query)) as Observable<PaginatedResult<ListItem>>;
    request.pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result: PaginatedResult<any>) => { this.items = result.items ?? []; this.totalCount = result.totalCount ?? 0; }, error: (error: HttpErrorResponse) => this.showError(error) });
  }

  submitCase(): void {
    if (this.submitting) return;
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); this.toast.error(this.createForm.hasError("commitmentRequired") ? "ثبت حداقل یک چک یا سفته الزامی است." : "لطفاً اطلاعات پرونده را کامل کنید."); return; }
    this.submitting = true;
    const value = this.createForm.getRawValue();
    this.api.createCase({ patientId: Number(value.patientId), serviceId: Number(value.serviceId), totalAmount: Number(value.totalAmount), agreementType: Number(value.agreementType), cheques: value.cheques.map((x: any) => ({ ...x, amount: Number(x.amount), dueDate: this.iso(x.dueDate) })), promissoryNotes: value.promissoryNotes.map((x: any) => ({ ...x, amount: Number(x.amount), dueDate: this.iso(x.dueDate) })) }).pipe(finalize(() => { this.submitting = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => { if (!result.isSuccess || !result.data) { this.toast.error(result.message); return; } this.toast.success(result.message || "پرونده مالی با موفقیت ثبت شد."); this.createForm.reset({ agreementType: FinancialAgreementType.Deposit }); this.patientSearch = ""; this.cheques.clear(); this.notes.clear(); this.selectTab("cases"); this.openDetails(result.data.id); }, error: (e) => this.showError(e) });
  }

  openDetails(id: number): void {
    this.loading = true;
    forkJoin({ details: this.api.getCase(id), summary: this.api.getCaseSummary(id) }).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: ({ details, summary }) => { this.details = details; this.summary = summary; }, error: (e) => this.showError(e) });
  }
  closeDetails(): void { this.details = null; this.summary = null; }
  cancelCase(item: PatientFinancialCase): void { if (item.status !== FinancialCaseStatus.Active || !confirm("پرونده مالی لغو شود؟ سابقه مالی حذف نخواهد شد.")) return; this.mutate(item.id, this.api.cancelCase(item.id), "پرونده مالی لغو شد."); }
  updateStatus(kind: "cheque" | "note", id: number, status: 2 | 3 | 4): void { const label = status === 2 ? "وصول این تعهد تأیید شود؟" : status === 3 ? "این تعهد برگشتی ثبت شود؟" : "این تعهد لغو شود؟"; if (!confirm(label)) return; const request = kind === "cheque" ? this.api.updateChequeStatus(id, status) : this.api.updatePromissoryNoteStatus(id, status); this.mutate(id, request, "وضعیت تعهد به‌روزرسانی شد."); }
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
  private iso(value: Date): string { return value.toISOString(); }
  private apiDate(value: Date | null): string | null {
    if (!value) return null;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  private normalizePatientText(value: string): string { return value.trim().toLocaleLowerCase("fa-IR").replace(/[يى]/g, "ی").replace(/ك/g, "ک"); }
  private mutate(id: number, request: ReturnType<PatientFinanceApiService["payDebt"]>, success: string): void { if (this.actionId !== null) return; this.actionId = id; request.pipe(finalize(() => { this.actionId = null; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: r => { if (!r.isSuccess) { this.toast.error(r.message); return; } this.toast.success(r.message || success); this.load(); if (this.details) this.openDetails(this.details.case.id); }, error: e => this.showError(e) }); }
  private showError(error: HttpErrorResponse): void { this.toast.error(error.error?.message || error.message || "ارتباط با سرور انجام نشد."); }
}
