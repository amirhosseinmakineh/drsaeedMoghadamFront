import { FinancialTransactionType } from "../enums/financial-transaction-type.enum";
import { PaymentMethod } from "../enums/payment-method.enum";

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export interface CreateSecretaryFinancialTransactionRequest {
  type: FinancialTransactionType;
  amount: number;
  transactionDate: string;
  subject: string | null;
  counterpartyName: string | null;
  paymentMethod: PaymentMethod;
  trackingNumber: string | null;
  description: string | null;
  receiptUrl: string | null;
  expenseCategoryId: number | null;
}

export interface GetSecretaryFinancialTransactionsRequest {
  type?: FinancialTransactionType;
  fromDate?: string;
  toDate?: string;
  search?: string;
  expenseCategoryId?: number;
  page: number;
  pageSize: number;
}

export type SecretaryTransactionFilters = Omit<
  GetSecretaryFinancialTransactionsRequest,
  "page" | "pageSize"
>;

export interface SecretaryFinancialTransactionDto {
  id: number;
  type: FinancialTransactionType;
  typeTitle: string;
  amount: number;
  transactionDate: string;
  subject: string | null;
  counterpartyName: string | null;
  paymentMethod: PaymentMethod;
  paymentMethodTitle: string;
  trackingNumber: string | null;
  description: string | null;
  receiptUrl: string | null;
  expenseCategoryId: number | null;
  expenseCategoryTitle: string | null;
  createdAt: string;
}

export interface SecretaryFinancialTransactionListDto {
  items: SecretaryFinancialTransactionDto[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface SecretaryFinancialSummaryDto {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
}

export interface SecretaryExpenseCategoryDto {
  id: number;
  title: string;
}

export interface CreatedTransactionDto {
  id: number;
}
