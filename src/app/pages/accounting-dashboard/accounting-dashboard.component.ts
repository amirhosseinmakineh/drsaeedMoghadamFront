import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { BaseModalComponent } from '../../basemadual';
import { PersianDatePickerComponent } from '../../basemadual/forms/persian-date-picker/persian-date-picker.component';
import { formatIranDate, toIranDateInputValue } from '../../utils/iran-datetime.util';
import { downloadBlob } from '../../utils/file-download.util';
import { readRewardLines } from '../../core/consultant/service-reward.models';
import { AccountingApiService, accountingError } from './accounting-api.service';
import { ACCOUNTING_TABS, AccountingAccess, AccountingFilter, AccountingMetric, AccountingPage, AccountingRow, AccountingSection, METRIC_LABELS } from './accounting.models';
import { AccountingEditorComponent } from './components/accounting-editor.component';
import { AccountingPermissionsComponent } from './components/accounting-permissions.component';
import { AccountingCaseDetailsComponent } from './components/accounting-case-details.component';

interface AccountingAction { operation: string; label: string; permission: string; data?: Record<string, string | number | boolean | null>; }
@Component({ selector: 'app-accounting-dashboard', standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PersianDatePickerComponent, BaseModalComponent, AccountingEditorComponent, AccountingPermissionsComponent, AccountingCaseDetailsComponent],
  templateUrl: './accounting-dashboard.component.html', styleUrl: './accounting-shared.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class AccountingDashboardComponent implements OnInit {
  access: AccountingAccess | null = null;
  menuOpen = false;
  section: AccountingSection | 'overview' | 'permissions' = 'overview';
  readonly tabs = ACCOUNTING_TABS;
  readonly navigationGroups = [
    { label: 'بیماران و اسناد', tabs: ACCOUNTING_TABS.slice(0, 6) },
    { label: 'حسابداری کلینیک', tabs: ACCOUNTING_TABS.slice(6, 11) },
    { label: 'کیف پول و گردش مالی', tabs: ACCOUNTING_TABS.slice(11, 16) },
    { label: 'مدیریت و نظارت', tabs: ACCOUNTING_TABS.slice(16) }
  ];
  readonly metricLabels = METRIC_LABELS;
  metrics: AccountingMetric[] = [];
  page: AccountingPage | null = null;
  filter: AccountingFilter = { page: 1, pageSize: 20 };
  fromDate: Date | null = null;
  toDate: Date | null = null;
  loading = false;
  exporting = false;
  error = '';
  success = '';
  editor: { operation: string; title: string; row: AccountingRow | null; data: Record<string, string | number | boolean | null> } | null = null;
  detailsId: string | null = null;
  inspecting: AccountingRow | null = null;
  private request?: Subscription;
  private readonly destroyRef = inject(DestroyRef);
  readonly date = formatIranDate;
  readonly rewardLines = readRewardLines;
  auditChanges(json: string | null): {label: string; before: string; after: string}[] {
    try {
      const value = JSON.parse(json || '{}');
      const labels: Record<string, string> = { Id: 'شناسه', UserId: 'کاربر', Permission: 'مجوز', GrantedByUserId: 'اعطاکننده مجوز', Amount: 'مبلغ', Balance: 'موجودی', Status: 'وضعیت', IsDeleted: 'حذف‌شده', IsActive: 'فعال', Title: 'عنوان', Type: 'نوع', TotalAmount: 'هزینه درمان', PrePaymentAmount: 'پیش‌پرداخت', DepositAmount: 'بیعانه', PaymentMethod: 'روش پرداخت', AgreementType: 'نوع توافق', DueDate: 'سررسید', SayadNumber: 'شماره چک', SerialNumber: 'شماره سفته', IsGuarantee: 'ضمانتی', TransactionDate: 'تاریخ تراکنش', ExpenseCategoryId: 'دسته‌بندی هزینه', PatientFinancialCaseId: 'پرونده مالی', SourceType: 'نوع منبع', SourceId: 'شناسه منبع', PaidAtUtc: 'تاریخ پرداخت', PaidByUserId: 'ثبت‌کننده پرداخت', SalePrice: 'مبلغ فروش', SecretaryReward: 'پاداش منشی', ReviewedByAdminId: 'بررسی‌کننده', ReviewedAt: 'تاریخ بررسی', RewardAmount: 'مبلغ پاداش', RejectionReason: 'دلیل رد', ConsultantRewardApprovedByAdmin: 'تأیید پاداش مشاور', ConsultantRewardAmount: 'پاداش مشاور', ConsultantRewardReviewedByAdminId: 'بررسی‌کننده پاداش', ConsultantRewardReviewedAt: 'تاریخ بررسی پاداش' };
      const display = (v: unknown) => v == null ? '—' : typeof v === 'boolean' ? (v ? 'بله' : 'خیر') : typeof v === 'number' ? v.toLocaleString('fa-IR') : String(v);
      return Object.keys(value.After ?? value.Before ?? {}).map(key => ({ label: labels[key] || 'اطلاعات مالی', before: display(value.Before?.[key]), after: display(value.After?.[key]) }));
    } catch { return []; }
  }
  constructor(readonly auth: AuthService, private readonly api: AccountingApiService, private readonly cdr: ChangeDetectorRef, private readonly router: Router) {}
  get currentTab() { return this.tabs.find(x => x.id === this.section); }
  get title(): string { return this.currentTab?.label ?? (this.section === 'permissions' ? 'دسترسی حسابداران' : 'نمای کلی حسابداری'); }
  can(permission: string): boolean { return !!this.access && (this.access.isAdmin || this.access.permissions.includes(`Accounting.${permission}`)); }
  ngOnInit(): void { this.loadAccess(); }
  loadAccess(): void {
    this.error = ''; this.loading = true;
    this.api.access().pipe(finalize(() => this.cdr.markForCheck()), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: access => { this.access = access; this.load(); }, error: e => { this.error = accountingError(e); this.loading = false; }
    });
  }
  select(section: AccountingSection | 'overview' | 'permissions', filter: Partial<AccountingFilter> = {}): void {
    this.menuOpen = false;
    this.request?.unsubscribe(); this.section = section;
    this.filter = { page: 1, pageSize: 20, ...filter }; this.fromDate = this.toDate = null; this.success = ''; this.page = null; this.error = '';
    if (section !== 'permissions') this.load();
  }
  load(reset = false): void {
    if (!this.access) { this.loadAccess(); return; }
    if (this.section === 'permissions') return;
    this.filter.fromDate = this.fromDate ? toIranDateInputValue(this.fromDate) : undefined;
    this.filter.toDate = this.toDate ? toIranDateInputValue(this.toDate) : undefined;
    if (this.filter.fromDate && this.filter.toDate && this.filter.fromDate > this.filter.toDate) { this.error = 'تاریخ شروع باید قبل از تاریخ پایان باشد.'; return; }
    if (reset) this.filter.page = 1;
    this.request?.unsubscribe(); this.loading = true; this.error = '';
    const end = () => { this.loading = false; this.cdr.markForCheck(); };
    if (this.section === 'overview') this.request = this.api.overview(this.filter).pipe(finalize(end), takeUntilDestroyed(this.destroyRef)).subscribe({ next: r => this.metrics = r.metrics, error: e => this.error = accountingError(e) });
    else this.request = this.api.page(this.section, this.filter).pipe(finalize(end), takeUntilDestroyed(this.destroyRef)).subscribe({ next: r => this.page = r, error: e => this.error = accountingError(e) });
  }
  changePage(delta: number): void { if (this.loading) return; this.filter.page += delta; this.load(); }
  clear(): void { this.filter = { page: 1, pageSize: 20 }; this.fromDate = this.toDate = null; this.load(); }
  description(row: AccountingRow): string {
    if (this.section !== 'Audit') return row.description;
    const labels: Record<string, string> = { UpdatePatient: 'ویرایش مالی بیمار', CancelPatient: 'لغو مالی بیمار', UpdateCheque: 'ویرایش چک', UpdateNote: 'ویرایش سفته', DeleteCheque: 'حذف چک', DeleteNote: 'حذف سفته', ChequeStatus: 'تغییر وضعیت چک', NoteStatus: 'تغییر وضعیت سفته', PayDebt: 'پرداخت بدهی', PayInstallment: 'پرداخت قسط', CollectGuarantee: 'وصول ضمانت', CreateTransaction: 'ثبت درآمد یا هزینه', UpdateTransaction: 'ویرایش تراکنش', DeleteTransaction: 'حذف تراکنش', CreateCategory: 'ثبت دسته‌بندی هزینه', UpdateCategory: 'ویرایش دسته‌بندی هزینه', DeleteCategory: 'حذف دسته‌بندی هزینه', ReviewSecretary: 'بررسی پاداش منشی', ReviewConsultant: 'بررسی پاداش مشاور', ReviewReferral: 'بررسی پاداش معرفی', SetPermissions: 'تغییر دسترسی حسابدار', AddGuaranteeCheque: 'افزودن چک ضمانت', AddGuaranteeNote: 'افزودن سفته ضمانت' };
    return labels[row.description.split(' / ')[0]] || 'تغییر اطلاعات مالی';
  }
  rewardBasis(value: string): string { return ({ Unit: 'واحد', Block: 'بسته واحد', Jaw: 'فک' } as Record<string, string>)[value] || value; }
  rewardNote(json: string | null): string { try { return JSON.parse(json || '{}').AdminReviewNote || ''; } catch { return ''; } }
  status(row: AccountingRow): string { return this.currentTab?.statuses[row.status] ?? row.status; }
  money(amount: number): string { return `${amount.toLocaleString('fa-IR')} تومان`; }
  actions(row: AccountingRow): AccountingAction[] {
    const actions: AccountingAction[] = [];
    if (this.section === 'Patients' && row.status !== '3') actions.push({ operation: 'UpdatePatient', label: 'ویرایش مالی', permission: 'EditPatients' }, { operation: 'CancelPatient', label: 'لغو پرونده', permission: 'Cancel' });
    if (this.section === 'Patients' && row.status === '1') actions.push({ operation: 'AddGuaranteeCheque', label: 'افزودن چک ضمانت', permission: 'EditDocuments' }, { operation: 'AddGuaranteeNote', label: 'افزودن سفته ضمانت', permission: 'EditDocuments' });
    if ((this.section === 'Cheques' || this.section === 'Notes') && row.status !== '2') {
      const cheque = this.section === 'Cheques';
      actions.push({ operation: cheque ? 'UpdateCheque' : 'UpdateNote', label: 'ویرایش', permission: 'EditDocuments' }, { operation: cheque ? 'DeleteCheque' : 'DeleteNote', label: 'حذف / لغو', permission: 'Cancel' });
      if (row.status === '1' && !row.isGuarantee) actions.push({ operation: cheque ? 'ChequeStatus' : 'NoteStatus', label: 'وصول شد', permission: 'Collect', data: { status: 2 } }, { operation: cheque ? 'ChequeStatus' : 'NoteStatus', label: 'وصول نشد', permission: 'Collect', data: { status: 3 } });
      if (cheque && row.isGuarantee && row.status === '1') actions.push({ operation: 'CollectGuarantee', label: 'وصول ضمانت بابت بدهی', permission: 'Collect' });
    }
    if (this.section === 'Installments' && row.status === 'Pending') actions.push({ operation: 'PayInstallment', label: 'ثبت پرداخت', permission: 'Collect' });
    if (this.section === 'Debts' && row.status === '1') actions.push({ operation: 'PayDebt', label: 'ثبت پرداخت بدهی', permission: 'Collect' });
    if (this.section === 'Transactions') actions.push({ operation: 'UpdateTransaction', label: 'ویرایش', permission: 'ManageTransactions' }, { operation: 'DeleteTransaction', label: 'حذف', permission: 'Cancel' });
    if (this.section === 'Categories') actions.push({ operation: 'UpdateCategory', label: 'ویرایش', permission: 'ManageCategories' }, { operation: 'DeleteCategory', label: 'حذف', permission: 'ManageCategories' });
    const review = this.section === 'SecretarySales' && row.status === '1' ? 'Secretary' : this.section === 'ConsultantRewards' && row.status === 'Pending' ? 'Consultant' : this.section === 'Referrals' && row.status === '3' ? 'Referral' : null;
    if (review) for (const approved of [true, false]) actions.push({ operation: `Review${review}`, label: approved ? 'تأیید پاداش' : 'رد پاداش', permission: `Approve${review}`, data: { approved } });
    return actions.filter(x => this.can(x.permission));
  }
  open(action: AccountingAction, row: AccountingRow | null): void { this.editor = { operation: action.operation, title: action.label, row, data: action.data ?? {} }; }
  saved(): void { this.editor = null; this.success = 'عملیات با موفقیت ثبت شد.'; this.load(); }
  download(excel = false): void {
    if (this.exporting || this.section === 'overview' || this.section === 'permissions') return;
    this.exporting = true;
    this.api.export(this.section, this.filter, excel).pipe(finalize(() => { this.exporting = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: blob => downloadBlob(blob, `accounting-${this.section}.${excel ? 'xlsx' : 'csv'}`), error: e => this.error = accountingError(e) });
  }
  history(row: AccountingRow): void {
    const section = this.section === 'SecretaryWallets' ? 'SecretaryWalletTransactions' : this.section === 'ConsultantWallets' ? 'ConsultantRewards' : 'PatientWalletTransactions';
    this.select(section, { userId: row.userId ?? undefined, status: this.section === 'ConsultantWallets' ? 'Approved' : undefined });
  }
  filterCase(row: AccountingRow, section: AccountingSection): void { this.select(section, { caseId: row.caseId ?? undefined }); }
  receipt(row: AccountingRow): void {
    this.api.receipt(row.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: blob => downloadBlob(blob, `receipt-${row.id}.html`), error: e => { this.error = accountingError(e); this.cdr.markForCheck(); } });
  }
  logout(): void { this.auth.logout(); void this.router.navigateByUrl('/'); }
}
