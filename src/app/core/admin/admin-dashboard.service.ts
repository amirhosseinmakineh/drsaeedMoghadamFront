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
  id: number;
  userName: string;
  phoneNumber: string;
  leadAssignmentState: number;
  leadAssignmentType: number;
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
    return this.http.get<PaginatedResponse<LeadAssignmentItem>>(`${this.apiBaseUrl}/api/Consultant/GetLeads`, {
      headers: this.authHeaders(),
      params: this.toParams(filters)
    });
  }

  getSystemLeads(filters: LeadFilters): Observable<PaginatedResponse<LeadAssignmentItem>> {
    return this.http.get<PaginatedResponse<LeadAssignmentItem>>(`${this.apiBaseUrl}/api/LeadAssignment`, {
      headers: this.authHeaders(),
      params: this.toParams(filters)
    });
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
