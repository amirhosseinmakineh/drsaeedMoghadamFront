export enum FinancialAgreementType { PrePayment = 1, Deposit = 2 }
export enum FinancialCaseStatus { Active = 1, Completed = 2, Cancelled = 3 }
export enum CommitmentStatus { Pending = 1, Paid = 2, Unpaid = 3, Cancelled = 4 }
export enum DebtStatus { Unpaid = 1, Paid = 2, Cancelled = 3 }
export enum FinancialSourceType { Cheque = 1, PromissoryNote = 2 }

export type PatientGuid = string;
export type PatientFinancialCaseId = string;

export interface ApiResult<T> { data: T | null; isSuccess: boolean; message: string; }
export interface IdResponse { id: number; }
export interface PatientFinancialCaseIdResponse { id: PatientFinancialCaseId; }
export interface PaginatedResult<T> { items: T[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number; hasPrevious: boolean; hasNext: boolean; }
export interface PageQuery { page?: number; pageSize?: number; [key: string]: string | number | boolean | null | undefined; }

export interface CreateChequeRequest { amount: number; sayadNumber: string; ownerName: string; dueDate: string; }
export interface CreatePromissoryNoteRequest { serialNumber: string; amount: number; dueDate: string; }
export interface UpdateChequeRequest { amount: number; sayadNumber: string; ownerName: string; dueDate: string; }
export interface UpdatePromissoryNoteRequest { amount: number; serialNumber: string; dueDate: string; }
export interface CreateFinancialCaseRequest { paymentMethod?: string | null; installmentStatus?: string | null; guaranteeDocument?: string | null; guaranteeDate?: string | null; guaranteeAmount?: number | null; guaranteeChequeRegistration?: string | null; notes?: string | null; consultantName?: string | null; reviewItems?: string | null; patientId: PatientGuid; serviceId: number; totalAmount: number; prePaymentAmount: number; depositAmount: number; agreementType: FinancialAgreementType; cheques?: CreateChequeRequest[] | null; promissoryNotes?: CreatePromissoryNoteRequest[] | null; }
export interface UpdateFinancialCaseRequest { paymentMethod?: string | null; installmentStatus?: string | null; guaranteeDocument?: string | null; guaranteeDate?: string | null; guaranteeAmount?: number | null; guaranteeChequeRegistration?: string | null; notes?: string | null; consultantName?: string | null; reviewItems?: string | null; totalAmount: number; prePaymentAmount: number; depositAmount: number; agreementType: FinancialAgreementType; }
export interface PatientFinancialCase { chequeDates?: string[]; chequeRegistrations?: string[]; balanceAmount: number; paymentMethod?: string | null; installmentStatus?: string | null; guaranteeDocument?: string | null; guaranteeDate?: string | null; guaranteeAmount?: number | null; guaranteeChequeRegistration?: string | null; notes?: string | null; consultantName?: string | null; reviewItems?: string | null; id: PatientFinancialCaseId; patientId: PatientGuid; patientName: string; patientFileNumber?: string | number | null; fileNumber?: string | number | null; patientPhoneNumber: string | null; serviceId: number; serviceName: string; totalAmount: number; prePaymentAmount: number; depositAmount: number; totalPaidAmount: number; remainingAmount: number; totalDebtAmount: number; agreementType: FinancialAgreementType; status: FinancialCaseStatus; createdAt: string; }
export interface PatientFinancialCaseDetails { case: PatientFinancialCase; chequeCount: number; chequeAmount: number; promissoryNoteCount: number; promissoryNoteAmount: number; cheques?: PatientCheque[]; promissoryNotes?: PatientPromissoryNote[]; }
export interface PatientCheque { id: number; patientFinancialCaseId: PatientFinancialCaseId; patientId: PatientGuid; patientName: string; patientFileNumber?: string | number | null; fileNumber?: string | number | null; amount: number; sayadNumber: string; ownerName: string; dueDate: string; status: CommitmentStatus; }
export interface PatientPromissoryNote { id: number; patientFinancialCaseId: PatientFinancialCaseId; patientId: PatientGuid; patientName: string; patientFileNumber?: string | number | null; fileNumber?: string | number | null; serialNumber: string; amount: number; dueDate: string; status: CommitmentStatus; }
export interface PatientDebt { id: number; patientId: PatientGuid; patientName: string; patientFileNumber?: string | number | null; fileNumber?: string | number | null; patientPhoneNumber: string | null; patientFinancialCaseId: PatientFinancialCaseId; serviceId?: number; serviceName: string; amount: number; sourceType: FinancialSourceType; sourceId: number; dueDate: string; status: DebtStatus; }
export interface PatientFinancialTransaction { id: number; patientFinancialCaseId: PatientFinancialCaseId; patientId: PatientGuid; patientName?: string; patientFileNumber?: string | number | null; fileNumber?: string | number | null; amount: number; type: 1; sourceType: FinancialSourceType; sourceId: number; createdAt: string; }
export interface PatientFinancialCommitment { id: number; type: FinancialSourceType; patientFinancialCaseId: PatientFinancialCaseId; patientId: PatientGuid; patientName: string; patientFileNumber?: string | number | null; fileNumber?: string | number | null; amount: number; dueDate: string; status: CommitmentStatus; }
export interface PatientFinancialCaseSummary { totalAmount: number; totalPaidAmount: number; remainingAmount: number; totalChequeAmount: number; paidChequeAmount: number; pendingChequeAmount: number; unpaidChequeAmount: number; totalPromissoryNoteAmount: number; paidPromissoryNoteAmount: number; pendingPromissoryNoteAmount: number; unpaidPromissoryNoteAmount: number; totalDebtAmount: number; }
