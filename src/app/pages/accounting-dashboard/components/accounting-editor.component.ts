import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseModalComponent, BaseNumberInputComponent } from '../../../basemadual';
import { PersianDatePickerComponent } from '../../../basemadual/forms/persian-date-picker/persian-date-picker.component';
import { AccountingApiService, accountingError } from '../accounting-api.service';
import { AccountingRow } from '../accounting.models';

interface Field { key: string; label: string; kind: 'text' | 'money' | 'date' | 'select' | 'textarea' | 'check'; required?: boolean; min?: number; maxLength?: number; options?: { value: number; label: string }[]; }
const money = (key: string, label: string, min = 0.01): Field => ({ key, label, kind: 'money', required: true, min });
const text = (key: string, label: string, maxLength = 200): Field => ({ key, label, kind: 'text', required: true, maxLength });
@Component({
  selector: 'app-accounting-editor', standalone: true, imports: [CommonModule, FormsModule, BaseModalComponent, BaseNumberInputComponent, PersianDatePickerComponent],
  templateUrl: './accounting-editor.component.html', styleUrl: '../accounting-shared.scss', changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountingEditorComponent implements OnInit {
  @Input({ required: true }) operation = '';
  @Input({ required: true }) title = '';
  @Input() row: AccountingRow | null = null;
  @Input() initialData: Record<string, string | number | boolean | null> = {};
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  private readonly destroyRef = inject(DestroyRef);
  model: Record<string, string | number | boolean | Date | null> = {};
  fields: Field[] = [];
  errors: Record<string, string> = {};
  loading = false;
  saving = false;
  error = '';
  constructor(private readonly api: AccountingApiService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.model = { ...this.initialData };
    if (this.operation === 'UpdatePatient' && this.row?.caseId) {
      this.fields = [money('totalAmount', 'هزینه کل درمان'), money('prePaymentAmount', 'پیش‌پرداخت', 0), money('depositAmount', 'بیعانه', 0),
        { key: 'agreementType', label: 'نوع توافق', kind: 'select', required: true, options: [{ value: 1, label: 'پیش‌پرداخت' }, { value: 2, label: 'بیعانه' }] },
        { key: 'paymentMethod', label: 'روش پرداخت', kind: 'text', maxLength: 100 }, { key: 'installmentStatus', label: 'وضعیت اقساط', kind: 'text', maxLength: 200 },
        { key: 'notes', label: 'توضیحات پرداخت', kind: 'textarea', maxLength: 4000 }];
      this.loading = true;
      this.api.case(this.row.caseId).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({
        next: detail => { for (const field of this.fields) this.model[field.key] = (detail.case as unknown as Record<string, string | number | null>)[field.key] ?? null; },
        error: e => this.error = accountingError(e)
      });
    } else if (this.operation === 'UpdateCheque' || this.operation === 'UpdateNote' || this.operation === 'AddGuaranteeCheque' || this.operation === 'AddGuaranteeNote') {
      const cheque = this.operation.endsWith('Cheque');
      const adding = this.operation.startsWith('Add');
      this.fields = [text(cheque ? 'sayadNumber' : 'serialNumber', 'شماره سند', cheque ? 32 : 64), money('amount', 'مبلغ سند'),
        { key: 'dueDate', label: 'تاریخ سررسید', kind: 'date', required: true }];
      this.model = { amount: adding ? null : this.row?.amount ?? null, dueDate: !adding && this.row?.date ? new Date(this.row.date) : null,
        [cheque ? 'sayadNumber' : 'serialNumber']: adding ? '' : this.row?.number ?? '' };
      if (cheque) { this.fields.push(text('ownerName', 'نام صاحب چک')); if (!adding) this.fields.push({ key: 'isGuarantee', label: 'چک ضمانت است', kind: 'check' }); this.model['ownerName'] = adding ? '' : this.row?.owner ?? ''; this.model['isGuarantee'] = adding || (this.row?.isGuarantee ?? false); }
    } else if (this.operation.endsWith('Transaction') && !this.operation.startsWith('Delete')) {
      this.fields = [
        { key: 'type', label: 'نوع تراکنش', kind: 'select', required: true, options: [{ value: 1, label: 'درآمد' }, { value: 2, label: 'هزینه' }] },
        money('amount', 'مبلغ تراکنش'), { key: 'transactionDate', label: 'تاریخ تراکنش', kind: 'date', required: true },
        text('subject', 'موضوع'), { key: 'counterpartyName', label: 'طرف حساب', kind: 'text', maxLength: 200 },
        { key: 'paymentMethod', label: 'روش پرداخت', kind: 'select', required: true, options: ['نقدی', 'کارتخوان', 'کارت به کارت', 'واریز بانکی', 'سایر'].map((label, i) => ({ value: i + 1, label })) },
        { key: 'expenseCategoryId', label: 'دسته‌بندی هزینه', kind: 'select', options: [] },
        { key: 'description', label: 'توضیحات', kind: 'textarea', maxLength: 1000 }
      ];
      this.model = { type: 1, amount: null, transactionDate: new Date(), paymentMethod: 1, expenseCategoryId: null };
      this.api.page('Categories', { page: 1, pageSize: 100, status: 'Active' }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: page => { this.fields.find(f => f.key === 'expenseCategoryId')!.options = page.items.map(x => ({ value: Number(x.id), label: x.description })); this.cdr.markForCheck(); },
        error: e => { this.error = accountingError(e); this.cdr.markForCheck(); }
      });
      if (this.row) {
        this.loading = true;
        this.api.transaction(this.row.id).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({
          next: data => { for (const field of this.fields) this.model[field.key] = (data[field.key] as string | number | null) ?? null; this.model['transactionDate'] = new Date(String(data['transactionDate'])); },
          error: e => this.error = accountingError(e)
        });
      }
    } else if (this.operation === 'CreateCategory' || this.operation === 'UpdateCategory') {
      this.fields = [text('title', 'عنوان دسته‌بندی', 150), { key: 'isActive', label: 'فعال', kind: 'check' }];
      this.model = { title: this.row?.description ?? '', isActive: this.row ? this.row.status === 'Active' : true };
    } else if (this.operation.startsWith('Review') && !this.initialData['approved']) {
      this.fields = [{ key: 'reason', label: 'دلیل رد', kind: 'textarea', required: true, maxLength: this.operation === 'ReviewReferral' ? 500 : 1000 }];
    }
  }
  numberValue(key: string): number | null { return typeof this.model[key] === 'number' ? this.model[key] as number : null; }
  dateValue(key: string): Date | null { return this.model[key] instanceof Date ? this.model[key] as Date : null; }
  submit(): void {
    if (this.loading || this.saving) return;
    this.errors = {}; this.error = '';
    const payload: Record<string, unknown> = { ...this.model };
    for (const field of this.fields) {
      const value = this.model[field.key];
      if (field.kind === 'money' && (!Number.isFinite(value) || Number(value) < (field.min ?? 0))) this.errors[field.key] = 'مبلغ معتبر وارد کنید.';
      else if (field.kind === 'date') {
        if (!(value instanceof Date) || !Number.isFinite(value.getTime())) this.errors[field.key] = 'تاریخ را انتخاب کنید.';
        else payload[field.key] = value.toISOString();
      } else if (field.required && (value == null || String(value).trim() === '')) this.errors[field.key] = 'این فیلد الزامی است.';
      if (typeof value === 'string') { payload[field.key] = value.trim(); if (field.maxLength && value.trim().length > field.maxLength) this.errors[field.key] = `حداکثر ${field.maxLength} نویسه مجاز است.`; }
    }
    if (this.operation.endsWith('Transaction')) {
      if (payload['type'] === 1) payload['expenseCategoryId'] = null;
      if (payload['type'] === 2 && !payload['expenseCategoryId']) this.errors['expenseCategoryId'] = 'دسته‌بندی هزینه را انتخاب کنید.';
    }
    if (Object.keys(this.errors).length) return;
    this.saving = true;
    this.api.operate(this.operation, this.row?.id ?? null, payload).pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => { if (!result.isSuccess) this.error = result.message; else this.saved.emit(); }, error: e => this.error = accountingError(e)
    });
  }
}
