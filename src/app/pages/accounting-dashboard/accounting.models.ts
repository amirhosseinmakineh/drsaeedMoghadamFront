export type AccountingSection = 'Patients' | 'Cheques' | 'Notes' | 'Installments' | 'Debts' | 'PatientPayments'
  | 'ConsultantWallets' | 'Transactions' | 'Categories' | 'SecretarySales' | 'ConsultantRewards' | 'Referrals' | 'SecretaryWallets'
  | 'PatientWallets' | 'SecretaryWalletTransactions' | 'PatientWalletTransactions' | 'Audit';
export interface AccountingRow {
  id: string; person: string; description: string; amount: number; status: string; date: string | null;
  caseId: string | null; userId: string | null; isGuarantee: boolean; number: string | null;
  owner: string | null; paidAmount: number | null; detailsJson: string | null;
}
export interface AccountingFilter {
  page: number; pageSize: number; search?: string; status?: string; fromDate?: string; toDate?: string;
  userId?: string; caseId?: string;
}
export interface AccountingPage { items: AccountingRow[]; totalCount: number; page: number; pageSize: number; }
export interface AccountingMetric { key: string; amount: number; count: number; }
export interface AccountingAccess { isAdmin: boolean; permissions: string[]; availablePermissions: string[]; }
export interface AccountantUser { id: string; name: string; phoneNumber: string; permissions: string[]; }
export interface AccountingOperationResult { isSuccess: boolean; message: string; data: { message: string; data: unknown } | null; }
export const ACCOUNTING_PERMISSION_LABELS: Record<string, string> = {
  'Accounting.View': 'مشاهده اطلاعات مالی', 'Accounting.Export': 'دریافت خروجی',
  'Accounting.EditPatients': 'ویرایش مالی بیمار', 'Accounting.EditDocuments': 'ویرایش اسناد',
  'Accounting.Collect': 'ثبت وصول و پرداخت', 'Accounting.Cancel': 'حذف و لغو',
  'Accounting.ManageTransactions': 'ثبت و ویرایش درآمد و هزینه', 'Accounting.ManageCategories': 'مدیریت دسته‌بندی هزینه',
  'Accounting.ApproveSecretary': 'تأیید و رد پاداش منشی', 'Accounting.ApproveConsultant': 'تأیید و رد پاداش مشاور',
  'Accounting.ApproveReferral': 'تأیید و رد پاداش معرفی', 'Accounting.ViewAudit': 'مشاهده سابقه عملیات'
};
export const METRIC_LABELS: Record<string, string> = {
  Income: 'درآمد ثبت‌شده کلینیک', Expense: 'هزینه ثبت‌شده کلینیک', TreatmentValue: 'ارزش درمان‌های ثبت‌شده',
  PatientCollected: 'وصول پرونده‌های انتخاب‌شده', TreatmentRemaining: 'مانده درمان', OpenDebt: 'بدهی باز با سررسید انتخاب‌شده',
  SecretaryPending: 'پاداش منشی در انتظار', SecretaryApproved: 'پاداش منشی تأییدشده', SecretaryRejected: 'پاداش منشی ردشده',
  ConsultantPending: 'پاداش مشاور در انتظار', ConsultantApproved: 'پاداش مشاور تأییدشده', ConsultantRejected: 'پاداش مشاور ردشده',
  ReferralPending: 'پاداش معرفی در انتظار', ReferralApproved: 'پاداش معرفی تأییدشده', ReferralRejected: 'پاداش معرفی ردشده'
};
export interface AccountingTab { id: AccountingSection; label: string; dateLabel: string; statuses: Record<string, string>; }
const documents = { '1': 'در انتظار', '2': 'وصول‌شده', '3': 'وصول‌نشده', '4': 'لغوشده' };
const reward = { '1': 'در انتظار', '2': 'تأییدشده', '3': 'ردشده' };
export const ACCOUNTING_TABS: AccountingTab[] = [
  { id: 'Patients', label: 'مالی بیماران', dateLabel: 'تاریخ ایجاد پرونده', statuses: { '1': 'فعال', '2': 'تکمیل‌شده', '3': 'لغوشده' } },
  { id: 'Cheques', label: 'چک‌ها', dateLabel: 'سررسید چک', statuses: documents },
  { id: 'Notes', label: 'سفته‌ها', dateLabel: 'سررسید سفته', statuses: documents },
  { id: 'Installments', label: 'جدول اقساط', dateLabel: 'سررسید قسط', statuses: { Pending: 'در انتظار پرداخت', Paid: 'پرداخت‌شده' } },
  { id: 'Debts', label: 'بدهی‌ها', dateLabel: 'سررسید بدهی', statuses: { '1': 'پرداخت‌نشده', '2': 'پرداخت‌شده', '3': 'لغوشده' } },
  { id: 'PatientPayments', label: 'تراکنش‌های بیمار', dateLabel: 'تاریخ پرداخت', statuses: { Paid: 'پرداخت‌شده' } },
  { id: 'Transactions', label: 'درآمد و هزینه', dateLabel: 'تاریخ تراکنش', statuses: { '1': 'درآمد', '2': 'هزینه' } },
  { id: 'Categories', label: 'دسته‌بندی هزینه', dateLabel: 'تاریخ ایجاد', statuses: { Active: 'فعال', Inactive: 'غیرفعال' } },
  { id: 'SecretarySales', label: 'فروش و پاداش منشی', dateLabel: 'تاریخ فروش', statuses: reward },
  { id: 'ConsultantRewards', label: 'پاداش مشاور', dateLabel: 'تاریخ واجد شرایط‌شدن', statuses: { Pending: 'در انتظار', Approved: 'تأییدشده', Rejected: 'ردشده' } },
  { id: 'Referrals', label: 'پاداش معرفی بیمار', dateLabel: 'تاریخ معرفی', statuses: { '1': 'ثبت‌شده', '2': 'تماس گرفته‌شده', '3': 'در انتظار تأیید', '4': 'پاداش ثبت‌شده', '5': 'ردشده' } },
  { id: 'SecretaryWallets', label: 'کیف پول منشی‌ها', dateLabel: 'آخرین تغییر موجودی', statuses: { Balance: 'موجودی' } },
  { id: 'ConsultantWallets', label: 'کیف پول مشاوران', dateLabel: 'آخرین تأیید پاداش', statuses: { Balance: 'مجموع پاداش تأییدشده' } },
  { id: 'PatientWallets', label: 'کیف پول بیماران', dateLabel: 'آخرین تغییر موجودی', statuses: { Balance: 'موجودی پاداش معرفی' } },
  { id: 'SecretaryWalletTransactions', label: 'گردش کیف پول منشی', dateLabel: 'تاریخ گردش', statuses: { '1': 'پاداش فروش', '2': 'برداشت', '3': 'افزایش دستی', '4': 'کاهش دستی' } },
  { id: 'PatientWalletTransactions', label: 'گردش کیف پول بیمار', dateLabel: 'تاریخ گردش', statuses: { '1': 'پاداش معرفی', '2': 'برداشت', '3': 'افزایش دستی', '4': 'کاهش دستی' } },
  { id: 'Audit', label: 'سابقه عملیات', dateLabel: 'تاریخ عملیات', statuses: { Recorded: 'ثبت‌شده' } }
];
