 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { HttpHeaders, HttpParams } from "@angular/common/http";

import { catchError, forkJoin, from, map, switchMap, throwError } from "rxjs";

import { environment } from "../../../environments/environment";

import { ensureCsvBlob } from "../../utils/file-download.util";































































export var SecretaryType; (function (SecretaryType) {
  const Main = 1; SecretaryType[SecretaryType["Main"] = Main] = "Main";
  const Assistant = 2; SecretaryType[SecretaryType["Assistant"] = Assistant] = "Assistant";
})(SecretaryType || (SecretaryType = {}));

export var SecretaryPermissionType; (function (SecretaryPermissionType) {
  const ViewReservations = 1; SecretaryPermissionType[SecretaryPermissionType["ViewReservations"] = ViewReservations] = "ViewReservations";
  const EditReservations = 2; SecretaryPermissionType[SecretaryPermissionType["EditReservations"] = EditReservations] = "EditReservations";
  const ConfirmAttendance = 3; SecretaryPermissionType[SecretaryPermissionType["ConfirmAttendance"] = ConfirmAttendance] = "ConfirmAttendance";
  const SecretaryAnnouncement = 4; SecretaryPermissionType[SecretaryPermissionType["SecretaryAnnouncement"] = SecretaryAnnouncement] = "SecretaryAnnouncement";
  const ViewPatients = 5; SecretaryPermissionType[SecretaryPermissionType["ViewPatients"] = ViewPatients] = "ViewPatients";
  const CreateReservation = 6; SecretaryPermissionType[SecretaryPermissionType["CreateReservation"] = CreateReservation] = "CreateReservation";
  const CancelReservation = 7; SecretaryPermissionType[SecretaryPermissionType["CancelReservation"] = CancelReservation] = "CancelReservation";
})(SecretaryPermissionType || (SecretaryPermissionType = {}));
































































































































































































































































































































































































































































































































































































































































@Injectable({ providedIn: "root" })
export class AdminDashboardService {
  getAdminLeadSheets() {
    return this.http.get(`${this.apiBaseUrl}/admin/lead-sheets`, { headers: this.authHeaders() });
  }

  createAdminLeadSheet(name) {
    return this.http.post(`${this.apiBaseUrl}/admin/lead-sheets`, { name }, { headers: this.authHeaders() });
  }

  addAdminSheetLead(sheetId, lead) {
    return this.http.post(`${this.apiBaseUrl}/admin/lead-sheets/${sheetId}/leads`, lead, { headers: this.authHeaders() });
  }

    __init() {this.apiBaseUrl = environment.apiBaseUrl}

  constructor(
     http,
     auth,
  ) {;this.http = http;this.auth = auth;AdminDashboardService.prototype.__init.call(this);}

  getLeadAssignmentSetting() {
    return this.http.get(`${this.apiBaseUrl}/admin/lead-assignment-settings`, {
      headers: this.authHeaders(),
    }).pipe(map((response) => this.unwrap(response)));
  }

  updateLeadAssignmentSetting(assignmentSourceType) {
    return this.http.put(`${this.apiBaseUrl}/admin/lead-assignment-settings`, { assignmentSourceType }, {
      headers: this.authHeaders(),
    }).pipe(map((response) => this.unwrap(response)));
  }

  getUsers(filters) {
    return this.http
      .get(`${this.apiBaseUrl}/User`, {
        headers: this.authHeaders(),
        params: this.toParams(filters),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse(response, filters),
        ),
      );
  }

  getSecretaries(
    filters,
  ) {
    return this.http
      .get(`${this.apiBaseUrl}/admin/secretaries`, {
        headers: this.authHeaders(),
        params: this.toParams(filters),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse(response, filters),
        ),
      );
  }

  getSecretarySchedule(userId) {
    return this.http
      .get(`${this.apiBaseUrl}/admin/secretaries/${userId}/schedule`, {
        headers: this.authHeaders(),
      })
      .pipe(map((response) => this.unwrapResponseData(response) ));
  }

  updateSecretarySchedule(
    userId,
    payload,
  ) {
    return this.http.put(
      `${this.apiBaseUrl}/admin/secretaries/${userId}/schedule`,
      payload,
      { headers: this.authHeaders() },
    );
  }

  addUser(payload) {
    return this.http
      .post(`${this.apiBaseUrl}/User`, payload, {
        headers: this.authHeaders(),
      })
      .pipe(this.ensureCommandSucceeded("ثبت کاربر انجام نشد"));
  }

  updateUser(payload) {
    return this.http
      .put(`${this.apiBaseUrl}/User`, payload, {
        headers: this.authHeaders(),
      })
      .pipe(this.ensureCommandSucceeded("ویرایش کاربر انجام نشد"));
  }

  deleteUser(userId) {
    return this.http
      .delete(`${this.apiBaseUrl}/User/${encodeURIComponent(userId)}`, {
        headers: this.authHeaders(),
      })
      .pipe(this.ensureCommandSucceeded("حذف کاربر انجام نشد"));
  }

  getConsultants(
    filters,
  ) {
    const userFilters = {
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

  getConsultantsList(
    filters = { pageNumber: 1, pageSize: 500 },
  ) {
    return this.http
      .get(`${this.apiBaseUrl}/Consultant/GetConsultants`, {
        headers: this.authHeaders(),
        params: this.toParams(filters),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse(response, filters),
        ),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(error, "دریافت فهرست مشاوران انجام نشد"),
          ),
        ),
      );
  }

   fetchConsultantProfiles() {
    return this.http
      .get(`${this.apiBaseUrl}/Consultant/GetConsultants`, {
        headers: this.authHeaders(),
        params: this.toParams({ pageNumber: 1, pageSize: 500 }),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse(response, {
            pageNumber: 1,
            pageSize: 500,
          }),
        ),
      );
  }

   mergeConsultantsFromUsers(
    users,
    profiles,
  ) {
    const profileByUserId = new Map();
    const profileByPhone = new Map();

    profiles.forEach((profile) => {
      const userId = profile.id || profile.Id || "";
      const phone = profile.phoneNumber || profile.PhoneNumber || "";
      if (userId) profileByUserId.set(userId, profile);
      if (phone) profileByPhone.set(phone, profile);
    });

    return users.map((user) => {
      const userId = user.id || user.Id || "";
      const phone = user.phoneNumber || user.PhoneNumber || "";
      const profile = _nullishCoalesce(profileByUserId.get(userId), () => ( profileByPhone.get(phone)));

      return {
        id: userId,
        firstName: user.firstName || user.FirstName || "",
        lastName: user.lastName || user.LastName || "",
        phoneNumber: phone,
        profileId:
          _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(user.consultantProfileId, () => (
          user.ConsultantProfileId)), () => (
          _optionalChain([profile, 'optionalAccess', _ => _.profileId]))), () => (
          _optionalChain([profile, 'optionalAccess', _2 => _2.ProfileId]))), () => (
          user.profileId)), () => (
          user.ProfileId)), () => (
          0)),
        consultantIsOnline:
          _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(user.consultantIsOnline, () => (
          user.ConsultantIsOnline)), () => (
          _optionalChain([profile, 'optionalAccess', _3 => _3.consultantIsOnline]))), () => (
          null)),
        consultantIsAvailable:
          _nullishCoalesce(_nullishCoalesce(user.consultantIsAvailable, () => (
          user.ConsultantIsAvailable)), () => (
          null)),
        lastSeenAt: _nullishCoalesce(_nullishCoalesce(user.lastSeenAt, () => ( user.LastSeenAt)), () => ( null)),
        attendanceResponse: _optionalChain([profile, 'optionalAccess', _4 => _4.attendanceResponse]),
        scoreLogResponse: _optionalChain([profile, 'optionalAccess', _5 => _5.scoreLogResponse]),
        leadsAssignmentItemsResponse: _optionalChain([profile, 'optionalAccess', _6 => _6.leadsAssignmentItemsResponse]),
      };
    });
  }

  getConsultantProfile(profileId) {
    return this.http
      .get(`${this.apiBaseUrl}/admin/consultants/${profileId}`, {
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
    profileId,
    limitNumber,
  ) {
    return this.http
      .patch(
        `${this.apiBaseUrl}/admin/consultants/${profileId}/limit`,
        { limitNumber, LimitNumber: limitNumber },
        { headers: this.authHeaders() },
      )
      .pipe(
        map((response) => this.normalizeLimitUpdateResponse(response)),
        this.ensureCommandSucceeded("ذخیره محدودیت دریافت شماره انجام نشد"),
      );
  }

   normalizeLimitUpdateResponse(
    response,
  ) {
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
          _nullishCoalesce(this.readNumber(record, "effectiveDailyLimit", "EffectiveDailyLimit"), () => (
          10)),
        todayPickupCount:
          _nullishCoalesce(this.readNumber(record, "todayPickupCount", "TodayPickupCount"), () => ( 0)),
      },
    };
  }

   normalizeConsultantProfile(response) {
    const source = this.unwrapResponseData(response);
    const record = this.isRecord(source) ? source : {};

    return {
      profileId:
        _nullishCoalesce(this.readNumber(record, "profileId", "ProfileId"), () => ( 0)),
      userId: String(_nullishCoalesce(this.readValue(record, "userId", "UserId"), () => ( ""))),
      firstName: String(_nullishCoalesce(this.readValue(record, "firstName", "FirstName"), () => ( ""))),
      lastName: String(_nullishCoalesce(this.readValue(record, "lastName", "LastName"), () => ( ""))),
      phoneNumber: String(
        _nullishCoalesce(this.readValue(record, "phoneNumber", "PhoneNumber"), () => ( "")),
      ),
      userIsActive:
        _nullishCoalesce(this.readBoolean(record, "userIsActive", "UserIsActive"), () => ( false)),
      userIsCompleteProfile:
        _nullishCoalesce(this.readBoolean(
          record,
          "userIsCompleteProfile",
          "UserIsCompleteProfile",
        ), () => ( false)),
      nationalCode: String(
        _nullishCoalesce(this.readValue(record, "nationalCode", "NationalCode"), () => ( "")),
      ),
      address: String(_nullishCoalesce(this.readValue(record, "address", "Address"), () => ( ""))),
      isAvailable:
        _nullishCoalesce(this.readBoolean(record, "isAvailable", "IsAvailable"), () => ( false)),
      isOnline: _nullishCoalesce(this.readBoolean(record, "isOnline", "IsOnline"), () => ( false)),
      isCompleteProfile:
        _nullishCoalesce(this.readBoolean(record, "isCompleteProfile", "IsCompleteProfile"), () => (
        false)),
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
        _nullishCoalesce(this.readNumber(record, "effectiveDailyLimit", "EffectiveDailyLimit"), () => (
        10)),
      todayPickupCount:
        _nullishCoalesce(this.readNumber(record, "todayPickupCount", "TodayPickupCount"), () => ( 0)),
    };
  }

  getAttendance(
    consultantProfileId,
    pageNumber = 1,
    pageSize = 10,
  ) {
    return this.http
      .get(`${this.apiBaseUrl}/Attendance`, {
        headers: this.authHeaders(),
        params: this.toParams({ consultantProfileId, pageNumber, pageSize }),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse(response, {
            pageNumber,
            pageSize,
          }),
        ),
      );
  }

  exportUsersReport() {
    return this.exportCsvReport("users/export");
  }

  exportLeadsReport() {
    return this.exportCsvReport("leads/export");
  }

  exportConsultantsReport() {
    return this.exportCsvReport("consultants/export");
  }

  getConsultantsDailySummary() {
    return this.http
      .get(`${this.apiBaseUrl}/admin/reports/consultants/daily-summary`, {
        headers: this.authHeaders(),
      })
      .pipe(
        map((response) => this.normalizeConsultantsDailySummary(response)),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(error, "دریافت گزارش روزانه مشاوران انجام نشد"),
          ),
        ),
      );
  }

  exportLeadCallReports(
    filters,
  ) {
    return this.exportCsvReport("lead-call-reports/export", filters);
  }

  getLeadsReport(filters) {
    return this.http.get(
      `${this.apiBaseUrl}/admin/reports/leads`,
      { headers: this.authHeaders(), params: this.toParams(filters) },
    ).pipe(
      catchError((error) => throwError(() =>
        this.toUserFacingError(error, "دریافت گزارش لیدها انجام نشد"),
      )),
    );
  }

  exportFilteredLeadsReport(filters) {
    const { pageNumber: _pageNumber, pageSize: _pageSize, ...exportFilters } = filters;
    return this.exportCsvReport("leads/export", exportFilters);
  }

  getDailyReservationsReport(
    filters,
  ) {
    return this.http
      .get(
        `${this.apiBaseUrl}/admin/reports/daily-reservations`,
        { headers: this.authHeaders(), params: this.toParams(filters) },
      )
      .pipe(
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(error, "دریافت گزارش روزانه رزروها انجام نشد"),
          ),
        ),
      );
  }

  exportDailyReservationsReport(
    filters,
  ) {
    return this.exportCsvReport("daily-reservations/export", filters);
  }

  getPatientFinanceReport(
    filters,
  ) {
    return this.http.get(
      `${this.apiBaseUrl}/admin/reports/patient-finances`,
      { headers: this.authHeaders(), params: this.toParams(filters) },
    ).pipe(catchError((error) => throwError(() =>
      this.toUserFacingError(error, "دریافت گزارش حسابداری بیماران انجام نشد"),
    )));
  }

  exportPatientFinanceReport(filters) {
    const { page: _page, pageSize: _pageSize, ...exportFilters } = filters;
    return this.http.get(
      `${this.apiBaseUrl}/admin/reports/patient-finances/export`,
      {
        headers: this.authHeaders().set(
          "Accept",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ),
        params: this.toParams(exportFilters),
        responseType: "blob",
      },
    ).pipe(catchError((error) => throwError(() =>
      this.toUserFacingError(error, "دریافت خروجی اکسل حسابداری انجام نشد"),
    )));
  }

  getPatientFinanceFile(fileNumber) {
    return this.http.get(
      `${this.apiBaseUrl}/admin/reports/patient-finances/files/${fileNumber}`,
      {
        headers: this.authHeaders(),
      },
    ).pipe(
      map(response => _nullishCoalesce(response, () => ( null))),
      catchError(error => throwError(() =>
        this.toUserFacingError(error, "دریافت صورت‌حساب‌های بیمار انجام نشد"),
      )),
    );
  }

  uploadGuaranteeDocument(caseId, file) {
    const body = new FormData();
    body.append("file", file);
    return this.http.post(
      `${this.apiBaseUrl}/secretary/patient-financial-cases/${caseId}/guarantee-document`,
      body,
      { headers: this.authHeaders() },
    );
  }

  deleteGuaranteeDocument(caseId) {
    return this.http.delete(
      `${this.apiBaseUrl}/secretary/patient-financial-cases/${caseId}/guarantee-document`,
      { headers: this.authHeaders() },
    );
  }

  updatePatientFinance(caseId, request) {
    return this.http.put(
      `${this.apiBaseUrl}/admin/reports/patient-finances/${caseId}`,
      request,
      { headers: this.authHeaders() },
    ).pipe(catchError((error) => throwError(() =>
      this.toUserFacingError(error, "ویرایش حسابداری بیمار انجام نشد"),
    )));
  }

  deletePatientFinance(caseId) {
    return this.http.delete(
      `${this.apiBaseUrl}/admin/reports/patient-finances/${caseId}`,
      { headers: this.authHeaders() },
    ).pipe(catchError((error) => throwError(() =>
      this.toUserFacingError(error, "حذف حسابداری بیمار انجام نشد"),
    )));
  }

  getPatientFinanceDetails(caseId) {
    return this.http.get(
      `${this.apiBaseUrl}/admin/reports/patient-finances/${caseId}/details`,
      { headers: this.authHeaders() },
    );
  }

  updatePatientCheque(id, request) {
    return this.http.put(`${this.apiBaseUrl}/admin/reports/patient-finances/cheques/${id}`, request, { headers: this.authHeaders() });
  }

  deletePatientCheque(id) {
    return this.http.delete(`${this.apiBaseUrl}/admin/reports/patient-finances/cheques/${id}`, { headers: this.authHeaders() });
  }

  updatePatientPromissoryNote(id, request) {
    return this.http.put(`${this.apiBaseUrl}/admin/reports/patient-finances/promissory-notes/${id}`, request, { headers: this.authHeaders() });
  }

  deletePatientPromissoryNote(id) {
    return this.http.delete(`${this.apiBaseUrl}/admin/reports/patient-finances/promissory-notes/${id}`, { headers: this.authHeaders() });
  }

  exportReservationsReport(
    filters = {},
  ) {
    return this.exportCsvReport("reservations/export", filters);
  }

  exportConsultantAttendanceConfirmationsReport(
    filters = {},
  ) {
    return this.exportCsvReport(
      "consultant-attendance-confirmations/export",
      filters,
    );
  }

  getConsultantAttendanceConfirmations(
    filters,
  ) {
    return this.getSecretaryReservations({
      ...filters,
      onlyConsultantAttendanceConfirmed: true,
    });
  }

   exportCsvReport(
    path,
    params,
  ) {
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
    filters,
  ) {
    return this.http
      .get(`${this.apiBaseUrl}/Consultant/GetLeads`, {
        headers: this.authHeaders(),
        params: this.toParams(filters),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse(
            response,
            filters,
          ),
        ),
      );
  }

  getSecretaryReservations(
    filters,
  ) {
    return this.http
      .get(`${this.apiBaseUrl}/Reservation/SecretaryReservations`, {
        headers: this.authHeaders(),
        params: this.toParams(filters),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse(
            response,
            filters,
          ),
        ),
      );
  }

  getReservationAttendanceReviews(
    pageNumber = 1,
    pageSize = 20,
  ) {
    return this.getSecretaryReservations({
      onlyWaitingForSecretaryReview: true,
      pageNumber,
      pageSize,
    });
  }

  completePatientProfile(
    payload,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Reservation/CompletePatientProfile`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("تشکیل پرونده بیمار انجام نشد"));
  }

  reviewAttendance(
    payload,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Reservation/ReviewAttendance`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("ثبت بررسی حضور انجام نشد"));
  }

  getSystemLeads(
    filters,
  ) {
    return this.http
      .get(`${this.apiBaseUrl}/LeadAssignment`, {
        headers: this.authHeaders(),
        params: this.toParams(filters),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse(
            response,
            filters,
          ),
        ),
      );
  }

   unwrap(response) {
    const wrapper = response ;
    return _nullishCoalesce(_nullishCoalesce(_optionalChain([wrapper, 'optionalAccess', _7 => _7.data]), () => ( _optionalChain([wrapper, 'optionalAccess', _8 => _8.result]))), () => ( response ));
  }

   authHeaders() {
    const token = this.auth.authToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

   toParams(source) {
    let params = new HttpParams();

    Object.entries(source ).forEach(
      ([key, value]) => {
        if (value === null || value === undefined || value === "") return;
        params = params.set(key, String(value));
      },
    );

    return params;
  }

   ensureCommandSucceeded(fallback) {
    return (source) =>
      source.pipe(
        map((response) => this.normalizeCommandResponse(response, fallback)),
        catchError((error) =>
          throwError(() => this.toUserFacingError(error, fallback)),
        ),
      );
  }

   normalizePaginatedResponse(
    response,
    filters,
  ) {
    const source = this.unwrapResponseData(response);
    const items = this.readItems(source);
    const totalCount =
      _nullishCoalesce(_nullishCoalesce(this.readNumber(source, "totalCount", "total", "count", "recordsTotal"), () => (
      this.readNumber(
        response,
        "totalCount",
        "total",
        "count",
        "recordsTotal",
      ))), () => (
      items.length));
    const pageSize =
      _nullishCoalesce(_nullishCoalesce(this.readNumber(source, "pageSize", "take", "limit"), () => (
      this.readNumber(response, "pageSize", "take", "limit"))), () => (
      filters.pageSize));
    const pageNumber =
      _nullishCoalesce(_nullishCoalesce(this.readNumber(source, "pageNumber", "page", "currentPage"), () => (
      this.readNumber(response, "pageNumber", "page", "currentPage"))), () => (
      filters.pageNumber));
    const totalPages =
      _nullishCoalesce(_nullishCoalesce(this.readNumber(source, "totalPages", "pages", "pageCount"), () => (
      this.readNumber(response, "totalPages", "pages", "pageCount"))), () => (
      Math.ceil(totalCount / Math.max(1, pageSize))));

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

   finalizePaginatedResponse(
    payload







,
    filters,
  ) {
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
      _nullishCoalesce(payload.totalPages, () => ( maxReasonablePages));

    if (
      !Number.isFinite(totalPages) ||
      totalPages >= 2147483647 ||
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

   unwrapResponseData(response) {
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

   readItems(source) {
    if (Array.isArray(source)) return source ;
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
      if (Array.isArray(value)) return value ;
      const nestedItems = this.readItems(value);
      if (nestedItems.length) return nestedItems;
    }

    const firstArray = Object.values(source).find(Array.isArray);
    return Array.isArray(firstArray) ? (firstArray ) : [];
  }

   readNumber(source, ...keys) {
    if (!this.isRecord(source)) return null;

    for (const key of keys) {
      const value = this.readValue(source, key);
      if (value === null || value === undefined || value === "") continue;
      const numeric = typeof value === "number" ? value : Number(value);
      if (Number.isFinite(numeric)) return numeric;
    }

    return null;
  }

   normalizeConsultantsDailySummary(
    response,
  ) {
    const source = this.unwrapResponseData(response);
    const items = this.readItems(source).map((item) => ({
      consultantProfileId:
        _nullishCoalesce(this.readNumber(item, "consultantProfileId", "ConsultantProfileId"), () => ( 0)),
      firstName: String(_nullishCoalesce(this.readValue(item, "firstName", "FirstName"), () => ( ""))),
      lastName: String(_nullishCoalesce(this.readValue(item, "lastName", "LastName"), () => ( ""))),
      phoneNumber: String(_nullishCoalesce(this.readValue(item, "phoneNumber", "PhoneNumber"), () => ( ""))),
      todayReservationsCount:
        _nullishCoalesce(this.readNumber(item, "todayReservationsCount", "TodayReservationsCount"), () => (
        0)),
    }));

    return {
      date: _nullishCoalesce(this.readString(source, "date", "Date"), () => ( "")),
      items,
    };
  }

   normalizeCommandResponse(
    response,
    fallback,
  ) {
    const success = this.readBoolean(
      response,
      "isSuccess",
      "success",
      "succeeded",
    );
    const message =
      _nullishCoalesce(_nullishCoalesce(this.readString(response, "message", "error"), () => ( response.message)), () => ( ""));

    if (success === false) {
      throw new Error(message || fallback);
    }

    return {
      ...response,
      isSuccess: _nullishCoalesce(success, () => ( true)),
      message,
      data: this.readValue(response, "data", "result", "value") 

,
    };
  }

   readBoolean(source, ...keys) {
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

   readString(source, ...keys) {
    if (!this.isRecord(source)) return null;

    for (const key of keys) {
      const value = this.readValue(source, key);
      if (typeof value === "string" && value.trim()) return value;
    }

    return null;
  }

   readValue(source, ...keys) {
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

   isRecord(value) {
    return typeof value === "object" && value !== null;
  }

   toUserFacingError(error, fallback) {
    if (error instanceof Error && error.message) return error;
    if (typeof error === "object" && error !== null && "error" in error) {
      const httpError = error 


;
      if (typeof httpError.error === "object" && _optionalChain([httpError, 'access', _9 => _9.error, 'optionalAccess', _10 => _10.message]))
        return new Error(httpError.error.message);
      if (typeof httpError.error === "string" && httpError.error)
        return new Error(httpError.error);
      if (httpError.message) return new Error(httpError.message);
    }

    return new Error(fallback);
  }
}
