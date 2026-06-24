import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface ApiCommandResponse<T = unknown> {
  isSuccess: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CompleteConsultantProfileRequest {
  profileId: number;
  nationalityCode: string;
  address: string;
  isCompleteProfile: boolean;
}

export interface AvailabilityRequest {
  profileId: number;
  isAvailable: boolean;
}

export interface OnlineRequest {
  profileId: number;
  isOnline: boolean;
  isOffline: boolean;
}

export interface ConsultantLead {
  id?: number;
  leadAssignmentId?: number;
  userName?: string | null;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  mobile?: string | null;
  userPhoneNumber?: string | null;
  leadPhoneNumber?: string | null;
  leadAssignmentState?: number | null;
  state?: number | null;
  status?: number | null;
  leadAssignmentType?: number | null;
  type?: number | null;
  assignmentType?: number | null;
  requiresThreeMinuteCall?: boolean | null;
  RequiresThreeMinuteCall?: boolean | null;
  callDeadlineAt?: string | null;
  CallDeadlineAt?: string | null;
  isReportSubmitted?: boolean | null;
  IsReportSubmitted?: boolean | null;
  user?: LeadPerson | null;
  lead?: LeadPerson | null;
}

export interface LeadFilters {
  profileId: number;
  leadAssignmentState?: number | null;
  leadAssignmentType?: number | null;
  pageNumber: number;
  pageSize: number;
}

export interface SubmitLeadCallReportRequest {
  leadAssignmentId: number;
  consultantProfileId: number;
  callResult: number;
  reportDescription: string | null;
}

export interface LeadCallReportResponse {
  leadAssignmentId: number;
  consultantProfileId: number;
  isReportSubmitted: boolean;
  reportSubmittedAt?: string;
  leadAssignmentState: number;
  callResult: number;
  isConsultantOnline: boolean;
}

export interface ExpireLeadNoCallRequest {
  leadAssignmentId: number;
  consultantProfileId: number;
}

export interface ExpireLeadNoCallResponse {
  leadAssignmentId: number;
  consultantProfileId: number;
  leadAssignmentState: number;
  deductedScore: number;
  currentScore: number;
  isConsultantOnline: boolean;
}

export interface CreateReservationRequest {
  leadAssignmentId: number;
  consultantProfileId: number;
  reservationAt: string;
  description: string | null;
}

export interface ConsultantReservation {
  id: number;
  leadAssignmentId: number;
  consultantProfileId: number;
  reservationAt: string;
  patientName: string;
  patientPhoneNumber: string;
  description?: string | null;
  isCanceled?: boolean;
}

export interface ReservationFilters {
  consultantProfileId: number;
  from?: string;
  to?: string;
  includeCanceled?: boolean;
  pageNumber: number;
  pageSize: number;
}

interface LeadPerson {
  userName?: string | null;
  fullName?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  mobile?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ConsultantDashboardService {
  private readonly apiBaseUrl = 'http://localhost:5182';

  constructor(private http: HttpClient, private auth: AuthService) {}

  completeProfile(payload: CompleteConsultantProfileRequest): Observable<ApiCommandResponse<number>> {
    return this.http.post<ApiCommandResponse<number>>(`${this.apiBaseUrl}/api/Consultant`, payload, {
      headers: this.authHeaders()
    }).pipe(this.ensureCommandSucceeded('تکمیل پروفایل مشاور انجام نشد'));
  }

  setAvailability(payload: AvailabilityRequest): Observable<ApiCommandResponse> {
    return this.http.post<ApiCommandResponse>(`${this.apiBaseUrl}/api/Consultant/SetAvalableConsultant`, payload, {
      headers: this.authHeaders()
    }).pipe(this.ensureCommandSucceeded('ثبت حضور انجام نشد'));
  }

  setOnlineStatus(payload: OnlineRequest): Observable<ApiCommandResponse> {
    return this.http.post<ApiCommandResponse>(`${this.apiBaseUrl}/api/Consultant/SetOnlineOfflineConsultant`, payload, {
      headers: this.authHeaders()
    }).pipe(this.ensureCommandSucceeded('تغییر وضعیت آنلاین انجام نشد'));
  }

  getLeads(filters: LeadFilters): Observable<PaginatedResponse<ConsultantLead>> {
    return this.http.get<unknown>(`${this.apiBaseUrl}/api/Consultant/GetLeads`, {
      headers: this.authHeaders(),
      params: this.toParams(filters)
    }).pipe(map(response => this.normalizePaginatedResponse<ConsultantLead>(response, filters)));
  }

  submitLeadCallReport(payload: SubmitLeadCallReportRequest): Observable<ApiCommandResponse<LeadCallReportResponse>> {
    return this.http.post<ApiCommandResponse<LeadCallReportResponse>>(`${this.apiBaseUrl}/api/Consultant/SubmitLeadCallReport`, payload, {
      headers: this.authHeaders()
    }).pipe(this.ensureCommandSucceeded('ثبت گزارش تماس انجام نشد'));
  }

  expireLeadNoCall(payload: ExpireLeadNoCallRequest): Observable<ApiCommandResponse<ExpireLeadNoCallResponse>> {
    return this.http.post<ApiCommandResponse<ExpireLeadNoCallResponse>>(`${this.apiBaseUrl}/api/Consultant/ExpireLeadNoCall`, payload, {
      headers: this.authHeaders()
    }).pipe(this.ensureCommandSucceeded('منقضی کردن لید انجام نشد'));
  }

  createReservation(payload: CreateReservationRequest): Observable<ApiCommandResponse<ConsultantReservation>> {
    return this.http.post<ApiCommandResponse<ConsultantReservation>>(`${this.apiBaseUrl}/api/Reservation`, payload, {
      headers: this.authHeaders()
    }).pipe(this.ensureCommandSucceeded('ثبت رزرو انجام نشد'));
  }

  getReservations(filters: ReservationFilters): Observable<PaginatedResponse<ConsultantReservation>> {
    return this.http.get<unknown>(`${this.apiBaseUrl}/api/Reservation/GetConsultantReservations`, {
      headers: this.authHeaders(),
      params: this.toParams(filters)
    }).pipe(map(response => this.normalizePaginatedResponse<ConsultantReservation>(response, filters)));
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth.user()?.token;
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private toParams(source: object): HttpParams {
    let params = new HttpParams();

    Object.entries(source as Record<string, unknown>).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;
      params = params.set(key, String(value));
    });

    return params;
  }

  private ensureCommandSucceeded<T>(fallback: string) {
    return (source: Observable<ApiCommandResponse<T>>) => source.pipe(
      map(response => {
        if (!response.isSuccess) {
          throw new Error(response.message || fallback);
        }

        return response;
      }),
      catchError(error => throwError(() => this.toUserFacingError(error, fallback)))
    );
  }

  private normalizePaginatedResponse<T>(response: unknown, filters: { pageNumber: number; pageSize: number }): PaginatedResponse<T> {
    const source = this.unwrapResponseData(response);
    const items = this.readItems<T>(source);
    const totalCount = this.readNumber(source, 'totalCount', 'total', 'count') ?? items.length;
    const pageSize = this.readNumber(source, 'pageSize', 'take') ?? filters.pageSize;
    const pageNumber = this.readNumber(source, 'pageNumber', 'page') ?? filters.pageNumber;
    const totalPages = this.readNumber(source, 'totalPages') ?? Math.ceil(totalCount / pageSize);

    return {
      items,
      totalCount,
      pageNumber,
      pageSize,
      totalPages: Math.max(1, totalPages)
    };
  }

  private unwrapResponseData(response: unknown): unknown {
    if (Array.isArray(response)) return response;
    if (!this.isRecord(response)) return response;

    if ('data' in response && response['data'] !== null && response['data'] !== undefined) {
      return response['data'];
    }

    return response;
  }

  private readItems<T>(source: unknown): T[] {
    if (Array.isArray(source)) return source as T[];
    if (!this.isRecord(source)) return [];

    const items = source['items'] ?? source['data'];
    return Array.isArray(items) ? items as T[] : [];
  }

  private readNumber(source: unknown, ...keys: string[]): number | null {
    if (!this.isRecord(source)) return null;

    for (const key of keys) {
      const value = source[key];
      if (value === null || value === undefined || value === '') continue;
      const numeric = typeof value === 'number' ? value : Number(value);
      if (Number.isFinite(numeric)) return numeric;
    }

    return null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private toUserFacingError(error: unknown, fallback: string): Error {
    if (error instanceof Error && error.message) return error;
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const httpError = error as { error?: { message?: string } | string; message?: string };
      if (typeof httpError.error === 'object' && httpError.error?.message) return new Error(httpError.error.message);
      if (typeof httpError.error === 'string' && httpError.error) return new Error(httpError.error);
      if (httpError.message) return new Error(httpError.message);
    }

    return new Error(fallback);
  }
}
