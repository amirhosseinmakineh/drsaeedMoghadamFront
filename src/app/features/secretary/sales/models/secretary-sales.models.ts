export enum SecretarySaleStatus {
  PendingAdminApproval = 1,
  Approved = 2,
  Rejected = 3,
}

export enum SecretaryWalletTransactionType {
  SaleReward = 1,
  Withdrawal = 2,
  ManualCredit = 3,
  ManualDebit = 4,
}

export interface SecretarySaleService {
  id: number;
  title: string;
  price: number;
  secretaryReward: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface SecretarySalePatient {
  patientUserId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface SecretarySale {
  saleId: number;
  secretaryUserId: string;
  secretaryName: string;
  patientUserId: string;
  patientName: string;
  patientPhoneNumber: string;
  serviceId: number;
  serviceTitle: string;
  salePrice: number;
  secretaryReward: number;
  status: SecretarySaleStatus;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface SecretaryWallet {
  balance: number;
  totalRewards: number;
  approvedSalesCount: number;
}

export interface SecretaryWalletTransaction {
  id: number;
  amount: number;
  transactionType: SecretaryWalletTransactionType;
  description: string;
  createdAt: string;
  saleId?: number | null;
  serviceTitle?: string | null;
  patientName?: string | null;
}

export interface Paginated<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResult<T = unknown> {
  isSuccess: boolean;
  message: string;
  data?: T;
}

export const saleStatusLabel = (status: SecretarySaleStatus): string => ({
  [SecretarySaleStatus.PendingAdminApproval]: "در انتظار تأیید",
  [SecretarySaleStatus.Approved]: "تأیید شده",
  [SecretarySaleStatus.Rejected]: "رد شده",
})[status] ?? "نامشخص";

export const toman = (amount: number): string => `${new Intl.NumberFormat("fa-IR").format(amount)} تومان`;
