export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface ConsultantFollowUp {
  id: number;
  patientId: number;
  patientName: string;
  phoneNumber: string;
  consultantName: string;
  reservationDate: string;
  reservationTime: string;
  contacted: boolean;
  contactResult: string;
  createdAt: string;
  secretaryName: string;
}
