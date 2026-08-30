export enum FinancialAgreementType { PrePayment = 1, Deposit = 2 }
export enum FinancialCaseStatus { Active = 1, Completed = 2, Cancelled = 3 }
export enum CommitmentStatus { Pending = 1, Paid = 2, Unpaid = 3, Cancelled = 4 }
export enum DebtStatus { Unpaid = 1, Paid = 2, Cancelled = 3 }
export enum FinancialSourceType { Cheque = 1, PromissoryNote = 2 }

export interface ApiResult<T> { data: T | null; isSuccess: boolean; message: string; }
export interface IdResponse { id: number; }
export interface PaginatedResult<T> { items: T[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number; hasPrevious: boolean; hasNext: boolean; }
export interface PageQuery { page?: number; pageSize?: number; [key: string]: string | number | boolean | null | undefined; }

export interface CreateChequeRequest { amount: number; sayadNumber: string; ownerName: string; dueDate: string; }
export interface CreatePromissoryNoteRequest { serialNumber: string; amount: number; dueDate: string; }
export interface CreateFinancialCaseRequest { patientId: number; serviceId: number; totalAmount: number; agreementType: FinancialAgreementType; cheques: CreateChequeRequest[]; promissoryNotes: CreatePromissoryNoteRequest[]; }
export interface UpdateFinancialCaseRequest { totalAmount: number; agreementType: FinancialAgreementType; }
export interface PatientFinancialCase { id: number; patientId: number; patientName: string; patientPhoneNumber: string | null; serviceId: number; serviceName: string; totalAmount: number; totalPaidAmount: number; remainingAmount: number; totalDebtAmount: number; agreementType: FinancialAgreementType; status: FinancialCaseStatus; createdAt: string; }
export interface PatientFinancialCaseDetails { case: PatientFinancialCase; chequeCount: number; chequeAmount: number; promissoryNoteCount: number; promissoryNoteAmount: number; }
export interface PatientCheque { id: number; patientFinancialCaseId: number; patientId: number; patientName: string; amount: number; sayadNumber: string; ownerName: string; dueDate: string; status: CommitmentStatus; }
export interface PatientPromissoryNote { id: number; patientFinancialCaseId: number; patientId: number; patientName: string; serialNumber: string; amount: number; dueDate: string; status: CommitmentStatus; }
export interface PatientDebt { id: number; patientId: number; patientName: string; patientPhoneNumber: string | null; patientFinancialCaseId: number; serviceName: string; amount: number; sourceType: FinancialSourceType; sourceId: number; dueDate: string; status: DebtStatus; }
export interface PatientFinancialTransaction { id: number; patientFinancialCaseId: number; patientId: number; amount: number; type: 1; sourceType: FinancialSourceType; sourceId: number; createdAt: string; }
export interface PatientFinancialCommitment { id: number; type: FinancialSourceType; patientFinancialCaseId: number; patientId: number; patientName: string; amount: number; dueDate: string; status: CommitmentStatus; }
export interface PatientFinancialCaseSummary { totalAmount: number; totalPaidAmount: number; remainingAmount: number; totalChequeAmount: number; paidChequeAmount: number; pendingChequeAmount: number; unpaidChequeAmount: number; totalPromissoryNoteAmount: number; paidPromissoryNoteAmount: number; pendingPromissoryNoteAmount: number; unpaidPromissoryNoteAmount: number; totalDebtAmount: number; }
