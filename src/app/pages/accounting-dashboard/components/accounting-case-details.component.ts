import { downloadBlob } from '../../../utils/file-download.util';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { BaseModalComponent } from '../../../basemadual';
import { AccountingApiService, accountingError } from '../accounting-api.service';
import { PatientFinancialCaseDetails } from '../../../features/secretary/patient-finance/models/patient-finance.models';
import { AccountingPage } from '../accounting.models';
import { formatIranDate } from '../../../utils/iran-datetime.util';

@Component({ selector: 'app-accounting-case-details', standalone: true, imports: [CommonModule, BaseModalComponent],
  templateUrl: './accounting-case-details.component.html', styleUrl: '../accounting-shared.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class AccountingCaseDetailsComponent implements OnInit {
  @Input({ required: true }) caseId = '';
  @Output() close = new EventEmitter<void>();
  details: PatientFinancialCaseDetails | null = null;
  installments: AccountingPage | null = null;
  documents: {id: string; description: string}[] = [];
  loading = false;
  error = '';
  readonly date = formatIranDate;
  private readonly destroyRef = inject(DestroyRef);
  constructor(private readonly api: AccountingApiService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true; this.error = '';
    this.api.case(this.caseId).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: details => this.details = details, error: e => this.error = accountingError(e)
    });
    this.api.documents(this.caseId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: documents => { this.documents = documents; this.cdr.markForCheck(); }, error: e => { this.error = accountingError(e); this.cdr.markForCheck(); } });
    this.loadInstallments();
  }
  private loadInstallments(page = 1): void {
    this.api.page('Installments', { page, pageSize: 100, caseId: this.caseId }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rows => {
        this.installments = page === 1 ? rows : { ...rows, items: [...(this.installments?.items ?? []), ...rows.items] };
        if (rows.items.length && this.installments.items.length < rows.totalCount) this.loadInstallments(page + 1);
        this.cdr.markForCheck();
      }, error: e => { this.error = accountingError(e); this.cdr.markForCheck(); }
    });
  }
  downloadDocument(id: string): void {
    this.api.image(this.caseId, id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: blob => downloadBlob(blob, `document-${id}.${blob.type === 'image/png' ? 'png' : 'jpg'}`), error: e => { this.error = accountingError(e); this.cdr.markForCheck(); } });
  }
  money(value: number | null | undefined): string { return `${(value ?? 0).toLocaleString('fa-IR')} تومان`; }
}
