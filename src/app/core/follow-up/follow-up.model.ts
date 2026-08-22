export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface PatientSearchItem {
  patientId: number;
  patientName: string;
  phoneNumber: string;
}

export interface PatientFollowUpInfo extends PatientSearchItem {
  consultantId: number;
  consultantName: string;
  reservationId: number;
  reservationDate: string;
  reservationTime: string;
}

export interface SecretaryFollowUp extends PatientSearchItem {
  id: number;
  consultantName: string;
  reservationDate: string;
  reservationTime: string;
  contacted: boolean;
  contactResult: string;
  createdAt: string;
}

export interface ConsultantFollowUp extends SecretaryFollowUp {
  secretaryName: string;
}

export interface CreateSecretaryFollowUpRequest {
  patientId: number;
  contacted: boolean;
  contactResult: string;
}

export interface UpdateSecretaryFollowUpRequest {
  contacted: boolean;
  contactResult: string;
}
