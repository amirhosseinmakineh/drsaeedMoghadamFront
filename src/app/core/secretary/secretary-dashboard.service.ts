import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, map, throwError } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { environment } from "../../../environments/environment";

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
  raw?: unknown;
  source?: unknown;
}

export interface CompleteSecretaryProfileRequest {
  userId: string;
  nationalityCode: string;
  address: string;
  isCompleteProfile: boolean;
}

export interface SecretaryReservation {
  id?: number;
  Id?: number;
  leadAssignmentId?: number;
  LeadAssignmentId?: number;
  consultantProfileId?: number;
  ConsultantProfileId?: number;
  consultantFullName?: string | null;
  ConsultantFullName?: string | null;
  consultantUserId?: string | null;
  ConsultantUserId?: string | null;
  patientUserId?: string | null;
  PatientUserId?: string | null;
  requiresPatientProfile?: boolean | null;
  RequiresPatientProfile?: boolean | null;
  reservationAt?: string;
  ReservationAt?: string;
  patientName?: string | null;
  PatientName?: string | null;
  patientPhoneNumber?: string | null;
  PatientPhoneNumber?: string | null;
  patientCity?: string | null;
  PatientCity?: string | null;
  patientRegion?: string | null;
  PatientRegion?: string | null;
  businessName?: string | null;
  BusinessName?: string | null;
  attendanceProbabilityPercent?: number | null;
  AttendanceProbabilityPercent?: number | null;
  attendanceConfirmationStatus?: number | null;
  AttendanceConfirmationStatus?: number | null;
  consultantSaysPatientAttended?: boolean | null;
  ConsultantSaysPatientAttended?: boolean | null;
  consultantAttendanceNote?: string | null;
  ConsultantAttendanceNote?: string | null;
  isWaitingForSecretaryReview?: boolean | null;
  IsWaitingForSecretaryReview?: boolean | null;
  secretaryReviewedAt?: string | null;
  SecretaryReviewedAt?: string | null;
  secretaryUserId?: string | null;
  SecretaryUserId?: string | null;
  secretaryApprovedConsultantConfirmation?: boolean | null;
  SecretaryApprovedConsultantConfirmation?: boolean | null;
  secretaryReviewNote?: string | null;
  SecretaryReviewNote?: string | null;
  isAttendanceScoreApplied?: boolean | null;
  IsAttendanceScoreApplied?: boolean | null;
  attendanceScoreValue?: number | null;
  AttendanceScoreValue?: number | null;
  description?: string | null;
  Description?: string | null;
  isCanceled?: boolean | null;
  IsCanceled?: boolean | null;
}

export interface SecretaryReservationFilters {
  consultantProfileId?: number | null;
  from?: string;
  to?: string;
  attendanceConfirmationStatus?: number | null;
  onlyWaitingForSecretaryReview?: boolean;
  includeCanceled?: boolean;
  pageNumber: number;
  pageSize: number;
}

export interface CompletePatientProfileRequest {
  reservationId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  passwordHash: string;
  avatarImageName?: string | null;
  gender: number;
  birthDate: string;
  nationalCode: string;
  address: string;
  emergencyPhoneNumber?: string | null;
  insuranceName?: string | null;
  notes?: string | null;
}

export interface CompletePatientProfileResponse {
  reservationId: number;
  patientUserId: string;
  patientProfileId: number;
  leadAssignmentId: number;
  consultantProfileId: number;
  reservationAt: string;
  patientName: string;
  patientPhoneNumber: string;
  isCompleteProfile: boolean;
  roleName: string;
}

export interface ReviewAttendanceRequest {
  reservationId: number;
  secretaryUserId: string;
  approved: boolean;
  note: string | null;
}

@Injectable({ providedIn: "root" })
export class SecretaryDashboardService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  completeProfile(
    payload: CompleteSecretaryProfileRequest,
  ): Observable<ApiCommandResponse<string>> {
    return this.http
      .post<ApiCommandResponse<string>>(
        `${this.apiBaseUrl}/Secretary`,
        payload,
        { headers: this.authHeaders() },
      )
      .pipe(this.ensureCommandSucceeded("تکمیل پروفایل منشی انجام نشد"));
  }

  getReservations(
    filters: SecretaryReservationFilters,
  ): Observable<PaginatedResponse<SecretaryReservation>> {
    return this.http
      .get<unknown>(`${this.apiBaseUrl}/Reservation/SecretaryReservations`, {
        headers: this.authHeaders(),
        params: this.toParams(filters),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse<SecretaryReservation>(
            response,
            filters,
          ),
        ),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(error, "دریافت رزروها انجام نشد"),
          ),
        ),
      );
  }

  getAttendanceReviews(
    pageNumber = 1,
    pageSize = 50,
  ): Observable<PaginatedResponse<SecretaryReservation>> {
    return this.getReservations({
      onlyWaitingForSecretaryReview: true,
      includeCanceled: false,
      pageNumber,
      pageSize,
    });
  }

  reviewAttendance(
    payload: ReviewAttendanceRequest,
  ): Observable<ApiCommandResponse> {
    return this.http
      .post<ApiCommandResponse>(
        `${this.apiBaseUrl}/Reservation/ReviewAttendance`,
        payload,
        { headers: this.authHeaders() },
      )
      .pipe(this.ensureCommandSucceeded("ثبت بررسی حضور انجام نشد"));
  }

  completePatientProfile(
    payload: CompletePatientProfileRequest,
  ): Observable<ApiCommandResponse<CompletePatientProfileResponse>> {
    return this.http
      .post<ApiCommandResponse<CompletePatientProfileResponse>>(
        `${this.apiBaseUrl}/Reservation/CompletePatientProfile`,
        payload,
        { headers: this.authHeaders() },
      )
      .pipe(this.ensureCommandSucceeded("تشکیل پرونده بیمار انجام نشد"));
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth.authToken();
    const baseHeaders: Record<string, string> = { Accept: "application/json" };
    if (token) baseHeaders["Authorization"] = `Bearer ${token}`;
    return new HttpHeaders(baseHeaders);
  }

  private toParams(source: object): HttpParams {
    let params = new HttpParams();

    Object.entries(source as Record<string, unknown>).forEach(
      ([key, value]) => {
        if (value === null || value === undefined || value === "") return;
        params = params.set(key, String(value));
      },
    );

    return params;
  }

  private ensureCommandSucceeded<T>(fallback: string) {
    return (source: Observable<ApiCommandResponse<T>>) =>
      source.pipe(
        map((response) => this.normalizeCommandResponse(response, fallback)),
        catchError((error) =>
          throwError(() => this.toUserFacingError(error, fallback)),
        ),
      );
  }

  private normalizeCommandResponse<T>(
    response: ApiCommandResponse<T>,
    fallback: string,
  ): ApiCommandResponse<T> {
    if (!response?.isSuccess) {
      throw new Error(response?.message || fallback);
    }

    return response;
  }

  private normalizePaginatedResponse<T>(
    response: unknown,
    filters: { pageNumber: number; pageSize: number },
  ): PaginatedResponse<T> {
    const source = this.unwrapResponseData(response);
    const items = this.readItems<T>(source);
    const totalCount =
      this.readNumber(source, "totalCount", "total", "count", "recordsTotal") ??
      this.readNumber(
        response,
        "totalCount",
        "total",
        "count",
        "recordsTotal",
      ) ??
      items.length;
    const pageSize =
      this.readNumber(source, "pageSize", "take", "limit") ??
      this.readNumber(response, "pageSize", "take", "limit") ??
      filters.pageSize;
    const pageNumber =
      this.readNumber(source, "pageNumber", "page", "currentPage") ??
      this.readNumber(response, "pageNumber", "page", "currentPage") ??
      filters.pageNumber;
    const totalPages =
      this.readNumber(source, "totalPages", "pages", "pageCount") ??
      this.readNumber(response, "totalPages", "pages", "pageCount") ??
      Math.ceil(totalCount / Math.max(1, pageSize));

    return {
      items,
      totalCount,
      pageNumber,
      pageSize,
      totalPages: Math.max(1, totalPages),
      raw: response,
      source,
    };
  }

  private unwrapResponseData(response: unknown): unknown {
    if (Array.isArray(response)) return response;
    if (!this.isRecord(response)) return response;

    const payload = this.readValue(
      response,
      "data",
      "result",
      "value",
      "payload",
    );
    if (payload !== null && payload !== undefined) {
      return payload;
    }

    return response;
  }

  private readItems<T>(source: unknown): T[] {
    if (Array.isArray(source)) return source as T[];
    if (!this.isRecord(source)) return [];

    for (const key of [
      "items",
      "data",
      "result",
      "values",
      "records",
      "list",
    ]) {
      const value = this.readValue(source, key);
      if (Array.isArray(value)) return value as T[];
      const nestedItems = this.readItems<T>(value);
      if (nestedItems.length) return nestedItems;
    }

    const firstArray = Object.values(source).find(Array.isArray);
    return Array.isArray(firstArray) ? (firstArray as T[]) : [];
  }

  private readNumber(source: unknown, ...keys: string[]): number | null {
    if (!this.isRecord(source)) return null;

    for (const key of keys) {
      const value = this.readValue(source, key);
      if (value === null || value === undefined || value === "") continue;
      const numeric = typeof value === "number" ? value : Number(value);
      if (Number.isFinite(numeric)) return numeric;
    }

    return null;
  }

  private readValue(source: unknown, ...keys: string[]): unknown {
    if (!this.isRecord(source)) return null;

    for (const key of keys) {
      if (key in source) return source[key];
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
      if (pascalKey in source) return source[pascalKey];
    }

    return null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  private toUserFacingError(error: unknown, fallback: string): Error {
    if (error instanceof Error && error.message) return error;
    if (typeof error === "object" && error !== null && "error" in error) {
      const httpError = error as {
        error?: { message?: string } | string;
        message?: string;
      };
      if (typeof httpError.error === "object" && httpError.error?.message)
        return new Error(httpError.error.message);
      if (typeof httpError.error === "string" && httpError.error)
        return new Error(httpError.error);
      if (httpError.message) return new Error(httpError.message);
    }

    return new Error(fallback);
  }
}
