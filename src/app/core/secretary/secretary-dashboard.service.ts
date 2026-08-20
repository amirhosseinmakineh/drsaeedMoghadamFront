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

export type SecretaryPermission =
  | "ViewReservations"
  | "EditReservations"
  | "ConfirmAttendance"
  | "SecretaryAnnouncement"
  | "ViewPatients"
  | "CreateReservation"
  | "CancelReservation";

export interface SecretaryAccessResult {
  isSecretary: boolean;
  hasFullAccess: boolean;
  allowedDays: string[];
  permissions: SecretaryPermission[];
}

export interface SecretaryReservation extends ReservationDto {
  reservationAtPersian?: string | null;
  ReservationAtPersian?: string | null;
  createdAt?: string | null;
  CreatedAt?: string | null;
  createdAtPersian?: string | null;
  CreatedAtPersian?: string | null;
  reservationType?: ReservationType | null;
  ReservationType?: ReservationType | null;
  patientReceivedService?: boolean | null;
  PatientReceivedService?: boolean | null;
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
  secretaryReviewedAtPersian?: string | null;
  SecretaryReviewedAtPersian?: string | null;
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
  afterSalesServices: number;
}

export enum ReservationType {
  Regular = 1,
  AfterSalesService = 2,
}

export interface SecretaryAnnouncementRequest {
  reservationId: number;
  /**
   * Kept optional for compatibility with older API typings. The backend command
   * ignores this JSON field and resolves the acting secretary from JWT claims.
   */
  secretaryUserId?: string;
  status: SecretaryAnnouncementStatus;
  description: string | null;
}


export interface SecretaryReservationFilters {
  consultantProfileId?: number | null;
  search?: string;
  consultantName?: string;
  fromDate?: string;
  toDate?: string;
  attendanceStatus?: AttendanceConfirmationStatus | null;
  secretaryAnnouncementStatus?: SecretaryAnnouncementStatus | null;
  reservationStatus?: string | null;
  reservationType?: ReservationType | null;
  includeCanceled?: boolean;
  sortDirection?: "asc" | "desc";
  pageNumber: number;
  pageSize: number;
}

export interface ReviewAttendanceRequest {
  reservationId: number;
  patientReceivedService: boolean;
  note: string | null;
}

export interface CreateSecretaryReservationRequest {
  leadAssignmentId: number;
  consultantProfileId: number;
  reservationAt: string;
  description: string | null;
  reservationType: ReservationType;
  dentalServices: number[];
}

export interface SecretaryPatientOption {
  id?: number;
  Id?: number;
  leadAssignmentId?: number;
  LeadAssignmentId?: number;
  fullName?: string | null;
  FullName?: string | null;
  firstName?: string | null;
  FirstName?: string | null;
  lastName?: string | null;
  LastName?: string | null;
  phoneNumber?: string | null;
  PhoneNumber?: string | null;
  userName?: string | null;
  UserName?: string | null;
  user?: Record<string, unknown> | null;
  User?: Record<string, unknown> | null;
  lead?: Record<string, unknown> | null;
  Lead?: Record<string, unknown> | null;
  consultantProfileId?: number | null;
  ConsultantProfileId?: number | null;
  consultantFullName?: string | null;
  ConsultantFullName?: string | null;
  consultantPhoneNumber?: string | null;
  ConsultantPhoneNumber?: string | null;
  consultant?: Record<string, unknown> | null;
  Consultant?: Record<string, unknown> | null;
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

export interface UpdateSecretaryReservationTimeRequest {
  reservationAt: string;
  appointmentDateTime?: string;
  dentalServices?: number[] | null;
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

  getAccess(): Observable<SecretaryAccessResult> {
    return this.http
      .get<unknown>(`${this.apiBaseUrl}/Secretary/access`, { headers: this.authHeaders() })
      .pipe(map((response) => {
        const envelope = response as { data?: unknown; Data?: unknown };
        const value = (envelope.data ?? envelope.Data ?? response) as Record<string, unknown>;
        const list = (camel: string, pascal: string): string[] => {
          const raw = value[camel] ?? value[pascal];
          return Array.isArray(raw) ? raw.map(String) : [];
        };
        return {
          isSecretary: Boolean(value["isSecretary"] ?? value["IsSecretary"]),
          hasFullAccess: Boolean(value["hasFullAccess"] ?? value["HasFullAccess"]),
          allowedDays: list("allowedDays", "AllowedDays"),
          permissions: list("permissions", "Permissions") as SecretaryPermission[],
        };
      }));
  }

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
            afterSalesServices: number("afterSalesServices", "AfterSalesServices"),
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

  createReservation(
    payload: CreateSecretaryReservationRequest,
  ): Observable<ApiCommandResponse<SecretaryReservation>> {
    return this.http
      .post<ApiCommandResponse<SecretaryReservation>>(
        `${this.apiBaseUrl}/Reservation`,
        payload,
        { headers: this.authHeaders() },
      )
      .pipe(this.ensureCommandSucceeded("ثبت رزرو انجام نشد"));
  }

  getPatientOptions(): Observable<SecretaryPatientOption[]> {
    const filters = { pageNumber: 1, pageSize: 500 };
    return this.http
      .get<unknown>(`${this.apiBaseUrl}/LeadAssignment`, {
        headers: this.authHeaders(),
        params: this.toParams(filters),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse<SecretaryPatientOption>(
            response,
            filters,
          ).items,
        ),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(error, "دریافت فهرست بیماران انجام نشد"),
          ),
        ),
      );
  }

  updateSecretaryAnnouncement(
    payload: SecretaryAnnouncementRequest,
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

  updateReservationTime(
    reservationId: number,
    reservationAt: string,
    dentalServices?: number[] | null,
  ): Observable<ApiCommandResponse<SecretaryReservation>> {
    const payload: UpdateSecretaryReservationTimeRequest = { reservationAt, dentalServices };
    return this.http
      .post<ApiCommandResponse<SecretaryReservation>>(
        `${this.apiBaseUrl}/Reservation/SecretaryReservations/${reservationId}/time`,
        payload,
        { headers: this.authHeaders() },
      )
      .pipe(
        catchError((error) => {
          if (error?.status === 401) {
            return throwError(() => new Error("نشست کاربر منقضی شده است"));
          }
          if (error?.status === 403) {
            return throwError(() => new Error("دسترسی تغییر رزرو را ندارید"));
          }
          return throwError(() => error);
        }),
      )
      .pipe(this.ensureCommandSucceeded("تغییر زمان رزرو انجام نشد"));
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
