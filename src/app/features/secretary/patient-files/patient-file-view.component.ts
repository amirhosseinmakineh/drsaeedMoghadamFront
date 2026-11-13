import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, Input, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { PatientFinanceDetailsComponent } from "../../../shared/patient-finance/patient-finance-details.component";
import { formatIranDate, fromIranDateInputValue } from "../../../utils/iran-datetime.util";
import { PatientFile } from "./patient-file.models";
import { PatientPaperMedicalHistory, PatientPaperRecord } from "./patient-paper-intake.models";
import { PatientFilesService } from "./patient-files.service";
import { SecretaryDentalChartComponent } from "./dental-chart/dental-chart.component";

@Component({
  selector: "app-patient-file-view",
  standalone: true,
  imports: [CommonModule, PatientFinanceDetailsComponent, SecretaryDentalChartComponent],
  templateUrl: "./patient-file-view.component.html",
  styleUrl: "./patient-file-view.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientFileViewComponent implements OnInit {
  @Input({ required: true }) file!: PatientFile;
  @Input() medicalConditions: { key: keyof PatientPaperMedicalHistory; label: string }[] = [];
  private readonly destroyRef = inject(DestroyRef);
  activePage: "first" | "second" | "finance" = "first";
  currentFile!: PatientFile;
  record: PatientPaperRecord | null = null;
  paperLoading = false;
  financeLoading = false;
  paperError = "";
  financeError = "";

  constructor(private readonly api: PatientFilesService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.currentFile = this.file; this.loadPaper(); this.loadFile(); }

  loadPaper(): void {
    if (this.paperLoading) return;
    this.paperLoading = true; this.paperError = ""; this.record = null;
    this.api.getPaperRecord(this.file.id).pipe(takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.paperLoading = false; this.cdr.markForCheck(); }),
    ).subscribe({ next: record => this.record = { ...record, intake: { ...record.intake,
        medicalHistory: record.intake?.medicalHistory ?? {} }, treatments: record.treatments ?? [], dentalChart: record.dentalChart ?? {} },
      error: error => this.paperError = error?.error?.message || "دریافت فرم پرونده انجام نشد." });
  }

  loadFile(): void {
    if (this.financeLoading) return;
    this.financeLoading = true; this.financeError = "";
    this.api.getPatientFileById(this.file.id).pipe(takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.financeLoading = false; this.cdr.markForCheck(); }),
    ).subscribe({ next: file => this.currentFile = file,
      error: error => this.financeError = error?.error?.message || "دریافت آخرین اطلاعات بیمار و صورت‌حساب انجام نشد." });
  }

  date(value: string | null | undefined, dateOnly = false): string {
    if (!value) return "ثبت نشده";
    const date = dateOnly ? fromIranDateInputValue(value) : new Date(value);
    return Number.isNaN(date.getTime()) ? "ثبت نشده" : formatIranDate(date);
  }
  get signatureImage(): string | null {
    const signature = this.record?.intake.patientSignature;
    return signature && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=\r\n]+$/.test(signature) ? signature : null;
  }
}
