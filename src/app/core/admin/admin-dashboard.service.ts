import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, forkJoin, from, map, switchMap, throwError } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { environment } from "../../../environments/environment";
import { ensureCsvBlob } from "../../utils/file-download.util";

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

export interface AdminUser {
  id: string;
  Id?: string;
  firstName: string;
  FirstName?: string;
  lastName: string;
  LastName?: string;
  phoneNumber: string;
  PhoneNumber?: string;
  roleName: string;
  RoleName?: string;
  isActive: boolean;
  IsActive?: boolean;
  isCompleteProfile?: boolean;
  IsCompleteProfile?: boolean;
  lastSeenAt?: string | null;
  LastSeenAt?: string | null;
  createdAt?: string;
  CreatedAt?: string;
  gender?: number;
  Gender?: number;
  avatarImageName?: string | null;
  AvatarImageName?: string | null;
  profileId?: number;
  ProfileId?: number;
  consultantProfileId?: number;
  ConsultantProfileId?: number;
  consultantIsOnline?: boolean | null;
  ConsultantIsOnline?: boolean | null;
  consultantIsAvailable?: boolean | null;
  ConsultantIsAvailable?: boolean | null;
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
  Id?: string;
  firstName: string;
  FirstName?: string;
  lastName: string;
  LastName?: string;
  phoneNumber: string;
  PhoneNumber?: string;
  profileId: number;
  ProfileId?: number;
  lastSeenAt?: string | null;
  LastSeenAt?: string | null;
  consultantIsOnline?: boolean | null;
  ConsultantIsOnline?: boolean | null;
  consultantIsAvailable?: boolean | null;
  ConsultantIsAvailable?: boolean | null;
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

export interface ConsultantLimitUpdate {
  limitNumber?: number | null;
  LimitNumber?: number | null;
  effectiveDailyLimit: number;
  EffectiveDailyLimit?: number;
  todayPickupCount: number;
  TodayPickupCount?: number;
}

export interface AdminConsultantProfile {
  profileId: number;
  ProfileId?: number;
  userId: string;
  UserId?: string;
  firstName: string;
  FirstName?: string;
  lastName: string;
  LastName?: string;
  phoneNumber: string;
  PhoneNumber?: string;
  userIsActive: boolean;
  UserIsActive?: boolean;
  userIsCompleteProfile: boolean;
  UserIsCompleteProfile?: boolean;
  nationalCode: string;
  NationalCode?: string;
  address: string;
  Address?: string;
  isAvailable: boolean;
  IsAvailable?: boolean;
  isOnline: boolean;
  IsOnline?: boolean;
  isCompleteProfile: boolean;
  IsCompleteProfile?: boolean;
  workStartTime?: string | null;
  WorkStartTime?: string | null;
  workEndTime?: string | null;
  WorkEndTime?: string | null;
  notes?: string | null;
  Notes?: string | null;
  lastOnlineAt?: string | null;
  LastOnlineAt?: string | null;
  lastOfflineAt?: string | null;
  LastOfflineAt?: string | null;
  limitNumber?: number | null;
  LimitNumber?: number | null;
  effectiveDailyLimit: number;
  EffectiveDailyLimit?: number;
  todayPickupCount: number;
  TodayPickupCount?: number;
}

export interface AttendanceItem {
  id: number;
  attendanceDate: string;
  checkInTime: string;
  checkOutTime: string;
  status: number;
  description: string | null;
}

export interface UserPresenceOverviewItem {
  userId: string;
  UserId?: string;
  firstName: string;
  FirstName?: string;
  lastName: string;
  LastName?: string;
  phoneNumber: string;
  PhoneNumber?: string;
  roleName: string;
  RoleName?: string;
  isCurrentlyOnline: boolean;
  IsCurrentlyOnline?: boolean;
  lastSeenAtPersian?: string | null;
  LastSeenAtPersian?: string | null;
  consultantIsOnline?: boolean | null;
  ConsultantIsOnline?: boolean | null;
  consultantIsAvailable?: boolean | null;
  ConsultantIsAvailable?: boolean | null;
  selectedDatePersian?: string;
  SelectedDatePersian?: string;
  firstLoginAtPersian?: string | null;
  FirstLoginAtPersian?: string | null;
  lastLogoutAtPersian?: string | null;
  LastLogoutAtPersian?: string | null;
  firstOnlineAtPersian?: string | null;
  FirstOnlineAtPersian?: string | null;
  lastOfflineAtPersian?: string | null;
  LastOfflineAtPersian?: string | null;
  firstCheckInAtPersian?: string | null;
  FirstCheckInAtPersian?: string | null;
  lastCheckOutAtPersian?: string | null;
  LastCheckOutAtPersian?: string | null;
  eventCountForDay?: number;
  EventCountForDay?: number;
}

export interface UserPresenceEventItem {
  id: number;
  Id?: number;
  userId: string;
  UserId?: string;
  firstName: string;
  FirstName?: string;
  lastName: string;
  LastName?: string;
  phoneNumber: string;
  PhoneNumber?: string;
  roleName: string;
  RoleName?: string;
  eventType: number;
  EventType?: number;
  eventTypeLabel: string;
  EventTypeLabel?: string;
  occurredAtPersian: string;
  OccurredAtPersian?: string;
  description?: string | null;
  Description?: string | null;
}

export interface UserPresenceFilters {
  date: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roleName?: string;
  isCurrentlyOnline?: boolean | null;
  search?: string;
  eventType?: number | null;
  userId?: string;
  pageNumber: number;
  pageSize: number;
}

export interface LeadAssignmentItem {
  id?: number;
  Id?: number;
  leadAssignmentId?: number;
  LeadAssignmentId?: number;
  userName?: string | null;
  UserName?: string | null;
  fullName?: string | null;
  FullName?: string | null;
  firstName?: string | null;
  FirstName?: string | null;
  lastName?: string | null;
  LastName?: string | null;
  phoneNumber?: string | null;
  PhoneNumber?: string | null;
  mobile?: string | null;
  Mobile?: string | null;
  userPhoneNumber?: string | null;
  UserPhoneNumber?: string | null;
  leadPhoneNumber?: string | null;
  LeadPhoneNumber?: string | null;
  leadAssignmentState?: number | null;
  LeadAssignmentState?: number | null;
  state?: number | null;
  State?: number | null;
  status?: number | null;
  Status?: number | null;
  leadAssignmentType?: number | null;
  LeadAssignmentType?: number | null;
  type?: number | null;
  Type?: number | null;
  assignmentType?: number | null;
  AssignmentType?: number | null;
  user?: LeadPerson | null;
  User?: LeadPerson | null;
  lead?: LeadPerson | null;
  Lead?: LeadPerson | null;
}

export interface LeadCallReportExportFilters {
  from?: string;
  to?: string;
}

export interface LeadFilters {
  profileId?: number;
  leadAssignmentState?: number | null;
  leadAssignmentType?: number | null;
  pageNumber: number;
  pageSize: number;
}

export interface SecretaryReservation {
  id?: number;
  Id?: number;
  leadAssignmentId?: number;
  LeadAssignmentId?: number;
  consultantProfileId?: number;
  ConsultantProfileId?: number;
  consultantUserId?: string | null;
  ConsultantUserId?: string | null;
  consultantFullName?: string | null;
  ConsultantFullName?: string | null;
  patientUserId?: string | null;
  PatientUserId?: string | null;
  requiresPatientProfile?: boolean;
  RequiresPatientProfile?: boolean;
  reservationAt?: string | null;
  ReservationAt?: string | null;
  patientName?: string | null;
  PatientName?: string | null;
  patientPhoneNumber?: string | null;
  PatientPhoneNumber?: string | null;
  secondaryPhoneNumber?: string | null;
  SecondaryPhoneNumber?: string | null;
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
  consultantAttendanceConfirmedAt?: string | null;
  ConsultantAttendanceConfirmedAt?: string | null;
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
  attendanceScoreAppliedAt?: string | null;
  AttendanceScoreAppliedAt?: string | null;
  description?: string | null;
  Description?: string | null;
  isCanceled?: boolean;
  IsCanceled?: boolean;
}

export interface SecretaryReservationFilters {
  consultantProfileId?: number | null;
  date?: string;
  from?: string;
  to?: string;
  searchText?: string;
  attendanceConfirmationStatus?: number | null;
  onlyWaitingForSecretaryReview?: boolean;
  onlyConsultantAttendanceConfirmed?: boolean;
  onlyDue?: boolean;
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

export interface ReservationAttendanceReview {
  id?: number;
  Id?: number;
  reservationId?: number;
  ReservationId?: number;
  patientName?: string | null;
  PatientName?: string | null;
  patientPhoneNumber?: string | null;
  PatientPhoneNumber?: string | null;
  patientCity?: string | null;
  PatientCity?: string | null;
  consultantName?: string | null;
  ConsultantName?: string | null;
  reservationAt?: string | null;
  ReservationAt?: string | null;
  attendanceProbabilityPercent?: number | null;
  AttendanceProbabilityPercent?: number | null;
  attendancePrediction?: string | null;
  AttendancePrediction?: string | null;
  attendanceConfirmationStatus?: number | null;
  AttendanceConfirmationStatus?: number | null;
  consultantAttendanceNote?: string | null;
  ConsultantAttendanceNote?: string | null;
}

export interface ReviewAttendanceRequest {
  reservationId: number;
  secretaryUserId: string;
  approved: boolean;
  note: string | null;
}

interface LeadPerson {
  userName?: string | null;
  UserName?: string | null;
  fullName?: string | null;
  FullName?: string | null;
  name?: string | null;
  Name?: string | null;
  firstName?: string | null;
  FirstName?: string | null;
  lastName?: string | null;
  LastName?: string | null;
  phoneNumber?: string | null;
  PhoneNumber?: string | null;
  mobile?: string | null;
  Mobile?: string | null;
}

@Injectable({ providedIn: "root" })
export class AdminDashboardService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getUsers(filters: UserFilters): Observable<PaginatedResponse<AdminUser>> {
    return this.http
      .get<unknown>(`${this.apiBaseUrl}/User`, {
        headers: this.authHeaders(),
        params: this.toParams(filters),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse<AdminUser>(response, filters),
        ),
      );
  }

  addUser(payload: SaveUserRequest): Observable<ApiCommandResponse> {
    return this.http
      .post<ApiCommandResponse>(`${this.apiBaseUrl}/User`, payload, {
        headers: this.authHeaders(),
      })
      .pipe(this.ensureCommandSucceeded("ثبت کاربر انجام نشد"));
  }

  updateUser(payload: SaveUserRequest): Observable<ApiCommandResponse> {
    return this.http
      .put<ApiCommandResponse>(`${this.apiBaseUrl}/User`, payload, {
        headers: this.authHeaders(),
      })
      .pipe(this.ensureCommandSucceeded("ویرایش کاربر انجام نشد"));
  }

  deleteUser(userId: string): Observable<ApiCommandResponse<boolean>> {
    return this.http
      .delete<ApiCommandResponse<boolean>>(`${this.apiBaseUrl}/User`, {
        headers: this.authHeaders(),
        params: this.toParams({ userId }),
      })
      .pipe(this.ensureCommandSucceeded("حذف کاربر انجام نشد"));
  }

  getConsultants(
    filters: ConsultantFilters,
  ): Observable<PaginatedResponse<Consultant>> {
    const userFilters: UserFilters = {
      firstName: filters.firstName,
      lastName: filters.lastName,
      phoneNumber: filters.phoneNumber,
      roleName: "Consultant",
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
    };

    return forkJoin({
      users: this.getUsers(userFilters),
      profiles: this.fetchConsultantProfiles(),
    }).pipe(
      map(({ users, profiles }) => ({
        items: this.mergeConsultantsFromUsers(users.items, profiles.items),
        totalCount: users.totalCount,
        pageNumber: users.pageNumber,
        pageSize: users.pageSize,
        totalPages: users.totalPages,
        raw: { users: users.raw, profiles: profiles.raw },
        source: users.source,
      })),
    );
  }

  private fetchConsultantProfiles(): Observable<PaginatedResponse<Consultant>> {
    return this.http
      .get<unknown>(`${this.apiBaseUrl}/Consultant/GetConsultants`, {
        headers: this.authHeaders(),
        params: this.toParams({ pageNumber: 1, pageSize: 500 }),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse<Consultant>(response, {
            pageNumber: 1,
            pageSize: 500,
          }),
        ),
      );
  }

  private mergeConsultantsFromUsers(
    users: AdminUser[],
    profiles: Consultant[],
  ): Consultant[] {
    const profileByUserId = new Map<string, Consultant>();
    const profileByPhone = new Map<string, Consultant>();

    profiles.forEach((profile) => {
      const userId = profile.id || profile.Id || "";
      const phone = profile.phoneNumber || profile.PhoneNumber || "";
      if (userId) profileByUserId.set(userId, profile);
      if (phone) profileByPhone.set(phone, profile);
    });

    return users.map((user) => {
      const userId = user.id || user.Id || "";
      const phone = user.phoneNumber || user.PhoneNumber || "";
      const profile = profileByUserId.get(userId) ?? profileByPhone.get(phone);

      return {
        id: userId,
        firstName: user.firstName || user.FirstName || "",
        lastName: user.lastName || user.LastName || "",
        phoneNumber: phone,
        profileId:
          user.consultantProfileId ??
          user.ConsultantProfileId ??
          profile?.profileId ??
          profile?.ProfileId ??
          user.profileId ??
          user.ProfileId ??
          0,
        consultantIsOnline:
          user.consultantIsOnline ??
          user.ConsultantIsOnline ??
          profile?.consultantIsOnline ??
          null,
        consultantIsAvailable:
          user.consultantIsAvailable ??
          user.ConsultantIsAvailable ??
          null,
        lastSeenAt: user.lastSeenAt ?? user.LastSeenAt ?? null,
        attendanceResponse: profile?.attendanceResponse,
        scoreLogResponse: profile?.scoreLogResponse,
        leadsAssignmentItemsResponse: profile?.leadsAssignmentItemsResponse,
      };
    });
  }

  getConsultantProfile(profileId: number): Observable<AdminConsultantProfile> {
    return this.http
      .get<unknown>(`${this.apiBaseUrl}/admin/consultants/${profileId}`, {
        headers: this.authHeaders(),
      })
      .pipe(
        map((response) => this.normalizeConsultantProfile(response)),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(error, "دریافت پروفایل مشاور انجام نشد"),
          ),
        ),
      );
  }

  updateConsultantLimit(
    profileId: number,
    limitNumber: number | null,
  ): Observable<ApiCommandResponse<ConsultantLimitUpdate>> {
    return this.http
      .patch<ApiCommandResponse<ConsultantLimitUpdate>>(
        `${this.apiBaseUrl}/admin/consultants/${profileId}/limit`,
        { limitNumber },
        { headers: this.authHeaders() },
      )
      .pipe(
        map((response) => this.normalizeLimitUpdateResponse(response)),
        this.ensureCommandSucceeded("ذخیره محدودیت دریافت شماره انجام نشد"),
      );
  }

  private normalizeLimitUpdateResponse(
    response: ApiCommandResponse<ConsultantLimitUpdate>,
  ): ApiCommandResponse<ConsultantLimitUpdate> {
    const normalized = this.normalizeCommandResponse(
      response,
      "ذخیره محدودیت دریافت شماره انجام نشد",
    );
    const source = this.unwrapResponseData(normalized);
    const record = this.isRecord(source) ? source : {};

    return {
      ...normalized,
      data: {
        limitNumber: this.readNumber(record, "limitNumber", "LimitNumber"),
        effectiveDailyLimit:
          this.readNumber(record, "effectiveDailyLimit", "EffectiveDailyLimit") ??
          10,
        todayPickupCount:
          this.readNumber(record, "todayPickupCount", "TodayPickupCount") ?? 0,
      },
    };
  }

  private normalizeConsultantProfile(response: unknown): AdminConsultantProfile {
    const source = this.unwrapResponseData(response);
    const record = this.isRecord(source) ? source : {};

    return {
      profileId:
        this.readNumber(record, "profileId", "ProfileId") ?? 0,
      userId: String(this.readValue(record, "userId", "UserId") ?? ""),
      firstName: String(this.readValue(record, "firstName", "FirstName") ?? ""),
      lastName: String(this.readValue(record, "lastName", "LastName") ?? ""),
      phoneNumber: String(
        this.readValue(record, "phoneNumber", "PhoneNumber") ?? "",
      ),
      userIsActive:
        this.readBoolean(record, "userIsActive", "UserIsActive") ?? false,
      userIsCompleteProfile:
        this.readBoolean(
          record,
          "userIsCompleteProfile",
          "UserIsCompleteProfile",
        ) ?? false,
      nationalCode: String(
        this.readValue(record, "nationalCode", "NationalCode") ?? "",
      ),
      address: String(this.readValue(record, "address", "Address") ?? ""),
      isAvailable:
        this.readBoolean(record, "isAvailable", "IsAvailable") ?? false,
      isOnline: this.readBoolean(record, "isOnline", "IsOnline") ?? false,
      isCompleteProfile:
        this.readBoolean(record, "isCompleteProfile", "IsCompleteProfile") ??
        false,
      workStartTime: this.readString(
        record,
        "workStartTime",
        "WorkStartTime",
      ),
      workEndTime: this.readString(record, "workEndTime", "WorkEndTime"),
      notes: this.readString(record, "notes", "Notes"),
      lastOnlineAt: this.readString(record, "lastOnlineAt", "LastOnlineAt"),
      lastOfflineAt: this.readString(record, "lastOfflineAt", "LastOfflineAt"),
      limitNumber: this.readNumber(record, "limitNumber", "LimitNumber"),
      effectiveDailyLimit:
        this.readNumber(record, "effectiveDailyLimit", "EffectiveDailyLimit") ??
        10,
      todayPickupCount:
        this.readNumber(record, "todayPickupCount", "TodayPickupCount") ?? 0,
    };
  }

  getAttendance(
    consultantProfileId: number,
    pageNumber = 1,
    pageSize = 10,
  ): Observable<PaginatedResponse<AttendanceItem>> {
    return this.http
      .get<unknown>(`${this.apiBaseUrl}/Attendance`, {
        headers: this.authHeaders(),
        params: this.toParams({ consultantProfileId, pageNumber, pageSize }),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse<AttendanceItem>(response, {
            pageNumber,
            pageSize,
          }),
        ),
      );
  }

  getUserPresenceOverview(
    filters: UserPresenceFilters,
  ): Observable<PaginatedResponse<UserPresenceOverviewItem>> {
    return this.http
      .get<unknown>(`${this.apiBaseUrl}/admin/presence/overview`, {
        headers: this.authHeaders(),
        params: this.toPresenceParams(filters),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse<UserPresenceOverviewItem>(response, filters),
        ),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(error, "دریافت وضعیت حضور کاربران انجام نشد"),
          ),
        ),
      );
  }

  getUserPresenceEvents(
    filters: UserPresenceFilters,
  ): Observable<PaginatedResponse<UserPresenceEventItem>> {
    return this.http
      .get<unknown>(`${this.apiBaseUrl}/admin/presence/events`, {
        headers: this.authHeaders(),
        params: this.toPresenceParams(filters),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse<UserPresenceEventItem>(response, filters),
        ),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(error, "دریافت رویدادهای حضور انجام نشد"),
          ),
        ),
      );
  }

  private toPresenceParams(filters: UserPresenceFilters): HttpParams {
    const params: Record<string, string | number | boolean> = {
      date: filters.date,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
    };

    if (filters.firstName) params["firstName"] = filters.firstName;
    if (filters.lastName) params["lastName"] = filters.lastName;
    if (filters.phoneNumber) params["phoneNumber"] = filters.phoneNumber;
    if (filters.roleName) params["roleName"] = filters.roleName;
    if (filters.search) params["search"] = filters.search;
    if (filters.userId) params["userId"] = filters.userId;
    if (filters.eventType != null) params["eventType"] = filters.eventType;
    if (filters.isCurrentlyOnline != null) {
      params["isCurrentlyOnline"] = filters.isCurrentlyOnline;
    }

    return this.toParams(params);
  }

  exportUsersReport(): Observable<Blob> {
    return this.exportCsvReport("users/export");
  }

  exportLeadsReport(): Observable<Blob> {
    return this.exportCsvReport("leads/export");
  }

  exportConsultantsReport(): Observable<Blob> {
    return this.exportCsvReport("consultants/export");
  }

  exportLeadCallReports(
    filters: LeadCallReportExportFilters,
  ): Observable<Blob> {
    return this.exportCsvReport("lead-call-reports/export", filters);
  }

  exportReservationsReport(
    filters: { from?: string; to?: string; consultantProfileId?: number } = {},
  ): Observable<Blob> {
    return this.exportCsvReport("reservations/export", filters);
  }

  exportConsultantAttendanceConfirmationsReport(
    filters: { from?: string; to?: string; consultantProfileId?: number } = {},
  ): Observable<Blob> {
    return this.exportCsvReport(
      "consultant-attendance-confirmations/export",
      filters,
    );
  }

  getConsultantAttendanceConfirmations(
    filters: SecretaryReservationFilters,
  ): Observable<PaginatedResponse<SecretaryReservation>> {
    return this.getSecretaryReservations({
      ...filters,
      onlyConsultantAttendanceConfirmed: true,
    });
  }

  private exportCsvReport(
    path: string,
    params?: object,
  ): Observable<Blob> {
    let headers = this.authHeaders();
    if (headers.has("Authorization")) {
      headers = headers.set("Accept", "text/csv");
    }

    return this.http
      .get(`${this.apiBaseUrl}/admin/reports/${path}`, {
        headers,
        ...(params ? { params: this.toParams(params) } : {}),
        responseType: "blob",
      })
      .pipe(
        switchMap((blob) => from(ensureCsvBlob(blob))),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(error, "دریافت گزارش انجام نشد"),
          ),
        ),
      );
  }

  getConsultantLeads(
    filters: LeadFilters,
  ): Observable<PaginatedResponse<LeadAssignmentItem>> {
    return this.http
      .get<unknown>(`${this.apiBaseUrl}/Consultant/GetLeads`, {
        headers: this.authHeaders(),
        params: this.toParams(filters),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse<LeadAssignmentItem>(
            response,
            filters,
          ),
        ),
      );
  }

  getSecretaryReservations(
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
      );
  }

  getReservationAttendanceReviews(
    pageNumber = 1,
    pageSize = 20,
  ): Observable<PaginatedResponse<SecretaryReservation>> {
    return this.getSecretaryReservations({
      onlyWaitingForSecretaryReview: true,
      pageNumber,
      pageSize,
    });
  }

  completePatientProfile(
    payload: CompletePatientProfileRequest,
  ): Observable<ApiCommandResponse<CompletePatientProfileResponse>> {
    return this.http
      .post<ApiCommandResponse<CompletePatientProfileResponse>>(
        `${this.apiBaseUrl}/Reservation/CompletePatientProfile`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("تشکیل پرونده بیمار انجام نشد"));
  }

  reviewAttendance(
    payload: ReviewAttendanceRequest,
  ): Observable<ApiCommandResponse> {
    return this.http
      .post<ApiCommandResponse>(
        `${this.apiBaseUrl}/Reservation/ReviewAttendance`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("ثبت بررسی حضور انجام نشد"));
  }

  getSystemLeads(
    filters: LeadFilters,
  ): Observable<PaginatedResponse<LeadAssignmentItem>> {
    return this.http
      .get<unknown>(`${this.apiBaseUrl}/LeadAssignment`, {
        headers: this.authHeaders(),
        params: this.toParams(filters),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse<LeadAssignmentItem>(
            response,
            filters,
          ),
        ),
      );
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth.authToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
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

    return this.finalizePaginatedResponse(
      {
        items,
        totalCount,
        pageNumber,
        pageSize,
        totalPages,
        raw: response,
        source,
      },
      filters,
    );
  }

  private finalizePaginatedResponse<T>(
    payload: {
      items: T[];
      totalCount: number;
      pageNumber: number | null;
      pageSize: number | null;
      totalPages: number | null;
      raw?: unknown;
      source?: unknown;
    },
    filters: { pageNumber: number; pageSize: number },
  ): PaginatedResponse<T> {
    const totalCount = Math.max(0, payload.totalCount);
    const pageSize =
      payload.pageSize && payload.pageSize > 0
        ? payload.pageSize
        : filters.pageSize;
    const pageNumber =
      payload.pageNumber && payload.pageNumber > 0
        ? payload.pageNumber
        : filters.pageNumber;
    const maxReasonablePages = Math.max(
      1,
      Math.ceil(totalCount / Math.max(1, pageSize)),
    );
    let totalPages =
      payload.totalPages ?? maxReasonablePages;

    if (
      !Number.isFinite(totalPages) ||
      totalPages >= 2_147_483_647 ||
      totalPages <= 0 ||
      totalPages > maxReasonablePages
    ) {
      totalPages = maxReasonablePages;
    }

    return {
      items: payload.items,
      totalCount,
      pageNumber,
      pageSize,
      totalPages: Math.max(1, totalPages),
      raw: payload.raw,
      source: payload.source,
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

  private normalizeCommandResponse<T>(
    response: ApiCommandResponse<T>,
    fallback: string,
  ): ApiCommandResponse<T> {
    const success = this.readBoolean(
      response,
      "isSuccess",
      "success",
      "succeeded",
    );
    const message =
      this.readString(response, "message", "error") ?? response.message ?? "";

    if (success === false) {
      throw new Error(message || fallback);
    }

    return {
      ...response,
      isSuccess: success ?? true,
      message,
      data: this.readValue(response, "data", "result", "value") as
        | T
        | undefined,
    };
  }

  private readBoolean(source: unknown, ...keys: string[]): boolean | null {
    if (!this.isRecord(source)) return null;

    for (const key of keys) {
      const value = this.readValue(source, key);
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "1", "yes"].includes(normalized)) return true;
        if (["false", "0", "no"].includes(normalized)) return false;
      }
    }

    return null;
  }

  private readString(source: unknown, ...keys: string[]): string | null {
    if (!this.isRecord(source)) return null;

    for (const key of keys) {
      const value = this.readValue(source, key);
      if (typeof value === "string" && value.trim()) return value;
    }

    return null;
  }

  private readValue(source: unknown, ...keys: string[]): unknown {
    if (!this.isRecord(source)) return undefined;

    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(source, key)) return source[key];
    }

    const entries = Object.entries(source);
    for (const key of keys) {
      const match = entries.find(
        ([entryKey]) => entryKey.toLowerCase() === key.toLowerCase(),
      );
      if (match) return match[1];
    }

    return undefined;
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
