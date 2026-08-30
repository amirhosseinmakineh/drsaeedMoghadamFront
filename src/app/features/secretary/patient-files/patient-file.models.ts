export type PatientFileSourceType = "System" | "Legacy";

export interface PatientFile {
  id: number;
  fileNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  sourceType: PatientFileSourceType;
}

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
