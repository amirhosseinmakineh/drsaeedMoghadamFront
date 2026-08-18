export type TransactionDirection = "Credit" | "Debit";
export type TransactionStatus = "Completed" | "Cancelled" | "Reversed" | string;

export interface FinancialTransaction {
  id: string | number;
  transactionNumber?: string;
  type: string;
  direction: TransactionDirection;
  amount: number;
  status: TransactionStatus;
  createdAt: string;
  description?: string | null;
  createdByName?: string | null;
}

export interface Wallet {
  id?: string | number;
  userId: string;
  userName?: string;
  roleName?: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  transactions: FinancialTransaction[];
}

export interface WalletOperationRequest {
  amount: number;
  description?: string;
}

export interface ApiEnvelope<T> {
  isSuccess?: boolean;
  message?: string;
  data: T;
}
