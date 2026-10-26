import { FinancialTransactionType } from "../enums/financial-transaction-type.enum";
import { PaymentMethod } from "../enums/payment-method.enum";

export const SECRETARY_ACCOUNT_PAGE_SIZE = 20;
export const SECRETARY_ACCOUNT_MAX_PAGE_SIZE = 100;
export const SEARCH_DEBOUNCE_TIME = 400;
export const SECRETARY_ACCOUNT_ERROR_MESSAGE = "خطایی در انجام عملیات رخ داد.";

export const TRANSACTION_TYPE_OPTIONS = [
  { value: FinancialTransactionType.Income, label: "ورودی" },
  { value: FinancialTransactionType.Expense, label: "خروجی" },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: PaymentMethod.Cash, label: "نقدی" },
  { value: PaymentMethod.Pos, label: "کارتخوان" },
  { value: PaymentMethod.CardToCard, label: "کارت به کارت" },
  { value: PaymentMethod.BankTransfer, label: "واریز بانکی" },
  { value: PaymentMethod.Other, label: "سایر" },
];
