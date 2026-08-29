import { CreateSecretaryFinancialTransactionRequest } from "../models/secretary-account.models";

export type SecretaryTransactionFormValue = CreateSecretaryFinancialTransactionRequest;

export function normalizeSecretaryTransaction(
  value: SecretaryTransactionFormValue,
): CreateSecretaryFinancialTransactionRequest {
  return {
    ...value,
    subject: normalizeText(value.subject),
    counterpartyName: normalizeText(value.counterpartyName),
    trackingNumber: normalizeText(value.trackingNumber),
    description: normalizeText(value.description),
    receiptUrl: normalizeText(value.receiptUrl),
  };
}

function normalizeText(value: string | null): string | null {
  const normalizedValue = value?.trim();
  return normalizedValue || null;
}
