 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule, } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectionStrategy, } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import {
  BaseBadgeComponent, BaseButtonComponent, BaseCardComponent, BaseConfirmDialogComponent,
  BaseContentContainerComponent, BaseEmptyStateComponent, BaseFilterBarComponent,
  BaseLoadingComponent, BaseModalComponent, BasePageHeaderComponent, BasePageShellComponent,
  BaseSearchFilterComponent, BaseSelectFilterComponent, BaseTablePaginationComponent,
} from "../../../basemadual";



import { SecretaryAccountShellComponent } from "../account/components/secretary-account-shell/secretary-account-shell.component";
import { PatientFinanceDetailsComponent } from "../../../shared/patient-finance/patient-finance-details.component";

@Component({
  selector: "app-patient-files-page",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseBadgeComponent, BaseButtonComponent, BaseCardComponent,
    BaseConfirmDialogComponent, BaseContentContainerComponent, BaseEmptyStateComponent,
    BaseFilterBarComponent, BaseLoadingComponent, BaseModalComponent, BasePageHeaderComponent,
    BasePageShellComponent, BaseSearchFilterComponent, BaseSelectFilterComponent,
    BaseTablePaginationComponent, SecretaryAccountShellComponent, PatientFinanceDetailsComponent],
  templateUrl: "./patient-files-page.component.html",
  styleUrl: "./patient-files-page.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientFilesPageComponent  {
  __init() {this.files = []}
  __init2() {this.totalCount = 0}
  __init3() {this.query = { search: "", fileNumber: "", sourceType: "", page: 1, pageSize: 10 }}
  __init4() {this.loading = false}
  __init5() {this.loadError = ""}
  __init6() {this.createOpen = false}
  __init7() {this.eligible = []}
  __init8() {this.eligibleSearch = ""}
  __init9() {this.eligiblePage = 1}
  __init10() {this.eligibleTotal = 0}
  __init11() {this.eligibleLoading = false}
  __init12() {this.selectedPatient = null}
  __init13() {this.newPatientOpen = false}
  __init14() {this.createForm = { firstName: "", lastName: "", phoneNumber: "", description: "" }}
  __init15() {this.creating = false}
  __init16() {this.editOpen = false}
  __init17() {this.editing = null}
  __init18() {this.editForm = { firstName: "", lastName: "", phoneNumber: "", description: "" }}
  __init19() {this.updating = false}
  __init20() {this.deleting = null}
  __init21() {this.deleteLoading = false}
  __init22() {this.importOpen = false}
  __init23() {this.importFile = null}
  __init24() {this.importing = false}
  __init25() {this.importErrors = []}
  __init26() {this.financeFile = null}
  __init27() {this.financeRefreshing = false}
  __init28() {this.financeError = ""}
   __init29() {this.sourceOptions = [{ value: "System", label: "جدید" }, { value: "Legacy", label: "قدیمی" }]}
   __init30() {this.pageSizeOptions = [{ value: 10, label: "۱۰ ردیف" }, { value: 20, label: "۲۰ ردیف" }, { value: 50, label: "۵۰ ردیف" }]}

  constructor(  api,   toast,
      cdr,  location) {;this.api = api;this.toast = toast;this.cdr = cdr;this.location = location;PatientFilesPageComponent.prototype.__init.call(this);PatientFilesPageComponent.prototype.__init2.call(this);PatientFilesPageComponent.prototype.__init3.call(this);PatientFilesPageComponent.prototype.__init4.call(this);PatientFilesPageComponent.prototype.__init5.call(this);PatientFilesPageComponent.prototype.__init6.call(this);PatientFilesPageComponent.prototype.__init7.call(this);PatientFilesPageComponent.prototype.__init8.call(this);PatientFilesPageComponent.prototype.__init9.call(this);PatientFilesPageComponent.prototype.__init10.call(this);PatientFilesPageComponent.prototype.__init11.call(this);PatientFilesPageComponent.prototype.__init12.call(this);PatientFilesPageComponent.prototype.__init13.call(this);PatientFilesPageComponent.prototype.__init14.call(this);PatientFilesPageComponent.prototype.__init15.call(this);PatientFilesPageComponent.prototype.__init16.call(this);PatientFilesPageComponent.prototype.__init17.call(this);PatientFilesPageComponent.prototype.__init18.call(this);PatientFilesPageComponent.prototype.__init19.call(this);PatientFilesPageComponent.prototype.__init20.call(this);PatientFilesPageComponent.prototype.__init21.call(this);PatientFilesPageComponent.prototype.__init22.call(this);PatientFilesPageComponent.prototype.__init23.call(this);PatientFilesPageComponent.prototype.__init24.call(this);PatientFilesPageComponent.prototype.__init25.call(this);PatientFilesPageComponent.prototype.__init26.call(this);PatientFilesPageComponent.prototype.__init27.call(this);PatientFilesPageComponent.prototype.__init28.call(this);PatientFilesPageComponent.prototype.__init29.call(this);PatientFilesPageComponent.prototype.__init30.call(this);}

  ngOnInit() { this.loadFiles(); }

  loadFiles() {
    this.closeFinance();
    this.loading = true; this.loadError = "";
    this.api.getPatientFiles(this.query).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (result) => { this.files = result.items; this.totalCount = result.totalCount; },
        error: (error) => this.loadError = this.errorMessage(error, "دریافت پرونده‌های بیمار انجام نشد.") });
  }

  filterChanged(field, value) {
    this.query = { ...this.query, [field]: value, page: 1 }; this.loadFiles();
  }
  resetFilters() { this.query = { ...this.query, search: "", fileNumber: "", sourceType: "", page: 1 }; this.loadFiles(); }
  changePage(page) { this.query = { ...this.query, page }; this.loadFiles(); }
  changePageSize(value) { this.query = { ...this.query, pageSize: Number(value), page: 1 }; this.loadFiles(); }

  openFinance(file) { this.financeFile = file; this.financeError = ""; this.refreshFinance(); }
  refreshFinance() {
    if (!this.financeFile || this.financeRefreshing) return;
    const id = this.financeFile.id; this.financeRefreshing = true; this.financeError = "";
    this.api.getPatientFileById(id).pipe(finalize(() => { this.financeRefreshing = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (file) => { if (_optionalChain([this, 'access', _ => _.financeFile, 'optionalAccess', _2 => _2.id]) === id) this.financeFile = file; },
        error: (error) => this.financeError = this.errorMessage(error, "دریافت اطلاعات مالی انجام نشد.") });
  }
  closeFinance() { this.financeFile = null; this.financeError = ""; this.financeRefreshing = false; }
  openCreate() {
    this.createOpen = true;
    this.selectedPatient = null;
    this.eligibleSearch = "";
    this.eligiblePage = 1;
    this.loadEligible();
  }
  closeCreate() { if (!this.creating) this.createOpen = false; }
  loadEligible() {
    this.eligibleLoading = true;
    this.api.getEligiblePatients({ search: this.eligibleSearch, page: this.eligiblePage, pageSize: 8 })
      .pipe(finalize(() => { this.eligibleLoading = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (result) => { this.eligible = result.items; this.eligibleTotal = result.totalCount; },
        error: (error) => this.toast.error(this.errorMessage(error, "دریافت بیماران دارای رزرو انجام نشد.")) });
  }
  searchEligible(value) { this.eligibleSearch = value; this.eligiblePage = 1; this.selectedPatient = null; this.loadEligible(); }
  selectPatient(patient) { this.selectedPatient = patient; }
  create() {
    if (this.creating || !this.selectedPatient) return;
    this.creating = true;
    this.api.createFromReservation(this.selectedPatient.id).pipe(finalize(() => { this.creating = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (result) => { this.toast.success(`پرونده با شماره ${result.fileNumber} ثبت شد.`); this.createOpen = false; this.loadFiles(); },
        error: (error) => this.toast.error(this.errorMessage(error, "ثبت پرونده انجام نشد.")) });
  }
  openNewPatient() {
    this.createForm = { firstName: "", lastName: "", phoneNumber: "", description: "" };
    this.newPatientOpen = true;
  }
  closeNewPatient() { if (!this.creating) this.newPatientOpen = false; }
  createNewPatient() {
    if (this.creating || !this.isCreateValid()) return;
    this.creating = true;
    const request = {
      firstName: this.createForm.firstName.trim(),
      lastName: this.createForm.lastName.trim(),
      phoneNumber: this.createForm.phoneNumber.trim(),
      description: this.createForm.description.trim() || undefined,
    };
    this.api.createPatientFile(request).pipe(finalize(() => { this.creating = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (result) => { this.toast.success(`بیمار با موفقیت ثبت شد. شماره پرونده: ${result.fileNumber}`); this.newPatientOpen = false; this.loadFiles(); },
        error: (error) => this.toast.error(this.errorMessage(error, "ثبت بیمار انجام نشد.")) });
  }
  isCreateValid() {
    return !!this.createForm.firstName.trim() &&
      !!this.createForm.lastName.trim() &&
      /^09\d{9}$/.test(this.createForm.phoneNumber.trim());
  }

  openEdit(file) {
    this.editing = file; this.editForm = { firstName: file.firstName, lastName: file.lastName, phoneNumber: file.phoneNumber, description: _nullishCoalesce(file.description, () => ( "")) }; this.editOpen = true;
  }
  closeEdit() { if (!this.updating) this.editOpen = false; }
  update() {
    if (!this.editing || this.updating || !this.editForm.firstName.trim() || !this.editForm.lastName.trim() || !this.editForm.phoneNumber.trim()) return;
    this.updating = true;
    const body = { firstName: this.editForm.firstName.trim(), lastName: this.editForm.lastName.trim(), phoneNumber: this.editForm.phoneNumber.trim(), description: this.editForm.description.trim() || null };
    this.api.updatePatientFile(this.editing.id, body).pipe(finalize(() => { this.updating = false; this.cdr.markForCheck(); }))
      .subscribe({ next: () => { this.toast.success("اطلاعات پرونده با موفقیت ویرایش شد."); this.editOpen = false; this.loadFiles(); },
        error: (error) => this.toast.error(this.errorMessage(error, "ویرایش پرونده انجام نشد.")) });
  }
  remove() {
    if (!this.deleting || this.deleteLoading) return;
    this.deleteLoading = true;
    this.api.deletePatientFile(this.deleting.id).pipe(finalize(() => { this.deleteLoading = false; this.cdr.markForCheck(); }))
      .subscribe({ next: () => { this.toast.success("پرونده با موفقیت حذف شد."); this.deleting = null; this.loadFiles(); },
        error: (error) => this.toast.error(this.errorMessage(error, "حذف پرونده انجام نشد.")) });
  }

  chooseFile(event) {
    this.importErrors = []; const file = _nullishCoalesce(_optionalChain([(event.target ), 'access', _3 => _3.files, 'optionalAccess', _4 => _4[0]]), () => ( null));
    this.importFile = _optionalChain([file, 'optionalAccess', _5 => _5.name, 'access', _6 => _6.toLowerCase, 'call', _7 => _7(), 'access', _8 => _8.endsWith, 'call', _9 => _9(".xlsx")]) ? file : null;
    if (file && !this.importFile) this.importErrors = ["فقط فایل با فرمت .xlsx قابل بارگذاری است."];
  }
  importLegacy() {
    if (!this.importFile || this.importing) return;
    this.importing = true; this.importErrors = [];
    this.api.importLegacyPatientFiles(this.importFile).pipe(finalize(() => { this.importing = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (result) => { this.toast.success(`${result.importedCount} پرونده قدیمی با موفقیت وارد شد.`); this.importOpen = false; this.loadFiles(); },
        error: (error) => this.importErrors = this.errorDetails(error) });
  }

  sourceLabel(source) { return source === "Legacy" ? "قدیمی" : "جدید"; }
   errorMessage(error, fallback) { return _nullishCoalesce(this.errorDetails(error)[0], () => ( fallback)); }
   errorDetails(error) {
    const payload = error instanceof HttpErrorResponse ? error.error : error;
    if (typeof payload === "string") return [payload];
    const body = payload ;
    const rows = _nullishCoalesce(_optionalChain([body, 'optionalAccess', _10 => _10.rowErrors]), () => ( _optionalChain([body, 'optionalAccess', _11 => _11.errors])));
    if (Array.isArray(rows) && rows.length) return rows.map((item) => {
      if (typeof item === "string") return item;
      const row = item ;
      const number = _nullishCoalesce(row.row, () => ( row.rowNumber));
      return `${number ? `ردیف ${number}: ` : ""}${_nullishCoalesce(_nullishCoalesce(row.message, () => ( row.error)), () => ( "خطای نامشخص"))}`;
    });
    return [_nullishCoalesce(_nullishCoalesce(_optionalChain([body, 'optionalAccess', _12 => _12.message]), () => ( _optionalChain([body, 'optionalAccess', _13 => _13.detail]))), () => ( "خطایی در ارتباط با سرور رخ داد."))];
  }
}
