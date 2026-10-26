 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";

import { ChangeDetectionStrategy, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormArray, ReactiveFormsModule, Validators } from "@angular/forms";
import { finalize, forkJoin, map, of, switchMap } from "rxjs";

import { PersianDatePickerComponent } from "../../../../../basemadual/forms/persian-date-picker/persian-date-picker.component";
import { BaseNumberInputComponent } from "../../../../../basemadual/forms/number-input/number-input.component";
import { BaseModalComponent } from "../../../../../basemadual/overlays/modal/modal.component";
import { SecretaryAccountShellComponent } from "../../../account/components/secretary-account-shell/secretary-account-shell.component";

import { CommitmentStatus, DebtStatus, FinancialAgreementType, FinancialCaseStatus, } from "../../models/patient-finance.models";

import { environment } from "../../../../../../environments/environment";







const GUID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const SAYAD_NUMBER_PATTERN = /^\d{16}$/;
const PROMISSORY_NOTE_SERIAL_PATTERN = /^\d+$/;

function commitmentRequired(control) {
  const agreement = Number(_optionalChain([control, 'access', _2 => _2.get, 'call', _3 => _3("agreementType"), 'optionalAccess', _4 => _4.value]));
  const count = _optionalChain([(control.get("cheques") ), 'optionalAccess', _5 => _5.length]) + _optionalChain([(control.get("promissoryNotes") ), 'optionalAccess', _6 => _6.length]);
  return agreement === FinancialAgreementType.PrePayment && count === 0 ? { commitmentRequired: true } : null;
}

function agreedAmountsWithinTotal(control) {
  const total = Number(_nullishCoalesce(_optionalChain([control, 'access', _7 => _7.get, 'call', _8 => _8("totalAmount"), 'optionalAccess', _9 => _9.value]), () => ( 0)));
  const prePayment = Number(_nullishCoalesce(_optionalChain([control, 'access', _10 => _10.get, 'call', _11 => _11("prePaymentAmount"), 'optionalAccess', _12 => _12.value]), () => ( 0)));
  const deposit = Number(_nullishCoalesce(_optionalChain([control, 'access', _13 => _13.get, 'call', _14 => _14("depositAmount"), 'optionalAccess', _15 => _15.value]), () => ( 0)));
  return prePayment + deposit > total ? { agreedAmountsExceedTotal: true } : null;
}

function todayOrLater(control) {
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
export class PatientFinancePageComponent  {
   __init() {this.tabs = [
    { id: "cases", label: "پرونده‌ها" }, { id: "create", label: "پرونده جدید" },
    { id: "cheques", label: "چک‌ها" }, { id: "notes", label: "سفته‌ها" },
    { id: "debts", label: "بدهی‌ها" }, { id: "transactions", label: "پرداخت‌ها" },
    { id: "due", label: "نزدیک سررسید" },
  ]}
   __init2() {this.services = [{ id: 1, label: "کامپوزیت" }, { id: 2, label: "ایمپلنت" }, { id: 3, label: "لمینت" }, { id: 4, label: "روکش" }, { id: 5, label: "عصب کشی" }, { id: 6, label: "ترمیم" }, { id: 7, label: "کشیدن دندان" }]}
   __init3() {this.Math = Math}
   __init4() {this.FinancialCaseStatus = FinancialCaseStatus}
   __init5() {this.CommitmentStatus = CommitmentStatus}
   __init6() {this.DebtStatus = DebtStatus}
   __init7() {this.today = (() => { const value = new Date(); value.setHours(0, 0, 0, 0); return value; })()}
  __init8() {this.activeTab = "cases"}
  __init9() {this.items = []}
  __init10() {this.totalCount = 0}
  __init11() {this.page = 1}
   __init12() {this.pageSize = 20}
  __init13() {this.loading = false}
  __init14() {this.submitting = false}
  __init15() {this.createSubmitAttempted = false}
  __init16() {this.actionId = null}
  __init17() {this.details = null}
  __init18() {this.summary = null}
  __init19() {this.detailCheques = []}
  __init20() {this.detailNotes = []}
  __init21() {this.patientOptions = []}
  __init22() {this.patientSearch = ""}
  __init23() {this.patientOptionsLoading = false}
  __init24() {this.resolvingPatientFileId = null}
  __init25() {this.patientDropdownOpen = false}
  __init26() {this.commitmentModalCase = null}
  __init27() {this.commitmentModalItems = []}
  __init28() {this.commitmentModalLoading = false}
  __init29() {this.debtEligibilityLoading = false}
   __init30() {this.debtCaseIdsWithPendingCommitments = new Set()}
  __init31() {this.uploadingDocument = false}
  __init32() {this.deletingDocument = false}
  __init33() {this.pendingDocumentCaseId = null}
   __init34() {this.selectedFinancialPatientId = null}
   __init35() {this.patientSearchTimer = null}
   __init36() {this.patientSearchSubscription = null}

   __init37() {this.filters = this.fb.group({ search: [""], status: [null ], sourceType: [null ], fromDate: [null ], toDate: [null ] })}
   __init38() {this.createForm = this.fb.group({
    patientId: this.fb.control(null, [Validators.required, Validators.pattern(GUID_PATTERN)]),
    serviceIds: this.fb.array([], [Validators.required]),
    totalAmount: [null , Validators.required],
    prePaymentAmount: [0, Validators.required],
    depositAmount: [0, Validators.required],
    agreementType: [FinancialAgreementType.Deposit, Validators.required],
    paymentMethod: [null ],
    installmentStatus: [null ],
    guaranteeDocument: [null ],
    notes: [null ],
    consultantName: [null ],
    toothUnitCount: [null ],
    cheques: this.fb.array([]), promissoryNotes: this.fb.array([]),
  }, { validators: [commitmentRequired, agreedAmountsWithinTotal] })}
  // Kept as typed compatibility containers so older merged templates/helpers compile safely.
  // The current details modal does not render or populate these arrays.
   __init39() {this.chequeEditForms = new FormArray([])}
   __init40() {this.noteEditForms = new FormArray([])}
   __init41() {this.caseEditForm = this.fb.group({
    totalAmount: [0, Validators.required],
    prePaymentAmount: [0, Validators.required],
    depositAmount: [0, Validators.required],
    agreementType: [FinancialAgreementType.Deposit, Validators.required],
    paymentMethod: [null ],
    installmentStatus: [null ],
    guaranteeDocument: [null ],
    notes: [null ],
    consultantName: [null ],
    toothUnitCount: [null ],
  }, { validators: agreedAmountsWithinTotal })}


  get activeTabLabel() { return _nullishCoalesce(_optionalChain([this, 'access', _16 => _16.tabs, 'access', _17 => _17.find, 'call', _18 => _18((tab) => tab.id === this.activeTab), 'optionalAccess', _19 => _19.label]), () => ( "")); }
  get fromDateFilterLabel() { return this.dateFilterLabels.from; }
  get toDateFilterLabel() { return this.dateFilterLabels.to; }
   get dateFilterLabels() {
    if (this.activeTab === "debts" || this.isCommitmentTab || this.activeTab === "due") {
      return { from: "سررسید از تاریخ", to: "سررسید تا تاریخ" };
    }
    return { from: "ثبت از تاریخ", to: "ثبت تا تاریخ" };
  }
    __init42() {this.destroyRef = inject(DestroyRef)}
  constructor(  fb,   api,   patientFilesApi,   toast,   cdr) {;this.fb = fb;this.api = api;this.patientFilesApi = patientFilesApi;this.toast = toast;this.cdr = cdr;PatientFinancePageComponent.prototype.__init.call(this);PatientFinancePageComponent.prototype.__init2.call(this);PatientFinancePageComponent.prototype.__init3.call(this);PatientFinancePageComponent.prototype.__init4.call(this);PatientFinancePageComponent.prototype.__init5.call(this);PatientFinancePageComponent.prototype.__init6.call(this);PatientFinancePageComponent.prototype.__init7.call(this);PatientFinancePageComponent.prototype.__init8.call(this);PatientFinancePageComponent.prototype.__init9.call(this);PatientFinancePageComponent.prototype.__init10.call(this);PatientFinancePageComponent.prototype.__init11.call(this);PatientFinancePageComponent.prototype.__init12.call(this);PatientFinancePageComponent.prototype.__init13.call(this);PatientFinancePageComponent.prototype.__init14.call(this);PatientFinancePageComponent.prototype.__init15.call(this);PatientFinancePageComponent.prototype.__init16.call(this);PatientFinancePageComponent.prototype.__init17.call(this);PatientFinancePageComponent.prototype.__init18.call(this);PatientFinancePageComponent.prototype.__init19.call(this);PatientFinancePageComponent.prototype.__init20.call(this);PatientFinancePageComponent.prototype.__init21.call(this);PatientFinancePageComponent.prototype.__init22.call(this);PatientFinancePageComponent.prototype.__init23.call(this);PatientFinancePageComponent.prototype.__init24.call(this);PatientFinancePageComponent.prototype.__init25.call(this);PatientFinancePageComponent.prototype.__init26.call(this);PatientFinancePageComponent.prototype.__init27.call(this);PatientFinancePageComponent.prototype.__init28.call(this);PatientFinancePageComponent.prototype.__init29.call(this);PatientFinancePageComponent.prototype.__init30.call(this);PatientFinancePageComponent.prototype.__init31.call(this);PatientFinancePageComponent.prototype.__init32.call(this);PatientFinancePageComponent.prototype.__init33.call(this);PatientFinancePageComponent.prototype.__init34.call(this);PatientFinancePageComponent.prototype.__init35.call(this);PatientFinancePageComponent.prototype.__init36.call(this);PatientFinancePageComponent.prototype.__init37.call(this);PatientFinancePageComponent.prototype.__init38.call(this);PatientFinancePageComponent.prototype.__init39.call(this);PatientFinancePageComponent.prototype.__init40.call(this);PatientFinancePageComponent.prototype.__init41.call(this);PatientFinancePageComponent.prototype.__init42.call(this);PatientFinancePageComponent.prototype.__init43.call(this);}
  ngOnInit() { this.load(); }
  ngOnDestroy() {
    if (this.patientSearchTimer !== null) clearTimeout(this.patientSearchTimer);
    _optionalChain([this, 'access', _20 => _20.patientSearchSubscription, 'optionalAccess', _21 => _21.unsubscribe, 'call', _22 => _22()]);
  }
  __init43() {this.serviceDropdownOpen = false}
  get serviceIds() { return this.createForm.controls.serviceIds; }
  get selectedServiceLabels() {
    const ids = this.serviceIds.controls.map(c => c.value );
    if (!ids.length) return "انتخاب خدمت";
    return ids.map(id => _nullishCoalesce(_optionalChain([this, 'access', _23 => _23.services, 'access', _24 => _24.find, 'call', _25 => _25(s => s.id === id), 'optionalAccess', _26 => _26.label]), () => ( String(id)))).join("، ");
  }
  toggleServiceDropdown() { this.serviceDropdownOpen = !this.serviceDropdownOpen; }
  closeServiceDropdown() { setTimeout(() => { this.serviceDropdownOpen = false; this.cdr.markForCheck(); }, 150); }
  toggleService(id) {
    const index = this.serviceIds.controls.findIndex(c => c.value === id);
    if (index >= 0) { this.serviceIds.removeAt(index); } else { this.serviceIds.push(this.fb.control(id)); }
    this.createForm.updateValueAndValidity();
  }
  isServiceSelected(id) { return this.serviceIds.controls.some(c => c.value === id); }
  get cheques() { return this.createForm.controls.cheques; }
  get notes() { return this.createForm.controls.promissoryNotes; }
  get createFormErrorMessage() {
    if (this.createForm.controls.patientId.invalid) return "یک بیمار معتبر را از فهرست انتخاب کنید.";
    if (this.createForm.controls.serviceIds.invalid || this.createForm.controls.serviceIds.length === 0) return "حداقل یک خدمت درمانی را انتخاب کنید.";
    if (this.createForm.controls.totalAmount.invalid) return "مبلغ کل درمان باید بیشتر از صفر باشد.";
    if (this.createForm.hasError("agreedAmountsExceedTotal")) return "مجموع مبالغ توافق‌شده نباید از مبلغ کل بیشتر باشد.";
    if (this.createForm.hasError("commitmentRequired")) return "برای توافق پیش‌پرداخت حداقل یک چک یا سفته کامل ثبت کنید.";
    if (this.cheques.invalid) return "اطلاعات چک‌ها را کامل و معتبر وارد کنید.";
    if (this.notes.invalid) return "اطلاعات سفته‌ها را کامل و معتبر وارد کنید.";
    return "لطفاً فیلدهای مشخص‌شده را کامل کنید.";
  }
  selectTab(tab) {
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
  get isCommitmentTab() { return this.activeTab === "cheques" || this.activeTab === "notes"; }
  showPatientCommitments(item) {
    this.commitmentModalCase = item;
    this.commitmentModalItems = [];
    this.commitmentModalLoading = true;
    const request = (this.activeTab === "cheques"
      ? this.api.getCheques({ patientFinancialCaseId: item.id, page: 1, pageSize: 100 })
      : this.api.getPromissoryNotes({ patientFinancialCaseId: item.id, page: 1, pageSize: 100 })) ;
    request.pipe(
      finalize(() => { this.commitmentModalLoading = false; this.cdr.markForCheck(); }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: result => { this.commitmentModalItems = (_nullishCoalesce(result.items, () => ( []))).filter(commitment => commitment.patientFinancialCaseId === item.id); },
      error: (error) => this.showError(error),
    });
  }
  closeCommitmentModal() { this.commitmentModalCase = null; this.commitmentModalItems = []; this.commitmentModalLoading = false; }
  loadPatientOptions() {
    if (this.patientOptionsLoading || this.patientOptions.length) return;
    this.requestPatientOptions("");
  }
  patientFileId(patient) { return patient.patientFileId; }
  patientName(patient) { return [patient.firstName, patient.lastName].filter(Boolean).join(" ").trim() || "بیمار بدون نام"; }
  patientPhone(patient) { return _nullishCoalesce(patient.phoneNumber, () => ( "")); }
  patientFileNumber(patient) { return String(_nullishCoalesce(patient.fileNumber, () => ( ""))); }
  patientCanBeSelected(patient) { return this.resolvingPatientFileId !== patient.patientFileId; }
  selectPatient(patient) {
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
      error: (error) => this.showError(error),
    });
  }
   applySelectedPatient(patient, financialPatientId) {
    this.selectedFinancialPatientId = financialPatientId;
    this.createForm.controls.patientId.setValue(financialPatientId);
    this.patientSearch = this.patientName(patient);
    this.patientDropdownOpen = false;
  }
  onPatientSearch(value) {
    this.patientSearch = value;
    this.selectedFinancialPatientId = null;
    this.createForm.controls.patientId.setValue(null);
    this.patientDropdownOpen = true;
    if (this.patientSearchTimer !== null) clearTimeout(this.patientSearchTimer);
    _optionalChain([this, 'access', _27 => _27.patientSearchSubscription, 'optionalAccess', _28 => _28.unsubscribe, 'call', _29 => _29()]);
    this.patientOptionsLoading = false;
    this.patientSearchTimer = setTimeout(() => {
      this.patientSearchTimer = null;
      this.requestPatientOptions(value.trim());
    }, 400);
  }
  closePatientDropdown() { setTimeout(() => { this.patientDropdownOpen = false; this.cdr.markForCheck(); }, 150); }
  addCheque() { this.cheques.push(this.fb.group({ amount: [null, Validators.required], sayadNumber: ["", [Validators.required, Validators.pattern(SAYAD_NUMBER_PATTERN)]], ownerName: ["", Validators.required], dueDate: [null , [Validators.required, todayOrLater]] })); this.createForm.updateValueAndValidity(); }
  addNote() { this.notes.push(this.fb.group({ serialNumber: ["", [Validators.required, Validators.pattern(PROMISSORY_NOTE_SERIAL_PATTERN)]], amount: [null, Validators.required], dueDate: [null , [Validators.required, todayOrLater]] })); this.createForm.updateValueAndValidity(); }
  removeCheque(index) { this.cheques.removeAt(index); this.createForm.updateValueAndValidity(); }
  removeNote(index) { this.notes.removeAt(index); this.createForm.updateValueAndValidity(); }
  applyFilters() {
    this.page = 1; this.load();
  }
  clearFilters() { this.filters.reset(); this.page = 1; this.load(); }
  changePage(delta) { const next = this.page + delta; if (next < 1 || (delta > 0 && this.page * this.pageSize >= this.totalCount)) return; this.page = next; this.load(); }

  load() {
    if (this.activeTab === "create") return;
    this.loading = true;
    const raw = this.filters.getRawValue();
    const query = { ...raw, fromDate: this.apiDate(raw.fromDate), toDate: this.apiDate(raw.toDate), page: this.page, pageSize: this.pageSize };
    if (this.activeTab === "debts" && query.status === null) query.status = DebtStatus.Unpaid;
    if (this.activeTab !== "debts") this.debtCaseIdsWithPendingCommitments.clear();
    const request = (this.isCommitmentTab
      ? this.getCasesWithSelectedCommitment(query)
      : this.activeTab === "cases"
        ? this.api.getCases(query)
        : this.activeTab === "debts"
          ? this.getDebtsWithEligibility(query)
          : this.activeTab === "transactions"
            ? this.api.getTransactions(query)
            : this.api.getDueCommitments(query)) ;
    request.pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => {
      this.items = this.activeTab === "due" ? (_nullishCoalesce(result.items, () => ( []))).filter((item) => this.isNearDue(item.dueDate)) : _nullishCoalesce(result.items, () => ( []));
      this.totalCount = this.activeTab === "due" ? this.items.length : _nullishCoalesce(result.totalCount, () => ( 0));
    }, error: (error) => this.showError(error) });
  }

   getCasesWithSelectedCommitment(query) {
    const commitmentQuery = { ...query, page: 1, pageSize: 100 };
    const commitments = (this.activeTab === "cheques"
      ? this.api.getCheques(commitmentQuery)
      : this.api.getPromissoryNotes(commitmentQuery)) ;
    return forkJoin({ cases: this.api.getCases(query), commitments }).pipe(map(({ cases, commitments: result }) => {
      const caseIds = new Set((_nullishCoalesce(result.items, () => ( []))).map(item => item.patientFinancialCaseId));
      const items = (_nullishCoalesce(cases.items, () => ( []))).filter(item => caseIds.has(item.id));
      return { ...cases, items, totalCount: items.length, totalPages: items.length ? 1 : 0, hasPrevious: false, hasNext: false };
    }));
  }

   getDebtsWithEligibility(query) {
    this.debtEligibilityLoading = true;
    this.debtCaseIdsWithPendingCommitments.clear();
    return this.api.getDebts(query).pipe(
      switchMap(debts => {
        const caseIds = [...new Set((_nullishCoalesce(debts.items, () => ( []))).map(item => item.patientFinancialCaseId))];
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

  submitCase() {
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
    this.api.createCase({ patientId: this.selectedFinancialPatientId, serviceIds: this.serviceIds.controls.map(c => Number(c.value)), totalAmount: Number(value.totalAmount), prePaymentAmount: Number(value.prePaymentAmount), depositAmount: Number(value.depositAmount), agreementType: Number(value.agreementType), paymentMethod: value.paymentMethod, installmentStatus: value.installmentStatus, guaranteeDocument: value.guaranteeDocument, notes: value.notes, consultantName: value.consultantName, toothUnitCount: _nullishCoalesce(value.toothUnitCount, () => ( null)), cheques: value.cheques.map((x) => ({ ...x, amount: Number(x.amount), dueDate: this.iso(x.dueDate) })), promissoryNotes: value.promissoryNotes.map((x) => ({ ...x, amount: Number(x.amount), dueDate: this.iso(x.dueDate) })) }).pipe(finalize(() => { this.submitting = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => { if (!result.isSuccess || !result.data) { this.toast.error(result.message); return; } this.toast.success(result.message || "پرونده مالی با موفقیت ثبت شد."); this.createForm.reset({ prePaymentAmount: 0, depositAmount: 0, agreementType: FinancialAgreementType.Deposit }); this.createSubmitAttempted = false; this.selectedFinancialPatientId = null; this.patientSearch = ""; this.cheques.clear(); this.notes.clear(); this.serviceIds.clear(); this.selectTab("cases"); this.openDetails(result.data.id); }, error: (e) => this.showError(e) });
  }

  openDetails(id) {
    this.loading = true;
    forkJoin({ details: this.api.getCase(id), summary: this.api.getCaseSummary(id) }).pipe(
      finalize(() => { this.loading = false; this.cdr.markForCheck(); }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({ next: ({ details, summary }) => {
      this.details = details;
      this.summary = summary;
      this.detailCheques = _nullishCoalesce(details.cheques, () => ( []));
      this.detailNotes = _nullishCoalesce(details.promissoryNotes, () => ( []));
      this.caseEditForm.reset({
        totalAmount: details.case.totalAmount,
        prePaymentAmount: details.case.prePaymentAmount,
        depositAmount: details.case.depositAmount,
        agreementType: details.case.agreementType,
        paymentMethod: _nullishCoalesce(details.case.paymentMethod, () => ( null)),
        installmentStatus: _nullishCoalesce(details.case.installmentStatus, () => ( null)),
        guaranteeDocument: _nullishCoalesce(details.case.guaranteeDocument, () => ( null)),
        notes: _nullishCoalesce(details.case.notes, () => ( null)),
        consultantName: _nullishCoalesce(details.case.consultantName, () => ( null)),
        toothUnitCount: _nullishCoalesce(details.case.toothUnitCount, () => ( null)),
      });
      this.buildCommitmentEditForms();
    }, error: (e) => this.showError(e) });
  }
  closeDetails() { this.details = null; this.summary = null; this.detailCheques = []; this.detailNotes = []; }

  isDocumentFile(value) {
    return typeof value === "string" && value.startsWith("/uploads/");
  }

  documentUrl(relativePath) {
    return `${environment.apiBaseUrl.replace("/api", "")}${relativePath}`;
  }

  onDocumentFileSelected(event, caseId) {
    const input = event.target ;
    const file = _optionalChain([input, 'access', _30 => _30.files, 'optionalAccess', _31 => _31[0]]);
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      this.toast.error("فقط فایل‌های jpg و png مجاز هستند");
      input.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toast.error("حجم فایل نباید بیشتر از ۵ مگابایت باشد");
      input.value = "";
      return;
    }
    this.uploadDocument(caseId, file);
    input.value = "";
  }

  uploadDocument(caseId, file) {
    if (this.uploadingDocument) return;
    this.uploadingDocument = true;
    this.pendingDocumentCaseId = caseId;
    this.api.uploadGuaranteeDocument(caseId, file)
      .pipe(
        finalize(() => { this.uploadingDocument = false; this.pendingDocumentCaseId = null; this.cdr.markForCheck(); }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: result => {
          if (!result.isSuccess) { this.toast.error(result.message); return; }
          this.toast.success("سند تضمین با موفقیت آپلود شد");
          if (this.details) this.openDetails(this.details.case.id);
        },
        error: (e) => this.showError(e),
      });
  }

  deleteDocument(caseId) {
    if (this.deletingDocument || !confirm("سند تضمین حذف شود؟")) return;
    this.deletingDocument = true;
    this.api.deleteGuaranteeDocument(caseId)
      .pipe(
        finalize(() => { this.deletingDocument = false; this.cdr.markForCheck(); }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: result => {
          if (!result.isSuccess) { this.toast.error(result.message); return; }
          this.toast.success("سند تضمین حذف شد");
          if (this.details) this.openDetails(this.details.case.id);
        },
        error: (e) => this.showError(e),
      });
  }
  canCancelCase(item) { return item.status !== FinancialCaseStatus.Cancelled; }
  cancelCase(item) { if (!this.canCancelCase(item) || !confirm("کل ردیف حسابداری حذف شود؟ ابتدا باید همه چک‌ها و سفته‌ها حذف شده باشند.")) return; this.mutate(item.id, this.api.cancelCase(item.id), "پرونده حسابداری حذف شد."); }
  saveCaseEdit() {
    if (!this.details || this.caseEditForm.invalid) { this.toast.error("مبالغ پرونده معتبر نیستند."); return; }
    const value = this.caseEditForm.getRawValue();
    this.mutate(this.details.case.id, this.api.updateCase(this.details.case.id, {
      totalAmount: Number(value.totalAmount), prePaymentAmount: Number(value.prePaymentAmount),
      depositAmount: Number(value.depositAmount), agreementType: Number(value.agreementType),
      paymentMethod: value.paymentMethod, installmentStatus: value.installmentStatus, guaranteeDocument: value.guaranteeDocument, notes: value.notes, consultantName: value.consultantName, toothUnitCount: _nullishCoalesce(value.toothUnitCount, () => ( null)),
    }), "حسابداری بیمار و همه جمع‌ها به‌روزرسانی شد.");
  }
  saveCheque(index) {
    const item = this.detailCheques[index], form = this.chequeEditForms.at(index);
    if (!item || form.invalid) { this.toast.error("اطلاعات چک معتبر نیست."); return; }
    const value = form.getRawValue();
    this.mutate(item.id, this.api.updateCheque(item.id, { amount: Number(value.amount), sayadNumber: value.sayadNumber, ownerName: value.ownerName, dueDate: this.iso(value.dueDate) }), "چک و محاسبات مالی به‌روزرسانی شد.");
  }
  saveNote(index) {
    const item = this.detailNotes[index], form = this.noteEditForms.at(index);
    if (!item || form.invalid) { this.toast.error("اطلاعات سفته معتبر نیست."); return; }
    const value = form.getRawValue();
    this.mutate(item.id, this.api.updatePromissoryNote(item.id, { amount: Number(value.amount), serialNumber: value.serialNumber, dueDate: this.iso(value.dueDate) }), "سفته و محاسبات مالی به‌روزرسانی شد.");
  }
  deleteCheque(item) { if (confirm("این چک و اثر آن روی پرداخت یا بدهی حذف شود؟")) this.mutate(item.id, this.api.deleteCheque(item.id), "چک حذف و حسابداری به‌روزرسانی شد."); }
  deleteNote(item) { if (confirm("این سفته و اثر آن روی پرداخت یا بدهی حذف شود؟")) this.mutate(item.id, this.api.deletePromissoryNote(item.id), "سفته حذف و حسابداری به‌روزرسانی شد."); }
  updateStatus(kind, id, status, dueDate) {
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
  payDebt(item) { if (!this.canPayDebt(item) || !confirm("تسویه کامل این بدهی ثبت شود؟")) return; this.mutate(item.id, this.api.payDebt(item.id), "بدهی با موفقیت تسویه شد."); }
  canPayDebt(item) { return item.status === DebtStatus.Unpaid && !this.debtEligibilityLoading && !this.debtCaseIdsWithPendingCommitments.has(item.patientFinancialCaseId); }
  caseItem(item) { return item ; }
  chequeItem(item) { return item ; }
  noteItem(item) { return item ; }
  debtItem(item) { return item ; }
  transactionItem(item) { return item ; }
  dueItem(item) { return item ; }
  money(value) { return `${new Intl.NumberFormat("fa-IR").format(_nullishCoalesce(value, () => ( 0)))} تومان`; }
  setAmount(control, value) { control.setValue(value); control.markAsTouched(); }
  normalizeIdentifier(control, event, maxLength) {
    const input = event.target ;
    const digits = input.value
      .replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
      .replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
      .replace(/\D/g, "");
    const normalized = maxLength === undefined ? digits : digits.slice(0, maxLength);
    input.value = normalized;
    control.setValue(normalized);
    control.markAsTouched();
  }
  date(value) { return value ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(value)) : "—"; }
  optionalDate(value) { return value ? this.date(value) : ""; }
  optionalMoney(value) { return value == null ? "" : this.money(value); }
  caseRowNumber(id) {
    if (this.activeTab !== "cases") return "";
    const index = this.items.findIndex(item => item.id === id);
    return index < 0 ? "" : String((this.page - 1) * this.pageSize + index + 1);
  }
  detailChequeDates() {
    return this.detailCheques.filter(item => item.status !== CommitmentStatus.Cancelled)
      .map(item => this.optionalDate(item.dueDate)).filter(Boolean).join("، ");
  }
  detailChequeRegistrations() {
    return this.detailCheques.filter(item => item.status !== CommitmentStatus.Cancelled)
      .map(item => item.sayadNumber).filter(Boolean).join("، ");
  }
  detailNoteSerialNumbers() {
    return this.detailNotes.filter(item => item.status !== CommitmentStatus.Cancelled)
      .map(item => item.serialNumber).filter(Boolean).join("، ");
  }
  chequeDatesLabel(item) {
    return _optionalChain([item, 'access', _32 => _32.chequeDates, 'optionalAccess', _33 => _33.map, 'call', _34 => _34(value => this.date(value)), 'access', _35 => _35.join, 'call', _36 => _36("، ")]) || "—";
  }
  statusLabel(value) { return _nullishCoalesce(({ 1: "در انتظار", 2: "پرداخت‌شده", 3: "پرداخت‌نشده", 4: "لغوشده" } )[value], () => ( "نامشخص")); }
  isCommitmentDue(value) {
    if (!value) return false;
    const dueDate = new Date(value);
    if (Number.isNaN(dueDate.getTime())) return false;
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return dueDate.getTime() <= today.getTime();
  }
  isNearDue(value) {
    if (!value) return false;
    const dueDate = new Date(value); if (Number.isNaN(dueDate.getTime())) return false;
    const today = new Date(); dueDate.setHours(0, 0, 0, 0); today.setHours(0, 0, 0, 0);
    return Math.ceil((dueDate.getTime() - today.getTime()) / 86400000) <= 3;
  }
  patientReference(name, fileNumber) { return `${_optionalChain([name, 'optionalAccess', _37 => _37.trim, 'call', _38 => _38()]) || "بیمار"} به شماره پرونده ${fileNumber || "—"}`; }
  recordFileNumber(item) { return _nullishCoalesce(_nullishCoalesce(item.patientFileNumber, () => ( item.fileNumber)), () => ( null)); }
  serviceLabel(serviceIds, serviceNames) {
    const labels = (_nullishCoalesce(serviceIds, () => ( []))).map(id => _nullishCoalesce(_nullishCoalesce(_optionalChain([this, 'access', _39 => _39.services, 'access', _40 => _40.find, 'call', _41 => _41(s => s.id === id), 'optionalAccess', _42 => _42.label]), () => ( _optionalChain([serviceNames, 'optionalAccess', _43 => _43.find, 'call', _44 => _44((_, i) => (_nullishCoalesce(serviceIds, () => ( [])))[i] === id)]))), () => ( String(id))));
    if (labels.length) return labels.join("، ");
    return (_nullishCoalesce(serviceNames, () => ( []))).filter(Boolean).join("، ") || "—";
  }
   iso(value) { return value.toISOString(); }
   apiDate(value) {
    if (!value) return null;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
   buildCommitmentEditForms() {
    this.chequeEditForms.clear();
    this.noteEditForms.clear();
    this.detailCheques.forEach(item => this.chequeEditForms.push(this.fb.group({ amount: [item.amount, Validators.required], sayadNumber: [item.sayadNumber, Validators.required], ownerName: [item.ownerName, Validators.required], dueDate: [new Date(item.dueDate), Validators.required] })));
    this.detailNotes.forEach(item => this.noteEditForms.push(this.fb.group({ amount: [item.amount, Validators.required], serialNumber: [item.serialNumber, Validators.required], dueDate: [new Date(item.dueDate), Validators.required] })));
  }
   requestPatientOptions(searchText) {
    if (this.patientSearchTimer !== null) {
      clearTimeout(this.patientSearchTimer);
      this.patientSearchTimer = null;
    }
    _optionalChain([this, 'access', _45 => _45.patientSearchSubscription, 'optionalAccess', _46 => _46.unsubscribe, 'call', _47 => _47()]);
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
      error: (error) => this.showError(error),
    });
  }
   mutate(id, request, success) { if (this.actionId !== null) return; this.actionId = id; request.pipe(finalize(() => { this.actionId = null; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: r => { if (!r.isSuccess) { this.toast.error(r.message); return; } this.toast.success(r.message || success); this.load(); if (this.details) this.openDetails(this.details.case.id); }, error: e => this.showError(e) }); }
   showError(error) { this.toast.error(_optionalChain([error, 'access', _48 => _48.error, 'optionalAccess', _49 => _49.message]) || error.message || "ارتباط با سرور انجام نشد."); }
}
