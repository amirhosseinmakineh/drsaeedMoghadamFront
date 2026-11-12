import { PersianDatePickerComponent } from "../../../basemadual/forms/persian-date-picker/persian-date-picker.component";
import { PatientPaperRecord, PatientPaperMedicalHistory } from "./patient-paper-intake.models";
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
import { SecretaryDentalChartComponent } from "./dental-chart/dental-chart.component";
import { SecretaryAccountShellComponent } from "../account/components/secretary-account-shell/secretary-account-shell.component";
import { PatientFinanceDetailsComponent } from "../../../shared/patient-finance/patient-finance-details.component";

@Component({
  selector: "app-patient-files-page",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseBadgeComponent, BaseButtonComponent, BaseCardComponent,
    BaseConfirmDialogComponent, BaseContentContainerComponent, BaseEmptyStateComponent,
    BaseFilterBarComponent, BaseLoadingComponent, BaseModalComponent, BasePageHeaderComponent,
    BasePageShellComponent, BaseSearchFilterComponent, BaseSelectFilterComponent,
    BaseTablePaginationComponent, SecretaryAccountShellComponent, PatientFinanceDetailsComponent,
    SecretaryDentalChartComponent, PersianDatePickerComponent],
  templateUrl: "./patient-files-page.component.html",
  styleUrl: "./patient-files-page.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientFilesPageComponent implements OnInit {
  files: PatientFile[] = [];
  paperFile: PatientFile | null = null;
  paperLoading = false;
  paperSaving = false;
  paperRecord: PatientPaperRecord = this.emptyPaperRecord();
  paperBirthDate: Date | null = null;
  paperStep = 1;
  pendingPaperFileId: number | null = null;
  readonly medicalConditions: { key: keyof PatientPaperMedicalHistory; label: string }[] = [
    { key: "heartDisease", label: "ناراحتی قلبی" },
    { key: "bloodPressure", label: "فشار خون" },
    { key: "bleeding", label: "خونریزی" },
    { key: "diabetes", label: "دیابت" },
    { key: "thyroid", label: "تیروئید" },
    { key: "liverDisease", label: "بیماری کبدی" },
    { key: "respiratoryDisease", label: "بیماری تنفسی" },
    { key: "kidneyDisease", label: "بیماری کلیوی" },
    { key: "hepatitis", label: "هپاتیت" },
    { key: "malignancy", label: "بدخیمی" },
    { key: "infectiousDisease", label: "بیماری عفونی" },
    { key: "digestiveDisease", label: "بیماری گوارشی" },
    { key: "allergy", label: "حساسیت" },
    { key: "rheumatism", label: "روماتیسم" },
    { key: "epilepsy", label: "صرع" },
  ];
  totalCount = 0;
  query: PatientFileQuery = { search: "", fileNumber: "", sourceType: "", page: 1, pageSize: 10 };
  loading = false;
  loadError = "";
  createOpen = false;
  createIntakeOpen = false;
  eligible: EligiblePatient[] = [];
  eligibleSearch = "";
  eligiblePage = 1;
  eligibleTotal = 0;
  eligibleLoading = false;
  selectedPatient: EligiblePatient | null = null;
  newPatientOpen = false;
  createForm = { firstName: "", lastName: "", phoneNumber: "", description: "" };
  creating = false;
  editOpen = false;
  editing: PatientFile | null = null;
  editForm = { firstName: "", lastName: "", phoneNumber: "", description: "" };
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

  private emptyPaperRecord(): PatientPaperRecord {
    return { intake: { medicalHistory: {} }, treatments: [], dentalChart: {} };
  }

  openPaperRecord(file: PatientFile): void {
    this.paperFile = file;
    this.paperRecord = this.emptyPaperRecord();
    this.paperBirthDate = null;
    this.paperStep = 1;
    this.paperLoading = true;
    this.api.getPaperRecord(file.id).pipe(finalize(() => {
      this.paperLoading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: record => {
        this.paperBirthDate = this.parseDateOnly(record.intake?.birthDate);
        this.paperRecord = {
        ...record,
        intake: { ...record.intake, medicalHistory: record.intake?.medicalHistory ?? {} },
        treatments: record.treatments ?? [],
        dentalChart: record.dentalChart ?? {},
      };
      },
      error: error => this.toast.error(this.errorMessage(error, "دریافت فرم پرونده انجام نشد.")),
    });
  }

  onPaperBirthDateChange(value: Date | null): void {
    this.paperBirthDate = value;
    this.paperRecord.intake.birthDate = value
      ? `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`
      : null;
  }

  private parseDateOnly(value: string | null | undefined): Date | null {
    if (!value || !/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) {
      return null;
    }

    const parsed = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  parseTreatmentDate(value: string): Date | null {
    return this.parseDateOnly(value);
  }

  onTreatmentDateChange(
    treatment: PatientPaperRecord["treatments"][number],
    value: Date | null,
  ): void {
    if (!value) {
      return;
    }

    treatment.treatmentDate =
      `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
  }

  setMedicalCondition(key: keyof PatientPaperMedicalHistory, value: string): void {
    (this.paperRecord.intake.medicalHistory as Record<string, string | boolean | null | undefined>)[key] =
      value === "yes" ? true : value === "no" ? false : null;
  }

  closePaperRecord(): void {
    if (!this.paperSaving) {
      this.paperFile = null;
      this.pendingPaperFileId = null;
    }
  }

  onDentalChartChange(value: Record<string, unknown>): void {
    this.paperRecord = {
      ...this.paperRecord,
      dentalChart: value,
    };
  }

  startPaperCreation(): void {
    this.paperRecord = this.emptyPaperRecord();
    this.paperBirthDate = null;
    this.paperStep = 1;
    this.pendingPaperFileId = null;
  }

  nextPaperStep(): void {
    this.paperStep = 2;
  }

  previousPaperStep(): void {
    this.paperStep = 1;
  }

  addPaperTreatment(): void {
    this.paperRecord.treatments.push({
      treatmentDate: new Date().toISOString().slice(0, 10),
      description: "", hasFollowUp: false, cost: 0, paidAmount: 0, dentistName: "",
    });
  }

  savePaperRecord(): void {
    if (!this.paperFile || this.paperSaving || this.paperLoading) return;
    if (this.paperRecord.treatments.some(t =>
      !t.dentistName.trim() || t.cost < 0 || t.paidAmount < 0 || t.paidAmount > t.cost)) {
      this.toast.error("اطلاعات هزینه، پرداختی یا نام دندانپزشک معتبر نیست.");
      return;
    }
    this.paperSaving = true;
    this.api.savePaperRecord(this.paperFile.id, this.paperRecord).pipe(finalize(() => {
      this.paperSaving = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: () => { this.toast.success("اطلاعات تکمیلی پرونده ذخیره شد."); this.paperFile = null; },
      error: error => this.toast.error(this.errorMessage(error, "ذخیره فرم پرونده انجام نشد.")),
    });
  }

  openFinance(file: PatientFile): void { this.financeFile = file; this.financeError = ""; this.refreshFinance(); }
  refreshFinance(): void {
    if (!this.financeFile || this.financeRefreshing) return;
    const id = this.financeFile.id; this.financeRefreshing = true; this.financeError = "";
    this.api.getPatientFileById(id).pipe(finalize(() => { this.financeRefreshing = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (file) => { if (this.financeFile?.id === id) this.financeFile = file; },
        error: (error) => this.financeError = this.errorMessage(error, "دریافت اطلاعات مالی انجام نشد.") });
  }
  closeFinance(): void { this.financeFile = null; this.financeError = ""; this.financeRefreshing = false; }
  openCreate(): void {
    this.createIntakeOpen = false;
    this.createOpen = true;
    this.selectedPatient = null;
    this.eligibleSearch = "";
    this.eligiblePage = 1;
    this.loadEligible();
  }
  closeCreate(): void { if (!this.creating) { this.createOpen = false; this.selectedPatient = null; } }
  closeCreateIntake(): void {
    if (!this.creating) { this.createIntakeOpen = false; this.selectedPatient = null; }
  }
  backToEligible(): void {
    if (this.creating) return;
    this.createIntakeOpen = false;
    this.selectedPatient = null;
    this.createOpen = true;
  }
  loadEligible(): void {
    this.eligibleLoading = true;
    this.api.getEligiblePatients({ search: this.eligibleSearch, page: this.eligiblePage, pageSize: 8 })
      .pipe(finalize(() => { this.eligibleLoading = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (result) => { this.eligible = result.items; this.eligibleTotal = result.totalCount; },
        error: (error) => this.toast.error(this.errorMessage(error, "دریافت بیماران دارای رزرو انجام نشد.")) });
  }
  searchEligible(value: string): void { this.eligibleSearch = value; this.eligiblePage = 1; this.selectedPatient = null; this.loadEligible(); }
  selectPatient(patient: EligiblePatient): void {
    this.selectedPatient = patient;
    this.createOpen = false;
    this.createIntakeOpen = true;
    this.startPaperCreation();
  }
  create(): void {
    if (this.creating || !this.createIntakeOpen || !this.selectedPatient) {
      return;
    }

    if (this.paperStep === 1) {
      this.nextPaperStep();
      return;
    }

    this.creating = true;
    if (this.pendingPaperFileId !== null) {
      this.persistCreatedPaper(this.pendingPaperFileId);
      return;
    }

    this.api.createFromReservation(this.selectedPatient.id).subscribe({
      next: file => {
        this.pendingPaperFileId = file.id;
        this.persistCreatedPaper(file.id);
      },
      error: error => {
        this.creating = false;
        this.toast.error(this.errorMessage(error, "ثبت پرونده انجام نشد."));
        this.cdr.markForCheck();
      },
    });
  }

  private persistCreatedPaper(fileId: number): void {
    this.api.savePaperRecord(fileId, this.paperRecord).pipe(
      finalize(() => {
        this.creating = false;
        this.cdr.markForCheck();
      }),
    ).subscribe({
      next: () => {
        this.toast.success("پرونده و اطلاعات درمان با موفقیت ذخیره شدند.");
        this.pendingPaperFileId = null;
        this.createIntakeOpen = false;
        this.newPatientOpen = false;
        this.createOpen = false;
        this.selectedPatient = null;
        this.loadFiles();
      },
      error: error => {
        this.toast.error(
          this.errorMessage(error, "پرونده ایجاد شد، اما ذخیره فرم کامل ناموفق بود. دوباره ثبت را بزنید؛ پرونده تکراری ایجاد نمی‌شود."),
        );
      },
    });
  }

  openNewPatient(): void {
    this.createForm = { firstName: "", lastName: "", phoneNumber: "", description: "" };
    this.newPatientOpen = true;
    this.startPaperCreation();
  }
  closeNewPatient(): void { if (!this.creating) this.newPatientOpen = false; }
  createNewPatient(): void {
    if (this.creating || !this.isCreateValid()) {
      return;
    }

    if (this.paperStep === 1) {
      this.nextPaperStep();
      return;
    }

    this.creating = true;
    if (this.pendingPaperFileId !== null) {
      this.persistCreatedPaper(this.pendingPaperFileId);
      return;
    }

    const request = {
      firstName: this.createForm.firstName.trim(),
      lastName: this.createForm.lastName.trim(),
      phoneNumber: this.createForm.phoneNumber.trim(),
      description: this.createForm.description.trim() || undefined,
    };

    this.api.createPatientFile(request).subscribe({
      next: file => {
        this.pendingPaperFileId = file.id;
        this.persistCreatedPaper(file.id);
      },
      error: error => {
        this.creating = false;
        this.toast.error(this.errorMessage(error, "ثبت بیمار انجام نشد."));
        this.cdr.markForCheck();
      },
    });
  }

  isCreateValid(): boolean {
    return !!this.createForm.firstName.trim() &&
      !!this.createForm.lastName.trim() &&
      /^09\d{9}$/.test(this.createForm.phoneNumber.trim());
  }

  openEdit(file: PatientFile): void {
    this.editing = file;
    this.editForm = {
      firstName: file.firstName,
      lastName: file.lastName,
      phoneNumber: file.phoneNumber,
      description: file.description ?? "",
    };
    this.paperRecord = this.emptyPaperRecord();
    this.paperLoading = true;
    this.editOpen = true;

    this.api.getPaperRecord(file.id).pipe(
      finalize(() => {
        this.paperLoading = false;
        this.cdr.markForCheck();
      }),
    ).subscribe({
      next: record => {
        this.paperRecord = {
          ...record,
          intake: {
            ...record.intake,
            medicalHistory: record.intake?.medicalHistory ?? {},
          },
          dentalChart: record.dentalChart ?? {},
          treatments: record.treatments ?? [],
        };
        this.paperBirthDate = this.parseDateOnly(record.intake.birthDate);
      },
      error: error => {
        this.toast.error(this.errorMessage(error, "دریافت اطلاعات پرونده ناموفق بود."));
        this.editOpen = false;
      },
    });
  }

  closeEdit(): void {
    if (!this.updating) {
      this.editOpen = false;
      this.editing = null;
    }
  }

  update(): void {
    if (!this.editing || this.updating || this.paperLoading) {
      return;
    }

    if (!this.editForm.firstName.trim() || !this.editForm.lastName.trim() ||
        !/^09\\d{9}$/.test(this.editForm.phoneNumber.trim())) {
      this.toast.error("اطلاعات هویتی بیمار معتبر نیست.");
      return;
    }

    this.updating = true;
    const body = {
      firstName: this.editForm.firstName.trim(),
      lastName: this.editForm.lastName.trim(),
      phoneNumber: this.editForm.phoneNumber.trim(),
      description: this.editForm.description.trim() || null,
    };

    this.api.updatePatientFile(this.editing.id, body).subscribe({
      next: () => {
        this.api.savePaperRecord(this.editing!.id, this.paperRecord).pipe(
          finalize(() => {
            this.updating = false;
            this.cdr.markForCheck();
          }),
        ).subscribe({
          next: () => {
            this.toast.success("تمام اطلاعات پرونده ذخیره شد.");
            this.editOpen = false;
            this.editing = null;
            this.loadFiles();
          },
          error: error => {
            this.toast.error(this.errorMessage(error, "اطلاعات هویتی ذخیره شد، ولی ثبت صفحه دوم ناموفق بود؛ دوباره تلاش کنید."));
          },
        });
      },
      error: error => {
        this.updating = false;
        this.toast.error(this.errorMessage(error, "ویرایش پرونده انجام نشد."));
        this.cdr.markForCheck();
      },
    });
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
