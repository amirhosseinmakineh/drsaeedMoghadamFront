import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { SecretaryAccountShellComponent } from "../../components/secretary-account-shell/secretary-account-shell.component";
import { PatientFilesService } from "../../../patient-files/patient-files.service";
import { PatientFile } from "../../../patient-files/patient-file.models";
import { PatientFinanceDetailsComponent } from "../../../../../shared/patient-finance/patient-finance-details.component";

@Component({
  selector: "app-patient-financial-report",
  standalone: true,
  imports: [CommonModule, FormsModule, SecretaryAccountShellComponent, PatientFinanceDetailsComponent],
  templateUrl: "./patient-financial-report.component.html",
  styleUrl: "./patient-financial-report.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientFinancialReportComponent {
  private readonly destroyRef = inject(DestroyRef);
  readonly Math = Math;
  search = "";
  files: PatientFile[] = [];
  selected: PatientFile | null = null;
  loading = false;
  detailLoading = false;
  error = "";
  detailError = "";
  page = 1;
  pageSize = 20;
  totalCount = 0;
  constructor(private readonly api: PatientFilesService, private readonly cdr: ChangeDetectorRef) { this.load(); }

  load(): void {
    if (this.loading) return;
    this.loading = true; this.error = "";
    this.api.getPatientFiles({ search: this.search.trim(), fileNumber: "", sourceType: "", page: this.page, pageSize: this.pageSize })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: result => { this.files = result.items; this.totalCount = result.totalCount; },
        error: e => { this.error = e?.error?.message || "دریافت گزارش مالی بیماران ناموفق بود."; this.files = []; },
      });
  }
  searchNow(): void { this.page = 1; this.load(); }
  changePage(delta: number): void { this.page += delta; this.load(); }
  open(file: PatientFile): void {
    this.selected = file; this.detailError = ""; this.detailLoading = true;
    this.api.getPatientFileById(file.id)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.detailLoading = false; this.cdr.markForCheck(); }))
      .subscribe({ next: detail => { if (this.selected?.id === detail.id) this.selected = detail; },
        error: e => this.detailError = e?.error?.message || "دریافت جزئیات مالی ناموفق بود." });
  }
  close(): void { this.selected = null; }
  money(amount: number | null | undefined): string { return Number(amount || 0).toLocaleString("fa-IR") + " تومان"; }
  stage(file: PatientFile): string {
    if (file.serviceApproved) return "مجاز به درمان";
    if (!file.treatmentConfirmedAtUtc) return "طرح درمان";
    if (!file.financeCompleted) return "ثبت مالی";
    if (!file.financeConfirmedAtUtc) return "تأیید مالی";
    if (!file.profileConfirmedAtUtc) return "تأیید پروفایل";
    return "مجوز درمان";
  }
}
