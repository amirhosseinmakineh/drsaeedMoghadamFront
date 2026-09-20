import {
  AgreementType,
  CommitmentStatus,
  DebtStatus,
  FinancialCaseDetails,
  FinancialCaseStatus,
  FinancialSourceType,
  PatientChequeDetails,
  PatientDebtDetails,
  PatientFinanceDetails,
  PatientPromissoryNoteDetails,
  PatientTransactionDetails,
} from "../../../shared/patient-finance/patient-finance-details.models";

export type PatientFileSourceType = "System" | "Legacy";

export type {
  AgreementType,
  CommitmentStatus,
  DebtStatus,
  FinancialCaseStatus,
  FinancialSourceType,
};

export interface PatientFile {
  id: number;
  patientId?: string | number | null;
  financialPatientId?: string | null;
  fileNumber: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  description?: string | null;
  sourceType: PatientFileSourceType;
  createdAt?: string;
  finance: PatientFinanceDetails | null;
}

export type PatientFinance = PatientFinanceDetails;
export type FinancialCase = FinancialCaseDetails;
export type Cheque = PatientChequeDetails;
export type PromissoryNote = PatientPromissoryNoteDetails;
export type Debt = PatientDebtDetails;
export type Transaction = PatientTransactionDetails;

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface PatientFileQuery {
  search: string;
  fileNumber: string;
  sourceType: "" | PatientFileSourceType;
  page: number;
  pageSize: number;
}

export interface CreatePatientFileResult {
  id: number;
  fileNumber: number;
}

export interface PatientFileFinancialIdentity {
  financialPatientId: string;
}

export interface ImportPatientFilesResult {
  success: boolean;
  importedCount: number;
}

export interface CreatePatientFileRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  description?: string;
}
