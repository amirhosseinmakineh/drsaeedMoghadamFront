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

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roleName: string;
  isActive: boolean;
  isCompleteProfile?: boolean;
  gender?: number;
  avatarImageName?: string | null;
}

export interface SaveUserRequest {
  id?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  passwordHash?: string;
  isCompleteProfile: boolean;
  avatarImageName: string | null;
  gender: number;
  birthDate?: string;
  isActive?: boolean;
  roleName: string;
}

export interface UserFilters {
  firstName?: string;
  lastName?: string;
  roleName?: string;
  phoneNumber?: string;
  gender?: number | null;
  isActive?: boolean | null;
  pageNumber: number;
  pageSize: number;
}

export interface Consultant {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileId: number;
  attendanceResponse?: unknown;
  scoreLogResponse?: unknown;
  leadsAssignmentItemsResponse?: unknown;
}

export interface ConsultantFilters {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  pageNumber: number;
  pageSize: number;
}

export interface AttendanceItem {
  id: number;
  attendanceDate: string;
  checkInTime: string;
  checkOutTime: string;
  status: number;
  description: string | null;
}

export interface LeadAssignmentItem {
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
  user?: LeadPerson | null;
  lead?: LeadPerson | null;
}

export interface LeadFilters {
  profileId?: number;
  leadAssignmentState?: number | null;
  leadAssignmentType?: number | null;
  pageNumber: number;
  pageSize: number;
}

export interface ScoreRequest {
  consultantProfileId: number;
  source: number;
  reason: number;
  scoreValue: number;
  description: string | null;
  leadAssignmentId: number | null;
  createdByUserId: string | null;
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
export class AdminDashboardService {
  private readonly apiBaseUrl = 'http://localhost:5182';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getUsers(filters: UserFilters): Observable<PaginatedResponse<AdminUser>> {
    return this.http.get<PaginatedResponse<AdminUser>>(`${this.apiBaseUrl}/api/User`, {
      headers: this.authHeaders(),
      params: this.toParams(filters)
    });
  }

  addUser(payload: SaveUserRequest): Observable<ApiCommandResponse> {
    return this.http.post<ApiCommandResponse>(`${this.apiBaseUrl}/api/User`, payload, {
      headers: this.authHeaders()
    }).pipe(this.ensureCommandSucceeded('ثبت کاربر انجام نشد'));
  }

  updateUser(payload: SaveUserRequest): Observable<ApiCommandResponse> {
    return this.http.put<ApiCommandResponse>(`${this.apiBaseUrl}/api/User`, payload, {
      headers: this.authHeaders()
    }).pipe(this.ensureCommandSucceeded('ویرایش کاربر انجام نشد'));
  }

  deleteUser(userId: string): Observable<ApiCommandResponse<boolean>> {
    return this.http.delete<ApiCommandResponse<boolean>>(`${this.apiBaseUrl}/api/User`, {
      headers: this.authHeaders(),
      params: this.toParams({ userId })
    }).pipe(this.ensureCommandSucceeded('حذف کاربر انجام نشد'));
  }

  getConsultants(filters: ConsultantFilters): Observable<PaginatedResponse<Consultant>> {
    return this.http.get<PaginatedResponse<Consultant>>(`${this.apiBaseUrl}/api/Consultant/GetConsultants`, {
      headers: this.authHeaders(),
      params: this.toParams(filters)
    });
  }

  createScore(payload: ScoreRequest): Observable<ApiCommandResponse> {
    return this.http.post<ApiCommandResponse>(`${this.apiBaseUrl}/api/ScoreLog`, payload, {
      headers: this.authHeaders()
    }).pipe(this.ensureCommandSucceeded('ثبت امتیاز انجام نشد'));
  }

  getAttendance(consultantProfileId: number, pageNumber = 1, pageSize = 10): Observable<PaginatedResponse<AttendanceItem>> {
    return this.http.get<PaginatedResponse<AttendanceItem>>(`${this.apiBaseUrl}/api/Attendance`, {
      headers: this.authHeaders(),
      params: this.toParams({ consultantProfileId, pageNumber, pageSize })
    });
  }

  getConsultantLeads(filters: LeadFilters): Observable<PaginatedResponse<LeadAssignmentItem>> {
    return this.http.get<unknown>(`${this.apiBaseUrl}/api/Consultant/GetLeads`, {
      headers: this.authHeaders(),
      params: this.toParams(filters)
    }).pipe(map(response => this.normalizePaginatedResponse<LeadAssignmentItem>(response, filters)));
  }

  getSystemLeads(filters: LeadFilters): Observable<PaginatedResponse<LeadAssignmentItem>> {
    return this.http.get<unknown>(`${this.apiBaseUrl}/api/LeadAssignment`, {
      headers: this.authHeaders(),
      params: this.toParams(filters)
    }).pipe(map(response => this.normalizePaginatedResponse<LeadAssignmentItem>(response, filters)));
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
