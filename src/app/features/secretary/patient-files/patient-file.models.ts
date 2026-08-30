export type PatientFileSourceType = "System" | "Legacy";

export interface PatientFile {
  id: number;
  patientId?: number | null;
  fileNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  sourceType: PatientFileSourceType;
  createdAt?: string;
  finance: PatientFinance | null;
}

export type AgreementType = 1 | 2;
export type FinancialCaseStatus = 1 | 2 | 3;
export type CommitmentStatus = 1 | 2 | 3 | 4;
export type DebtStatus = 1 | 2 | 3;
export type FinancialSourceType = 1 | 2;
export interface PatientFinance { financialPatientId: number; totalTreatmentAmount: number; totalPaidAmount: number; remainingAmount: number; totalDebtAmount: number; activeFinancialCasesCount: number; unpaidChequesCount: number; unpaidPromissoryNotesCount: number; cases: FinancialCase[]; }
export interface FinancialCase { id: number; serviceId: number; serviceName: string; totalAmount: number; totalPaidAmount: number; remainingAmount: number; totalDebtAmount: number; agreementType: AgreementType; status: FinancialCaseStatus; createdAt: string; cheques: Cheque[]; promissoryNotes: PromissoryNote[]; debts: Debt[]; transactions: Transaction[]; }
export interface Cheque { id: number; amount: number; sayadNumber: string; ownerName: string; dueDate: string; status: CommitmentStatus; }
export interface PromissoryNote { id: number; serialNumber: string; amount: number; dueDate: string; status: CommitmentStatus; }
export interface Debt { id: number; amount: number; sourceType: FinancialSourceType; sourceId: number; dueDate: string; status: DebtStatus; }
export interface Transaction { id: number; amount: number; type: 1; sourceType: FinancialSourceType; sourceId: number; createdAt: string; }

export interface EligiblePatient {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

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

export interface EligiblePatientQuery {
  search: string;
  page: number;
  pageSize: number;
}

export interface CreatePatientFileResult {
  id: number;
  fileNumber: string;
}

export interface ImportPatientFilesResult {
  success: boolean;
  importedCount: number;
}
