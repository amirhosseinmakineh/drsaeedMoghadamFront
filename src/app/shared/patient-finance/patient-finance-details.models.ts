export type AgreementType = 1 | 2;
export type FinancialCaseStatus = 1 | 2 | 3;
export type CommitmentStatus = 1 | 2 | 3 | 4;
export type DebtStatus = 1 | 2 | 3;
export type FinancialSourceType = 1 | 2;

export interface PatientFinanceDetails {
  financialPatientId: string;
  totalTreatmentAmount: number;
  totalPaidAmount: number;
  remainingAmount: number;
  totalDebtAmount: number;
  activeFinancialCasesCount: number;
  unpaidChequesCount: number;
  unpaidPromissoryNotesCount: number;
  cases: FinancialCaseDetails[];
}

export interface FinancialCaseDetails {
  prePaymentAmount?: number;
  depositAmount?: number;
  balanceAmount?: number;
  paymentMethod?: string | null;
  installmentStatus?: string | null;
  guaranteeDocument?: string | null;
  guaranteeDate?: string | null;
  guaranteeAmount?: number | null;
  guaranteeChequeRegistration?: string | null;
  notes?: string | null;
  consultantName?: string | null;
  reviewItems?: string | null;
  id: string;
  serviceId: number;
  serviceName: string;
  totalAmount: number;
  totalPaidAmount: number;
  remainingAmount: number;
  totalDebtAmount: number;
  agreementType: AgreementType;
  status: FinancialCaseStatus;
  createdAt: string;
  cheques: PatientChequeDetails[];
  promissoryNotes: PatientPromissoryNoteDetails[];
  debts: PatientDebtDetails[];
  transactions: PatientTransactionDetails[];
}

export interface PatientChequeDetails {
  id: number;
  amount: number;
  sayadNumber: string;
  ownerName: string;
  dueDate: string;
  status: CommitmentStatus;
}

export interface PatientPromissoryNoteDetails {
  id: number;
  serialNumber: string;
  amount: number;
  dueDate: string;
  status: CommitmentStatus;
}

export interface PatientDebtDetails {
  id: number;
  amount: number;
  sourceType: FinancialSourceType;
  sourceId: number;
  dueDate: string;
  status: DebtStatus;
}

export interface PatientTransactionDetails {
  id: number;
  amount: number;
  type: 1;
  sourceType: FinancialSourceType;
  sourceId: number;
  createdAt: string;
}
