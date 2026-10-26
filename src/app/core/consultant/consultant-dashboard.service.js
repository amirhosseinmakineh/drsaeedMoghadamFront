 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { HttpHeaders, HttpParams } from "@angular/common/http";


import { catchError, map, throwError } from "rxjs";

import { environment } from "../../../environments/environment";









































































































































































































































































































































































































































































@Injectable({ providedIn: "root" })
export class ConsultantDashboardService {
    __init() {this.apiBaseUrl = environment.apiBaseUrl}

  constructor(
     http,
     auth,
     router,
  ) {;this.http = http;this.auth = auth;this.router = router;ConsultantDashboardService.prototype.__init.call(this);}

  completeProfile(
    payload,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Consultant`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("تکمیل پروفایل مشاور انجام نشد"));
  }

  setAvailability(
    payload,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Consultant/SetAvalableConsultant`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("ثبت حضور انجام نشد"));
  }

  setOnlineStatus(payload) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Consultant/SetOnlineOfflineConsultant`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("تغییر وضعیت آنلاین انجام نشد"));
  }

  registerPushToken(
    payload,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Consultant/RegisterPushToken`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("ثبت توکن نوتیفیکیشن انجام نشد"));
  }

  sendTestPushNotification(
    payload,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Consultant/SendTestPushNotification`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("ارسال نوتیفیکیشن تست انجام نشد"));
  }

  getDashboardStatus(profileId) {
    return this.http
      .get(`${this.apiBaseUrl}/Consultant/GetDashboardStatus`, {
        headers: this.authHeaders(),
        params: this.toParams({ profileId }),
      })
      .pipe(
        map((response) => this.normalizeDashboardStatus(response)),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(error, "دریافت وضعیت داشبورد انجام نشد"),
          ),
        ),
      );
  }

  getBroadcastRealtimeLeads(
    profileId,
  ) {
    return this.http
      .get(`${this.apiBaseUrl}/Consultant/GetBroadcastRealtimeLeads`, {
        headers: this.authHeaders(),
        params: this.toParams({ profileId }),
      })
      .pipe(
        map((response) => this.normalizeBroadcastRealtimeLeads(response)),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(
              error,
              "دریافت لیدهای لحظه‌ای در دسترس انجام نشد",
            ),
          ),
        ),
      );
  }

  getLeads(
    filters,
  ) {
    return this.http
      .get(`${this.apiBaseUrl}/Consultant/GetLeads`, {
        headers: this.authHeaders(),
        params: this.toParams(filters),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse(response, filters),
        ),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(error, "دریافت لیدها انجام نشد"),
          ),
        ),
      );
  }

  getNewLeads(
    filters,
  ) {
    const { hasSubmittedReport: _hasSubmittedReport, ...newLeadFilters } =
      filters;

    return this.http
      .get(`${this.apiBaseUrl}/Consultant/GetNewLeads`, {
        headers: this.authHeaders(),
        params: this.toParams(newLeadFilters),
      })
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse(response, filters),
        ),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(error, "دریافت لیدهای جدید انجام نشد"),
          ),
        ),
      );
  }

  createConsultantPatientLead(
    payload,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Consultant/CreateConsultantPatientLead`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("ثبت بیمار انجام نشد"));
  }

  addPatientLead(
    payload,
  ) {
    return this.createConsultantPatientLead(payload);
  }

  submitLeadCallReport(
    payload,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Consultant/SubmitLeadCallReport`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("ثبت گزارش تماس انجام نشد"));
  }

  expireLeadNoCall(
    payload,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Consultant/ExpireLeadNoCall`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("منقضی کردن لید انجام نشد"));
  }

  recordLeadCallInitiated(
    payload,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Consultant/RecordLeadCallInitiated`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("ثبت شروع تماس انجام نشد"));
  }

  updateLeadCallReport(
    payload,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Consultant/UpdateLeadCallReport`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("ویرایش گزارش تماس انجام نشد"));
  }

  closeLead(
    leadAssignmentId,
    payload,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Consultant/leads/${leadAssignmentId}/close`,
        payload,
        { headers: this.authHeaders() },
      )
      .pipe(this.ensureCommandSucceeded("بستن پیگیری انجام نشد"));
  }

  createReservation(
    payload,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Reservation`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("ثبت رزرو انجام نشد"));
  }

  getDueConfirmations(
    consultantProfileId,
    dates = {},
  ) {
    return this.http
      .get(`${this.apiBaseUrl}/Reservation/DueConfirmations`, {
        headers: this.authHeaders(),
        params: this.toParams({ consultantProfileId, ...dates }),
      })
      .pipe(
        map((response) =>
          this.readItems(
            this.unwrapResponseData(response),
          ),
        ),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(
              error,
              "دریافت تایید حضورهای لازم انجام نشد",
            ),
          ),
        ),
      );
  }

  confirmAttendance(
    payload,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Reservation/ConfirmAttendance`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("ثبت تایید حضور انجام نشد"));
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

  updateReservation(
    reservationId,
    payload,
  ) {
    return this.http
      .put(
        `${this.apiBaseUrl}/Reservation/ConsultantReservations/${reservationId}`,
        payload,
        {
          headers: this.authHeaders(),
        },
      )
      .pipe(this.ensureCommandSucceeded("ویرایش رزرو انجام نشد"));
  }

  getConsultantPatientProfiles(
    filters,
  ) {
    return this.http
      .get(`${this.apiBaseUrl}/Reservation/ConsultantPatientProfiles`, {
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
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(
              error,
              "دریافت پرونده‌های بیمار انجام نشد",
            ),
          ),
        ),
      );
  }

  getReservations(
    filters,
  ) {
    return this.http
      .get(
        `${this.apiBaseUrl}/Reservation/GetConsultantReservations`,
        {
          headers: this.authHeaders(),
          params: this.toParams(filters),
        },
      )
      .pipe(
        map((response) =>
          this.normalizePaginatedResponse(
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

   authHeaders() {
    const token = this.auth.authToken();
    const baseHeaders = { Accept: "application/json" };
    if (token) baseHeaders["Authorization"] = `Bearer ${token}`;
    return new HttpHeaders(baseHeaders);
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

   normalizeDashboardStatus(
    response,
  ) {
    const source = this.unwrapResponseData(response);

    return {
      profileId:
        _nullishCoalesce(this.readNumber(source, "profileId", "consultantProfileId"), () => ( 0)),
      isAvailable:
        _nullishCoalesce(this.readBoolean(
          source,
          "isAvailable",
          "IsAvailable",
          "available",
          "consultantIsAvailable",
        ), () => ( false)),
      isOnline:
        _nullishCoalesce(this.readBoolean(
          source,
          "isOnline",
          "IsOnline",
          "online",
          "consultantIsOnline",
          "isConsultantOnline",
          "IsConsultantOnline",
        ), () => ( false)),
      lastOnlineAt: _nullishCoalesce(this.readString(source, "lastOnlineAt"), () => ( null)),
      lastOfflineAt: _nullishCoalesce(this.readString(source, "lastOfflineAt"), () => ( null)),
      canGoOnline: _nullishCoalesce(this.readBoolean(source, "canGoOnline"), () => ( false)),
      onlineStatusBlockReason:
        _nullishCoalesce(this.readString(source, "onlineStatusBlockReason", "blockReason"), () => (
        null)),
      todayReservationsCount:
        _nullishCoalesce(this.readNumber(
          source,
          "todayReservationsCount",
          "TodayReservationsCount",
        ), () => ( 0)),
      totalReservationsCount:
        _nullishCoalesce(this.readNumber(
          source,
          "totalReservationsCount",
          "TotalReservationsCount",
        ), () => ( 0)),
      totalReservedPatientsCount:
        _nullishCoalesce(this.readNumber(
          source,
          "totalReservedPatientsCount",
          "TotalReservedPatientsCount",
        ), () => ( 0)),
      todayCallsCount:
        _nullishCoalesce(this.readNumber(source, "todayCallsCount", "TodayCallsCount"), () => ( 0)),
      dailyLimit: _nullishCoalesce(this.readNumber(source, "dailyLimit", "DailyLimit"), () => ( 0)),
      todayPickupCount:
        _nullishCoalesce(this.readNumber(source, "todayPickupCount", "TodayPickupCount"), () => ( 0)),
      remainingDailyCapacity:
        _nullishCoalesce(this.readNumber(
          source,
          "remainingDailyCapacity",
          "RemainingDailyCapacity",
        ), () => ( 0)),
      pendingReportCount:
        _nullishCoalesce(this.readNumber(source, "pendingReportCount", "PendingReportCount"), () => ( 0)),
      uncalledWithoutReportCount:
        _nullishCoalesce(this.readNumber(
          source,
          "uncalledWithoutReportCount",
          "UncalledWithoutReportCount",
        ), () => ( 0)),
      isNewLeadBlocked:
        _nullishCoalesce(this.readBoolean(source, "isNewLeadBlocked", "IsNewLeadBlocked"), () => (
        false)),
      shouldShowWorkloadNotification:
        _nullishCoalesce(this.readBoolean(
          source,
          "shouldShowWorkloadNotification",
          "ShouldShowWorkloadNotification",
        ), () => ( false)),
      workloadNotificationMessage:
        _nullishCoalesce(this.readString(
          source,
          "workloadNotificationMessage",
          "WorkloadNotificationMessage",
        ), () => ( null)),
      raw: response,
    };
  }

   normalizeBroadcastRealtimeLeads(
    response,
  ) {
    const source = this.unwrapResponseData(response);
    const leads = this.readItems(source);
    const nestedLeads = this.readItems(
      this.readValue(source, "leads", "Leads"),
    );
    const resolvedLeads = leads.length ? leads : nestedLeads;

    return {
      canReceive:
        _nullishCoalesce(this.readBoolean(source, "canReceive", "CanReceive"), () => ( false)),
      blockReason:
        _nullishCoalesce(this.readString(source, "blockReason", "BlockReason"), () => ( null)),
      leads: resolvedLeads,
    };
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

    const normalizedTotalCount = Math.max(0, totalCount);
    const normalizedPageSize = pageSize > 0 ? pageSize : filters.pageSize;
    const normalizedPageNumber =
      pageNumber > 0 ? pageNumber : filters.pageNumber;
    const calculatedTotalPages = Math.max(
      1,
      Math.ceil(normalizedTotalCount / Math.max(1, normalizedPageSize)),
    );
    const normalizedTotalPages =
      !Number.isFinite(totalPages) ||
      totalPages >= 2147483647 ||
      totalPages <= 0 ||
      totalPages > calculatedTotalPages
        ? calculatedTotalPages
        : totalPages;

    return {
      items,
      totalCount: normalizedTotalCount,
      pageNumber: normalizedPageNumber,
      pageSize: normalizedPageSize,
      totalPages: normalizedTotalPages,
      raw: response,
      source,
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
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      Number((error ).status) === 401
    ) {
      this.auth.invalidateSession();
      void this.router.navigateByUrl("/");
      return new Error(
        "نشست شما منقضی یا نامعتبر شده است؛ لطفاً دوباره وارد شوید.",
      );
    }

    if (error instanceof Error && error.message) return error;
    if (typeof error === "object" && error !== null && "error" in error) {
      const httpError = error 


;
      if (typeof httpError.error === "object" && _optionalChain([httpError, 'access', _ => _.error, 'optionalAccess', _2 => _2.message]))
        return new Error(httpError.error.message);
      if (typeof httpError.error === "string" && httpError.error)
        return new Error(httpError.error);
      if (httpError.message) return new Error(httpError.message);
    }

    return new Error(fallback);
  }
}
