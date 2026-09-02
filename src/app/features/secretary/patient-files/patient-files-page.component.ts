import { CommonModule, Location } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import {
  BaseBadgeComponent, BaseButtonComponent, BaseCardComponent, BaseConfirmDialogComponent,
  BaseContentContainerComponent, BaseEmptyStateComponent, BaseFilterBarComponent,
  BaseLoadingComponent, BaseModalComponent, BasePageHeaderComponent, BasePageShellComponent,
  BaseSearchFilterComponent, BaseSelectFilterComponent, BaseTablePaginationComponent,
} from "../../../basemadual";
import { ToastService } from "../../../core/toast/toast.service";
import { EligiblePatient, PatientFile, PatientFileQuery } from "./patient-file.models";
import { PatientFilesService } from "./patient-files.service";
import { SecretaryAccountShellComponent } from "../account/components/secretary-account-shell/secretary-account-shell.component";

@Component({
  selector: "app-patient-files-page",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseBadgeComponent, BaseButtonComponent, BaseCardComponent,
    BaseConfirmDialogComponent, BaseContentContainerComponent, BaseEmptyStateComponent,
    BaseFilterBarComponent, BaseLoadingComponent, BaseModalComponent, BasePageHeaderComponent,
    BasePageShellComponent, BaseSearchFilterComponent, BaseSelectFilterComponent,
    BaseTablePaginationComponent, SecretaryAccountShellComponent],
  templateUrl: "./patient-files-page.component.html",
  styleUrl: "./patient-files-page.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientFilesPageComponent implements OnInit {
  files: PatientFile[] = [];
  totalCount = 0;
  query: PatientFileQuery = { search: "", fileNumber: "", sourceType: "", page: 1, pageSize: 10 };
  loading = false;
  loadError = "";
  createOpen = false;
  eligible: EligiblePatient[] = [];
  eligibleSearch = "";
  eligiblePage = 1;
  eligibleTotal = 0;
  eligibleLoading = false;
  selectedPatient: EligiblePatient | null = null;
  creating = false;
  editOpen = false;
  editing: PatientFile | null = null;
  editForm = { firstName: "", lastName: "", phoneNumber: "" };
  updating = false;
  deleting: PatientFile | null = null;
  deleteLoading = false;
  importOpen = false;
  importFile: File | null = null;
  importing = false;
  importErrors: string[] = [];
  financeFile: PatientFile | null = null;
  financeRefreshing = false;
  financeError = "";
  readonly sourceOptions = [{ value: "System", label: "جدید" }, { value: "Legacy", label: "قدیمی" }];
  readonly pageSizeOptions = [{ value: 10, label: "۱۰ ردیف" }, { value: 20, label: "۲۰ ردیف" }, { value: 50, label: "۵۰ ردیف" }];

  constructor(private readonly api: PatientFilesService, private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef, readonly location: Location) {}

  ngOnInit(): void { this.loadFiles(); }

  loadFiles(): void {
    this.closeFinance();
    this.loading = true; this.loadError = "";
    this.api.getPatientFiles(this.query).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (result) => { this.files = result.items; this.totalCount = result.totalCount; },
        error: (error) => this.loadError = this.errorMessage(error, "دریافت پرونده‌های بیمار انجام نشد.") });
  }

  filterChanged(field: "search" | "fileNumber" | "sourceType", value: string): void {
    this.query = { ...this.query, [field]: value, page: 1 }; this.loadFiles();
  }
  resetFilters(): void { this.query = { ...this.query, search: "", fileNumber: "", sourceType: "", page: 1 }; this.loadFiles(); }
  changePage(page: number): void { this.query = { ...this.query, page }; this.loadFiles(); }
  changePageSize(value: string): void { this.query = { ...this.query, pageSize: Number(value), page: 1 }; this.loadFiles(); }

  openFinance(file: PatientFile): void { this.financeFile = file; this.financeError = ""; this.refreshFinance(); }
  refreshFinance(): void {
    if (!this.financeFile || this.financeRefreshing) return;
    const id = this.financeFile.id; this.financeRefreshing = true; this.financeError = "";
    this.api.getPatientFileById(id).pipe(finalize(() => { this.financeRefreshing = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (file) => { if (this.financeFile?.id === id) this.financeFile = file; },
        error: (error) => this.financeError = this.errorMessage(error, "دریافت اطلاعات مالی انجام نشد.") });
  }
  closeFinance(): void { this.financeFile = null; this.financeError = ""; this.financeRefreshing = false; }
  money(value: number): string { return `${new Intl.NumberFormat("fa-IR").format(value)} تومان`; }
  date(value: string): string { const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? "—" : new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(parsed); }
  agreementLabel(value: number): string { return ({ 1: "پیش‌پرداخت", 2: "بیعانه" } as Record<number, string>)[value] ?? "نامشخص"; }
  caseStatusLabel(value: number): string { return ({ 1: "فعال", 2: "تکمیل‌شده", 3: "لغوشده" } as Record<number, string>)[value] ?? "نامشخص"; }
  commitmentStatusLabel(value: number): string { return ({ 1: "در انتظار", 2: "وصول/پرداخت‌شده", 3: "برگشتی/پرداخت‌نشده", 4: "لغوشده" } as Record<number, string>)[value] ?? "نامشخص"; }
  debtStatusLabel(value: number): string { return ({ 1: "پرداخت‌نشده", 2: "پرداخت‌شده", 3: "لغوشده" } as Record<number, string>)[value] ?? "نامشخص"; }
  financialSourceLabel(value: number): string { return value === 1 ? "چک" : value === 2 ? "سفته" : "نامشخص"; }

  openCreate(): void { this.createOpen = true; this.selectedPatient = null; this.eligibleSearch = ""; this.eligiblePage = 1; this.loadEligible(); }
  closeCreate(): void { if (!this.creating) this.createOpen = false; }
  loadEligible(): void {
    this.eligibleLoading = true;
    this.api.getEligiblePatients({ search: this.eligibleSearch, page: this.eligiblePage, pageSize: 8 })
      .pipe(finalize(() => { this.eligibleLoading = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (result) => { this.eligible = result.items; this.eligibleTotal = result.totalCount; },
        error: (error) => this.toast.error(this.errorMessage(error, "دریافت بیماران واجد شرایط انجام نشد.")) });
  }
  searchEligible(value: string): void { this.eligibleSearch = value; this.eligiblePage = 1; this.selectedPatient = null; this.loadEligible(); }
  selectPatient(patient: EligiblePatient): void { this.selectedPatient = patient; }
  create(): void {
    if (!this.selectedPatient || this.creating) return;
    this.creating = true;
    this.api.createPatientFile(this.selectedPatient.id).pipe(finalize(() => { this.creating = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (result) => { this.toast.success(`پرونده بیمار با موفقیت ایجاد شد. شماره پرونده: ${result.fileNumber}`); this.createOpen = false; this.loadFiles(); },
        error: (error) => this.toast.error(this.errorMessage(error, "ایجاد پرونده انجام نشد.")) });
  }

  openEdit(file: PatientFile): void {
    this.editing = file; this.editForm = { firstName: file.firstName, lastName: file.lastName, phoneNumber: file.phoneNumber }; this.editOpen = true;
  }
  closeEdit(): void { if (!this.updating) this.editOpen = false; }
  update(): void {
    if (!this.editing || this.updating || !this.editForm.firstName.trim() || !this.editForm.lastName.trim() || !this.editForm.phoneNumber.trim()) return;
    this.updating = true;
    const body = { firstName: this.editForm.firstName.trim(), lastName: this.editForm.lastName.trim(), phoneNumber: this.editForm.phoneNumber.trim() };
    this.api.updatePatientFile(this.editing.id, body).pipe(finalize(() => { this.updating = false; this.cdr.markForCheck(); }))
      .subscribe({ next: () => { this.toast.success("اطلاعات پرونده با موفقیت ویرایش شد."); this.editOpen = false; this.loadFiles(); },
        error: (error) => this.toast.error(this.errorMessage(error, "ویرایش پرونده انجام نشد.")) });
  }
  remove(): void {
    if (!this.deleting || this.deleteLoading) return;
    this.deleteLoading = true;
    this.api.deletePatientFile(this.deleting.id).pipe(finalize(() => { this.deleteLoading = false; this.cdr.markForCheck(); }))
      .subscribe({ next: () => { this.toast.success("پرونده با موفقیت حذف شد."); this.deleting = null; this.loadFiles(); },
        error: (error) => this.toast.error(this.errorMessage(error, "حذف پرونده انجام نشد.")) });
  }

  chooseFile(event: Event): void {
    this.importErrors = []; const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.importFile = file?.name.toLowerCase().endsWith(".xlsx") ? file : null;
    if (file && !this.importFile) this.importErrors = ["فقط فایل با فرمت .xlsx قابل بارگذاری است."];
  }
  importLegacy(): void {
    if (!this.importFile || this.importing) return;
    this.importing = true; this.importErrors = [];
    this.api.importLegacyPatientFiles(this.importFile).pipe(finalize(() => { this.importing = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (result) => { this.toast.success(`${result.importedCount} پرونده قدیمی با موفقیت وارد شد.`); this.importOpen = false; this.loadFiles(); },
        error: (error) => this.importErrors = this.errorDetails(error) });
  }

  sourceLabel(source: PatientFile["sourceType"]): string { return source === "Legacy" ? "قدیمی" : "جدید"; }
  private errorMessage(error: unknown, fallback: string): string { return this.errorDetails(error)[0] ?? fallback; }
  private errorDetails(error: unknown): string[] {
    const payload = error instanceof HttpErrorResponse ? error.error : error;
    if (typeof payload === "string") return [payload];
    const body = payload as { message?: string; detail?: string; errors?: unknown[]; rowErrors?: unknown[] } | null;
    const rows = body?.rowErrors ?? body?.errors;
    if (Array.isArray(rows) && rows.length) return rows.map((item) => {
      if (typeof item === "string") return item;
      const row = item as { row?: number; rowNumber?: number; message?: string; error?: string };
      const number = row.row ?? row.rowNumber;
      return `${number ? `ردیف ${number}: ` : ""}${row.message ?? row.error ?? "خطای نامشخص"}`;
    });
    return [body?.message ?? body?.detail ?? "خطایی در ارتباط با سرور رخ داد."];
  }
}
