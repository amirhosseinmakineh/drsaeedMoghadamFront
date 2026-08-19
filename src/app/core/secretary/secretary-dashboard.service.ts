import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  Observable,
  catchError,
  forkJoin,
  map,
  of,
  switchMap,
  throwError,
} from "rxjs";
import { AuthService } from "../auth/auth.service";
import { environment } from "../../../environments/environment";
import { AttendanceConfirmationStatus } from "../reservation/reservation-attendance";
import { ReservationDto } from "../reservation/reservation.model";

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

export interface SecretaryReservation extends ReservationDto {
  canManage?: boolean;
  CanManage?: boolean;
  canEdit?: boolean;
  CanEdit?: boolean;
  canUpdateSecretaryAnnouncement?: boolean;
  CanUpdateSecretaryAnnouncement?: boolean;
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
  attendanceConfirmationStatus?: AttendanceConfirmationStatus | null;
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
  secretaryAnnouncement?: string | null;
  SecretaryAnnouncement?: string | null;
  secretaryAnnouncementUpdatedAt?: string | null;
  SecretaryAnnouncementUpdatedAt?: string | null;
  secretaryAnnouncementUserId?: string | null;
  SecretaryAnnouncementUserId?: string | null;
  isAttendanceScoreApplied?: boolean | null;
  IsAttendanceScoreApplied?: boolean | null;
  attendanceScoreValue?: number | null;
  AttendanceScoreValue?: number | null;
  description?: string | null;
  Description?: string | null;
  isCanceled?: boolean | null;
  IsCanceled?: boolean | null;
  secretaryReservationReviewStatus?: number | null;
  SecretaryReservationReviewStatus?: number | null;
  isConfirmedWithPatient?: boolean | null;
  IsConfirmedWithPatient?: boolean | null;
  followUpAt?: string | null;
  FollowUpAt?: string | null;
  reminderAt?: string | null;
  ReminderAt?: string | null;
  needsFollowUp?: boolean | null;
  NeedsFollowUp?: boolean | null;
  followUpPriority?: number | null;
  FollowUpPriority?: number | null;
  lastActivityAt?: string | null;
  LastActivityAt?: string | null;
  reservationRequestStatus?: number | null;
  requestedServiceName?: string | null;
  consultantReport?: string | null;
  requestCreatedAt?: string | null;
  lastChangedByName?: string | null;
  priority?: number | null;
  callCount?: number | null;
  rejectionReason?: string | null;
  cancellationReason?: string | null;
  visitResultStatus?: number | null;
  initialReservationAt?: string | null;
  doctorName?: string | null;
  roomName?: string | null;
  lastFollowUpAt?: string | null;
  lastContactResult?: string | null;
  secretaryAnnouncementStatus?: SecretaryAnnouncementStatus | null;
  SecretaryAnnouncementStatus?: SecretaryAnnouncementStatus | null;
  secretaryAnnouncementDescription?: string | null;
  SecretaryAnnouncementDescription?: string | null;
}

export type SecretaryAnnouncementStatus =
  | "NotCalled"
  | "NoAnswer"
  | "Confirmed"
  | "CancelledByPatient"
  | "RescheduleRequested"
  | "CallAgain";

export interface SecretaryDashboardSummary {
  requiresCall: number;
  confirmed: number;
  noAnswer: number;
  cancelled: number;
}

export interface SecretaryAnnouncementRequest {
  reservationId: number;
  status: SecretaryAnnouncementStatus;
  description: string | null;
}


export interface SecretaryReservationFilters {
  consultantProfileId?: number | null;
  from?: string;
  to?: string;
  searchText?: string;
  attendanceConfirmationStatus?: AttendanceConfirmationStatus | null;
  onlyWaitingForSecretaryReview?: boolean;
  onlyPendingReservationReview?: boolean;
  reservationReviewStatus?: number | null;
  visitResultStatus?: number | null;
  reservationStatus?: string | null;
  secretaryAnnouncementStatus?: SecretaryAnnouncementStatus | null;
  reservationDate?: string;
  followUpDueOn?: string;
  isConfirmedWithPatient?: boolean | null;
  consultantName?: string;
  sortDirection?: "asc" | "desc";
  onlyDue?: boolean;
  includeCanceled?: boolean;
  pageNumber: number;
  pageSize: number;
}

export interface ReviewAttendanceRequest {
  reservationId: number;
  secretaryUserId: string;
  approved: boolean;
  note: string | null;
}

export interface UpdateSecretaryAnnouncementRequest {
  reservationId: number;
  secretaryUserId: string;
  secretaryAnnouncement: string | null;
}

export interface SecretaryReservationActivity {
  activityId: number;
  activityType: string;
  description: string;
  createdAt: string;
  actorDisplayName?: string | null;
  previousValue?: string | null;
  newValue?: string | null;
}

export interface RescheduleReservationRequest {
  reservationAt: string;
  reason?: string | null;
  note?: string | null;
}

export interface RejectReservationRequest {
  reasonCode: number;
  reason: string;
}

@Injectable({ providedIn: "root" })
export class SecretaryDashboardService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  canManageReservation(reservation: SecretaryReservation): boolean {
    return this.backendPermission(
      reservation.canManage ??
        reservation.CanManage ??
        reservation.canEdit ??
        reservation.CanEdit,
    );
  }

  canUpdateAnnouncement(reservation: SecretaryReservation): boolean {
    return this.backendPermission(
      reservation.canUpdateSecretaryAnnouncement ??
        reservation.CanUpdateSecretaryAnnouncement ??
        reservation.canManage ??
        reservation.CanManage ??
        reservation.canEdit ??
        reservation.CanEdit,
    );
  }

  completeProfile(
    payload: CompleteSecretaryProfileRequest,
  ): Observable<ApiCommandResponse<string>> {
    return this.http
      .post<
        ApiCommandResponse<string>
      >(`${this.apiBaseUrl}/Secretary`, payload, { headers: this.authHeaders() })
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
      onlyDue: true,
      includeCanceled: false,
      pageNumber,
      pageSize,
    });
  }

  getDashboardReservations(): Observable<SecretaryReservation[]> {
    const pageSize = 100;
    const baseFilters: SecretaryReservationFilters = {
      includeCanceled: true,
      pageNumber: 1,
      pageSize,
    };

    return this.getReservations(baseFilters).pipe(
      switchMap((firstPage) => {
        if (firstPage.totalPages <= 1) return of(firstPage.items);

        const remainingPages = Array.from(
          { length: firstPage.totalPages - 1 },
          (_, index) =>
            this.getReservations({
              ...baseFilters,
              pageNumber: index + 2,
            }),
        );

        return forkJoin(remainingPages).pipe(
          map((pages) => [
            ...firstPage.items,
            ...pages.flatMap((page) => page.items),
          ]),
        );
      }),
    );
  }

  getDashboardSummary(): Observable<SecretaryDashboardSummary> {
    return this.http
      .get<unknown>(`${this.apiBaseUrl}/secretary/dashboard/summary`, {
        headers: this.authHeaders(),
      })
      .pipe(
        map((response) => {
          const root = response as Record<string, unknown>;
          const value = (root?.["data"] ?? root) as Record<string, unknown>;
          const number = (...keys: string[]): number => {
            const found = keys.map((key) => value?.[key]).find((item) => item != null);
            const parsed = Number(found);
            return Number.isFinite(parsed) ? parsed : 0;
          };
          return {
            requiresCall: number("requiresCall", "RequiresCall", "needsCall", "NeedsCall"),
            confirmed: number("confirmed", "Confirmed"),
            noAnswer: number("noAnswer", "NoAnswer"),
            cancelled: number("cancelled", "Cancelled", "canceled", "Canceled"),
          };
        }),
        catchError((error) =>
          throwError(() => this.toUserFacingError(error, "دریافت خلاصه تماس‌ها انجام نشد")),
        ),
      );
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

  updateSecretaryAnnouncement(
    payload:
      | SecretaryAnnouncementRequest
      | UpdateSecretaryAnnouncementRequest,
  ): Observable<ApiCommandResponse> {
    return this.http
      .put<ApiCommandResponse>(
        `${this.apiBaseUrl}/Reservation/SecretaryAnnouncement`,
        payload,
        { headers: this.authHeaders() },
      )
      .pipe(this.ensureCommandSucceeded("ثبت اعلام منشی انجام نشد"));
  }

  confirmReservation(
    reservationId: number,
    note: string | null,
  ): Observable<ApiCommandResponse> {
    return this.postReservationCommand(
      reservationId,
      "secretary-confirm",
      { note },
      "تایید رزرو انجام نشد",
    );
  }

  rescheduleReservation(
    reservationId: number,
    payload: RescheduleReservationRequest,
  ): Observable<ApiCommandResponse> {
    return this.postReservationCommand(
      reservationId,
      "secretary-reschedule",
      payload,
      "تغییر زمان رزرو انجام نشد",
    );
  }

  rejectReservation(
    reservationId: number,
    payload: RejectReservationRequest,
  ): Observable<ApiCommandResponse> {
    return this.postReservationCommand(
      reservationId,
      "secretary-reject",
      payload,
      "رد درخواست رزرو انجام نشد",
    );
  }

  addReservationNote(
    reservationId: number,
    note: string,
  ): Observable<ApiCommandResponse> {
    return this.postReservationCommand(
      reservationId,
      "notes",
      { note },
      "ثبت یادداشت انجام نشد",
    );
  }

  logPatientContact(
    reservationId: number,
    result: string,
    note: string | null,
  ): Observable<ApiCommandResponse> {
    return this.postReservationCommand(
      reservationId,
      "contacts",
      { result, note },
      "ثبت تماس انجام نشد",
    );
  }

  createFollowUp(
    reservationId: number,
    scheduledAt: string,
    reason: string,
  ): Observable<ApiCommandResponse> {
    return this.postReservationCommand(
      reservationId,
      "follow-ups",
      { scheduledAt, reason },
      "ثبت پیگیری انجام نشد",
    );
  }

  recordVisitResult(
    reservationId: number,
    visitResultStatus: number,
    note: string | null,
  ): Observable<ApiCommandResponse> {
    return this.postReservationCommand(
      reservationId,
      "visit-result",
      { visitResultStatus, note },
      "ثبت نتیجه مراجعه انجام نشد",
    );
  }

  getReservationHistory(
    reservationId: number,
  ): Observable<SecretaryReservationActivity[]> {
    return this.http
      .get<
        ApiCommandResponse<SecretaryReservationActivity[]>
      >(`${this.apiBaseUrl}/Reservation/${reservationId}/history`, { headers: this.authHeaders() })
      .pipe(
        map((response) => {
          if (!response?.isSuccess) {
            throw new Error(response?.message || "دریافت تاریخچه انجام نشد");
          }
          return Array.isArray(response.data) ? response.data : [];
        }),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(error, "دریافت تاریخچه انجام نشد"),
          ),
        ),
      );
  }

  private postReservationCommand(
    reservationId: number,
    action: string,
    payload: object,
    fallback: string,
  ): Observable<ApiCommandResponse> {
    return this.http
      .post<ApiCommandResponse>(
        `${this.apiBaseUrl}/Reservation/${reservationId}/${action}`,
        payload,
        { headers: this.authHeaders() },
      )
      .pipe(this.ensureCommandSucceeded(fallback));
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
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 403
    ) {
      return new Error("شما در این روز دسترسی مدیریت رزرو ندارید.");
    }
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

  private backendPermission(permission: boolean | null | undefined): boolean {
    if (typeof permission === "boolean") return permission;

    const secretaryType = this.auth.user()?.secretaryType?.toLowerCase();
    if (secretaryType === "assistant") return false;
    return true;
  }
}
