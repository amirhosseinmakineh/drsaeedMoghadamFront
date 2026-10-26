 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";












import { downloadBlob } from "../../utils/file-download.util";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import { formatIranDateTime, toIranDateInputValue } from "../../utils/iran-datetime.util";
import { BaseModalComponent } from "../../basemadual";
import { PatientFinanceDetailsComponent } from "../../shared/patient-finance/patient-finance-details.component";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-admin-patient-finance-report",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDatepickerComponent, BaseModalComponent, PatientFinanceDetailsComponent],
  templateUrl: "./admin-patient-finance-report.component.html",
  styleUrl: "./admin-patient-finance-report.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPatientFinanceReportComponent  {
  __init() {this.filters = { page: 1, pageSize: 20 }}
  __init2() {this.report = null}
  __init3() {this.loading = false}
  __init4() {this.downloading = false}
  __init5() {this.errorMessage = ""}
  __init6() {this.editing = null}
  __init7() {this.editForm = { totalAmount: 0, prePaymentAmount: 0, depositAmount: 0, agreementType: 1 }}
  __init8() {this.saving = false}
  __init9() {this.deletingId = null}
  __init10() {this.details = null}
  __init11() {this.detailsLoading = false}
  __init12() {this.commitmentSavingId = null}
  
  
   __init13() {this.fromDateLabel = { fa: "از تاریخ ثبت حسابداری", en: "From date" }}
   __init14() {this.toDateLabel = { fa: "تا تاریخ ثبت حسابداری", en: "To date" }}
  __init15() {this.statementsFile = null}
  __init16() {this.statementsLoading = false}
  __init17() {this.statementsError = ""}
  __init18() {this.uploadingDocument = false}
  __init19() {this.deletingDocument = false}

   __init20() {this.services = [
    { value: 1, label: "کامپوزیت" },
    { value: 2, label: "ایمپلنت" },
    { value: 3, label: "لمینت" },
    { value: 4, label: "روکش" },
    { value: 5, label: "عصب کشی" },
    { value: 6, label: "ترمیم" },
    { value: 7, label: "کشیدن دندان" },
  ]}

  constructor(
      api,
      toast,
      cdr,
  ) {;this.api = api;this.toast = toast;this.cdr = cdr;AdminPatientFinanceReportComponent.prototype.__init.call(this);AdminPatientFinanceReportComponent.prototype.__init2.call(this);AdminPatientFinanceReportComponent.prototype.__init3.call(this);AdminPatientFinanceReportComponent.prototype.__init4.call(this);AdminPatientFinanceReportComponent.prototype.__init5.call(this);AdminPatientFinanceReportComponent.prototype.__init6.call(this);AdminPatientFinanceReportComponent.prototype.__init7.call(this);AdminPatientFinanceReportComponent.prototype.__init8.call(this);AdminPatientFinanceReportComponent.prototype.__init9.call(this);AdminPatientFinanceReportComponent.prototype.__init10.call(this);AdminPatientFinanceReportComponent.prototype.__init11.call(this);AdminPatientFinanceReportComponent.prototype.__init12.call(this);AdminPatientFinanceReportComponent.prototype.__init13.call(this);AdminPatientFinanceReportComponent.prototype.__init14.call(this);AdminPatientFinanceReportComponent.prototype.__init15.call(this);AdminPatientFinanceReportComponent.prototype.__init16.call(this);AdminPatientFinanceReportComponent.prototype.__init17.call(this);AdminPatientFinanceReportComponent.prototype.__init18.call(this);AdminPatientFinanceReportComponent.prototype.__init19.call(this);AdminPatientFinanceReportComponent.prototype.__init20.call(this);}

  ngOnInit() { this.load(); }

  load(resetPage = false) {
    if (this.loading) return;
    if (this.filters.fromDate && this.filters.toDate && this.filters.fromDate > this.filters.toDate) {
      this.toast.error("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد");
      return;
    }
    if (resetPage) this.filters.page = 1;
    this.loading = true;
    this.errorMessage = "";
    this.api.getPatientFinanceReport(this.filters)
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: report => {
          this.report = report;
          // اگر modal باز است، editing را با داده جدید sync کن
          if (this.editing) {
            const updated = report.items.find(i => i.caseId === this.editing.caseId);
            if (updated) this.editing = updated;
          }
          this.cdr.markForCheck();
        },
        error: error => {
          this.errorMessage = _optionalChain([error, 'optionalAccess', _2 => _2.message]) || "دریافت گزارش انجام نشد";
          this.toast.error(this.errorMessage);
        },
      });
  }

  clear() {
    this.filters = { page: 1, pageSize: 20 };
    this.fromDate = undefined;
    this.toDate = undefined;
    this.load();
  }

  setFromDate(date) {
    this.fromDate = date;
    this.filters.fromDate = toIranDateInputValue(date);
    this.cdr.markForCheck();
  }

  setToDate(date) {
    this.toDate = date;
    this.filters.toDate = toIranDateInputValue(date);
    this.cdr.markForCheck();
  }

  download() {
    if (this.downloading) return;
    this.downloading = true;
    this.api.exportPatientFinanceReport(this.filters)
      .pipe(finalize(() => { this.downloading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: blob => {
          downloadBlob(blob, `patient-finance-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
          this.toast.success("خروجی اکسل حسابداری بیماران دانلود شد");
        },
        error: error => this.toast.error(_optionalChain([error, 'optionalAccess', _3 => _3.message]) || "دریافت فایل انجام نشد"),
      });
  }

  openStatements(item) {
    this.statementsFile = {
      id: 0,
      fileNumber: Number(item.fileNumber),
      firstName: item.patientName,
      lastName: "",
      phoneNumber: item.phoneNumber,
      finance: null,
    };
    this.loadStatements(item.fileNumber);
  }

  retryStatements() {
    if (this.statementsFile) this.loadStatements(String(this.statementsFile.fileNumber));
  }

  closeStatements() {
    this.statementsFile = null;
    this.statementsError = "";
    this.statementsLoading = false;
  }

   loadStatements(fileNumber) {
    if (!fileNumber || this.statementsLoading) {
      if (!fileNumber) this.statementsError = "شماره پرونده بیمار برای دریافت صورت‌حساب موجود نیست.";
      return;
    }
    this.statementsLoading = true;
    this.statementsError = "";
    this.api.getPatientFinanceFile(fileNumber).pipe(finalize(() => {
      this.statementsLoading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: file => {
        if (!file) {
          this.statementsError = "پرونده بیمار یافت نشد.";
          return;
        }
        this.statementsFile = file;
      },
      error: error => this.statementsError = _optionalChain([error, 'optionalAccess', _4 => _4.message]) || "دریافت صورت‌حساب‌های بیمار انجام نشد",
    });
  }

  startEdit(item) {
    this.editing = item;
    this.editForm = {
      totalAmount: item.totalAmount,
      prePaymentAmount: item.prePaymentAmount,
      depositAmount: item.depositAmount,
      agreementType: item.agreementType,
      paymentMethod: _nullishCoalesce(item.paymentMethod, () => ( null)),
      installmentStatus: _nullishCoalesce(item.installmentStatus, () => ( null)),
      guaranteeDocument: _nullishCoalesce(item.guaranteeDocument, () => ( null)),
      notes: _nullishCoalesce(item.notes, () => ( null)),
      consultantName: _nullishCoalesce(item.consultantName, () => ( null)),
      toothUnitCount: _nullishCoalesce(item.toothUnitCount, () => ( null)),
    };
  }

  cancelEdit() { this.editing = null; this.details = null; }

  openDetails(item) {
    this.startEdit(item);
    this.details = null;
    this.detailsLoading = true;
    this.fetchDetails(item.caseId);
  }

   fetchDetails(caseId) {
    this.detailsLoading = true;
    this.api.getPatientFinanceDetails(caseId).pipe(finalize(() => {
      this.detailsLoading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: response => {
        if (!response.isSuccess || !response.data) { this.toast.error(response.message); return; }
        this.details = {
          ...response.data,
          cheques: (_nullishCoalesce(response.data.cheques, () => ( []))).map((cheque) => ({
            ...cheque,
            dueDate: this.toDateInputValue(cheque.dueDate),
          })),
          promissoryNotes: (_nullishCoalesce(response.data.promissoryNotes, () => ( []))).map((note) => ({
            ...note,
            dueDate: this.toDateInputValue(note.dueDate),
          })),
        };
      },
      error: error => this.toast.error(_optionalChain([error, 'optionalAccess', _5 => _5.message]) || "دریافت جزئیات انجام نشد"),
    });
  }

  saveEdit() {
    if (!this.editing || this.saving) return;
    if (this.editForm.totalAmount <= 0 || this.editForm.prePaymentAmount < 0 || this.editForm.depositAmount < 0) {
      this.toast.error("مبالغ واردشده معتبر نیستند");
      return;
    }
    if (this.editForm.prePaymentAmount + this.editForm.depositAmount > this.editForm.totalAmount) {
      this.toast.error("مجموع پیش‌پرداخت و ودیعه نمی‌تواند بیشتر از مبلغ کل باشد");
      return;
    }
    this.saving = true;
    const caseId = this.editing.caseId;
    this.api.updatePatientFinance(caseId, this.editForm)
      .pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: response => {
          if (!response.isSuccess) { this.toast.error(response.message); return; }
          this.toast.success(response.message || "حسابداری بیمار ویرایش شد");
          // modal را نمی‌بندیم — فقط لیست و details را refresh می‌کنیم
          this.load();
          this.fetchDetails(caseId);
        },
        error: error => this.toast.error(_optionalChain([error, 'optionalAccess', _6 => _6.message]) || "ویرایش انجام نشد"),
      });
  }

  delete(item) {
    if (this.deletingId || !confirm(`حسابداری ${item.patientName} حذف شود؟`)) return;
    this.deletingId = item.caseId;
    this.api.deletePatientFinance(item.caseId)
      .pipe(finalize(() => { this.deletingId = null; this.cdr.markForCheck(); }))
      .subscribe({
        next: response => {
          if (!response.isSuccess) { this.toast.error(response.message); return; }
          this.toast.success(response.message || "حسابداری بیمار حذف شد");
          this.cancelEdit();
          this.load();
        },
        error: error => this.toast.error(_optionalChain([error, 'optionalAccess', _7 => _7.message]) || "حذف انجام نشد"),
      });
  }

  saveCheque(item) {
    if (this.commitmentSavingId || item.amount <= 0 || !_optionalChain([item, 'access', _8 => _8.sayadNumber, 'optionalAccess', _9 => _9.trim, 'call', _10 => _10()]) || !_optionalChain([item, 'access', _11 => _11.ownerName, 'optionalAccess', _12 => _12.trim, 'call', _13 => _13()]) || !item.dueDate) return;
    this.commitmentSavingId = item.id;
    this.api.updatePatientCheque(item.id, { amount: item.amount, sayadNumber: item.sayadNumber, ownerName: item.ownerName, dueDate: item.dueDate })
      .pipe(finalize(() => { this.commitmentSavingId = null; this.cdr.markForCheck(); }))
      .subscribe({ next: response => this.afterCommitment(response), error: error => this.toast.error(_optionalChain([error, 'optionalAccess', _14 => _14.message]) || "ویرایش چک انجام نشد") });
  }

  saveNote(item) {
    if (this.commitmentSavingId || item.amount <= 0 || !_optionalChain([item, 'access', _15 => _15.serialNumber, 'optionalAccess', _16 => _16.trim, 'call', _17 => _17()]) || !item.dueDate) return;
    this.commitmentSavingId = item.id;
    this.api.updatePatientPromissoryNote(item.id, { amount: item.amount, serialNumber: item.serialNumber, dueDate: item.dueDate })
      .pipe(finalize(() => { this.commitmentSavingId = null; this.cdr.markForCheck(); }))
      .subscribe({ next: response => this.afterCommitment(response), error: error => this.toast.error(_optionalChain([error, 'optionalAccess', _18 => _18.message]) || "ویرایش سفته انجام نشد") });
  }

  deleteCheque(item) {
    if (this.commitmentSavingId || !confirm("چک و اثر مالی آن حذف شود؟")) return;
    this.commitmentSavingId = item.id;
    this.api.deletePatientCheque(item.id).pipe(finalize(() => { this.commitmentSavingId = null; this.cdr.markForCheck(); }))
      .subscribe({ next: response => this.afterCommitment(response), error: error => this.toast.error(_optionalChain([error, 'optionalAccess', _19 => _19.message]) || "حذف چک انجام نشد") });
  }

  deleteNote(item) {
    if (this.commitmentSavingId || !confirm("سفته و اثر مالی آن حذف شود؟")) return;
    this.commitmentSavingId = item.id;
    this.api.deletePatientPromissoryNote(item.id).pipe(finalize(() => { this.commitmentSavingId = null; this.cdr.markForCheck(); }))
      .subscribe({ next: response => this.afterCommitment(response), error: error => this.toast.error(_optionalChain([error, 'optionalAccess', _20 => _20.message]) || "حذف سفته انجام نشد") });
  }

   afterCommitment(response) {
    if (!response.isSuccess) { this.toast.error(response.message); return; }
    this.toast.success(response.message);
    if (this.editing) this.fetchDetails(this.editing.caseId);
    this.load();
  }

  isDocumentFile(value) {
    return typeof value === "string" && value.startsWith("/uploads/");
  }

  documentUrl(relativePath) {
    return `${environment.apiBaseUrl.replace("/api", "")}${relativePath}`;
  }

  onDocumentFileSelected(event, caseId) {
    const file = _optionalChain([(event.target ), 'access', _21 => _21.files, 'optionalAccess', _22 => _22[0]]);
    if (!file || this.uploadingDocument) return;
    this.uploadingDocument = true;
    this.api.uploadGuaranteeDocument(caseId, file)
      .pipe(finalize(() => { this.uploadingDocument = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: result => {
          if (!result.isSuccess) { this.toast.error(result.message); return; }
          this.toast.success("سند تضمین با موفقیت آپلود شد");
          const path = _nullishCoalesce(_optionalChain([result, 'access', _23 => _23.data, 'optionalAccess', _24 => _24.guaranteeDocument]), () => ( null));
          this.patchGuaranteeDocument(path);
        },
        error: err => this.toast.error(_optionalChain([err, 'optionalAccess', _25 => _25.message]) || "آپلود سند تضمین انجام نشد"),
      });
  }

  deleteDocument(caseId) {
    if (this.deletingDocument || !confirm("سند تضمین حذف شود؟")) return;
    this.deletingDocument = true;
    this.api.deleteGuaranteeDocument(caseId)
      .pipe(finalize(() => { this.deletingDocument = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: result => {
          if (!result.isSuccess) { this.toast.error(result.message); return; }
          this.toast.success("سند تضمین حذف شد");
          this.patchGuaranteeDocument(null);
        },
        error: err => this.toast.error(_optionalChain([err, 'optionalAccess', _26 => _26.message]) || "حذف سند تضمین انجام نشد"),
      });
  }

   patchGuaranteeDocument(path) {
    if (this.details) {
      this.details = { ...this.details, case: { ...this.details.case, guaranteeDocument: path } };
    }
    if (this.editing) {
      this.editing = { ...this.editing, guaranteeDocument: path };
    }
    this.editForm = { ...this.editForm, guaranteeDocument: path };
    this.cdr.markForCheck();
  }

   toDateInputValue(value) {
    return _nullishCoalesce(_optionalChain([value, 'optionalAccess', _27 => _27.slice, 'call', _28 => _28(0, 10)]), () => ( ""));
  }

  goTo(page) {
    if (page < 1 || page > this.totalPages || page === this.filters.page) return;
    this.filters.page = page;
    this.load();
  }

  money(value) {
    return `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 3 }).format(value || 0)} تومان`;
  }

  agreement(value) { return value === 1 ? "پیش‌پرداخت" : value === 2 ? "ودیعه" : "—"; }
  status(value) { return value === 1 ? "فعال" : value === 2 ? "تسویه‌شده" : value === 3 ? "لغوشده" : "—"; }
  date(value) { return formatIranDateTime(value); }
  chequeDatesLabel(item) {
    return _optionalChain([item, 'access', _29 => _29.chequeDates, 'optionalAccess', _30 => _30.map, 'call', _31 => _31(value => this.date(value)), 'access', _32 => _32.join, 'call', _33 => _33("، ")]) || "—";
  }
  trackCase(_, item) { return item.caseId; }

  get totalPages() {
    return Math.max(1, Math.ceil((_optionalChain([this, 'access', _34 => _34.report, 'optionalAccess', _35 => _35.totalCount]) || 0) / this.filters.pageSize));
  }
}
