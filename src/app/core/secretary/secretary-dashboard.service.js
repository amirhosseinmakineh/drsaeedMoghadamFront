 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { HttpHeaders, HttpParams } from "@angular/common/http";

import {

  catchError,
  forkJoin,
  map,
  of,
  switchMap,
  throwError,
} from "rxjs";

import { environment } from "../../../environments/environment";



































































































































































export var ReservationType; (function (ReservationType) {
  const Regular = 1; ReservationType[ReservationType["Regular"] = Regular] = "Regular";
  const AfterSalesService = 2; ReservationType[ReservationType["AfterSalesService"] = AfterSalesService] = "AfterSalesService";
})(ReservationType || (ReservationType = {}));













































































































@Injectable({ providedIn: "root" })
export class SecretaryDashboardService {
    __init() {this.apiBaseUrl = environment.apiBaseUrl}

  constructor(
     http,
     auth,
  ) {;this.http = http;this.auth = auth;SecretaryDashboardService.prototype.__init.call(this);}

  getAccess() {
    return this.http
      .get(`${this.apiBaseUrl}/Secretary/access`, { headers: this.authHeaders() })
      .pipe(map((response) => {
        const envelope = response ;
        const value = (_nullishCoalesce(_nullishCoalesce(envelope.data, () => ( envelope.Data)), () => ( response))) ;
        const list = (camel, pascal) => {
          const raw = _nullishCoalesce(value[camel], () => ( value[pascal]));
          return Array.isArray(raw) ? raw.map(String) : [];
        };
        return {
          isSecretary: Boolean(_nullishCoalesce(value["isSecretary"], () => ( value["IsSecretary"]))),
          hasFullAccess: Boolean(_nullishCoalesce(value["hasFullAccess"], () => ( value["HasFullAccess"]))),
          allowedDays: list("allowedDays", "AllowedDays"),
          permissions: list("permissions", "Permissions") ,
        };
      }));
  }

  canManageReservation(reservation) {
    return this.backendPermission(
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(reservation.canManage, () => (
        reservation.CanManage)), () => (
        reservation.canEdit)), () => (
        reservation.CanEdit)),
    );
  }

  canUpdateAnnouncement(reservation) {
    return this.backendPermission(
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(reservation.canUpdateSecretaryAnnouncement, () => (
        reservation.CanUpdateSecretaryAnnouncement)), () => (
        reservation.canManage)), () => (
        reservation.CanManage)), () => (
        reservation.canEdit)), () => (
        reservation.CanEdit)),
    );
  }

  getReservations(
    filters,
  ) {
    const {
      searchText,
      attendanceConfirmationStatus,
      ...reservationFilters
    } = filters;
    const requestFilters = {
      ...reservationFilters,
      search: searchText,
      attendanceStatus: attendanceConfirmationStatus,
    };

    return this.http
      .get(`${this.apiBaseUrl}/Reservation/SecretaryReservations`, {
        headers: this.authHeaders(),
        params: this.toParams(requestFilters),
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
            this.toUserFacingError(error, "دریافت رزروها انجام نشد"),
          ),
        ),
      );
  }

  getReservationDetails(
    reservationId,
  ) {
    return this.http
      .get(`${this.apiBaseUrl}/Reservation/${reservationId}`, {
        headers: this.authHeaders(),
      })
      .pipe(
        map((response) => {
          const envelope = response ;
          return (_nullishCoalesce(_nullishCoalesce(envelope.data, () => ( envelope.Data)), () => ( response))) ;
        }),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(error, "دریافت جزئیات رزرو انجام نشد"),
          ),
        ),
      );
  }

  getAllReservations(
    filters,
  ) {
    const firstPageFilters = {
      ...filters,
      pageNumber: 1,
    };

    return this.getReservations(firstPageFilters).pipe(
      switchMap((firstPage) => {
        if (firstPage.totalPages <= 1) return of(firstPage.items);

        const remainingPages = Array.from(
          { length: firstPage.totalPages - 1 },
          (_, index) => this.getReservations({
            ...firstPageFilters,
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

  getAttendanceReviews(
    pageNumber = 1,
    pageSize = 50,
  ) {
    return this.getReservations({
      includeCanceled: false,
      pageNumber,
      pageSize,
    });
  }

  getDashboardReservations() {
    const pageSize = 100;
    const baseFilters = {
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

  getDashboardSummary() {
    return this.http
      .get(`${this.apiBaseUrl}/secretary/dashboard/summary`, {
        headers: this.authHeaders(),
      })
      .pipe(
        map((response) => {
          const root = response ;
          const value = (_nullishCoalesce(_optionalChain([root, 'optionalAccess', _2 => _2["data"]]), () => ( root))) ;
          const number = (...keys) => {
            const found = keys.map((key) => _optionalChain([value, 'optionalAccess', _3 => _3[key]])).find((item) => item != null);
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
    payload,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Reservation/ReviewAttendance`,
        payload,
        { headers: this.authHeaders() },
      )
      .pipe(this.ensureCommandSucceeded("ثبت بررسی حضور انجام نشد"));
  }

  createReservation(
    payload,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Reservation`,
        payload,
        { headers: this.authHeaders() },
      )
      .pipe(this.ensureCommandSucceeded("ثبت رزرو انجام نشد"));
  }

  getPatientOptions() {
    const filters = { pageNumber: 1, pageSize: 500 };
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
    payload,
  ) {
    return this.http
      .put(
        `${this.apiBaseUrl}/Reservation/SecretaryAnnouncement`,
        payload,
        { headers: this.authHeaders() },
      )
      .pipe(this.ensureCommandSucceeded("ثبت اعلام منشی انجام نشد"));
  }

  confirmReservation(
    reservationId,
    note,
  ) {
    return this.postReservationCommand(
      reservationId,
      "secretary-confirm",
      { note },
      "تایید رزرو انجام نشد",
    );
  }

  rescheduleReservation(
    reservationId,
    payload,
  ) {
    return this.postReservationCommand(
      reservationId,
      "secretary-reschedule",
      payload,
      "تغییر زمان رزرو انجام نشد",
    );
  }

  updateReservationTime(
    reservationId,
    reservationAt,
    dentalServices,
    patientCount,
  ) {
    const payload = {
      reservationAt,
      dentalServices,
      patientCount,
    };
    return this.http
      .post(
        `${this.apiBaseUrl}/Reservation/SecretaryReservations/${reservationId}/time`,
        payload,
        { headers: this.authHeaders() },
      )
      .pipe(
        catchError((error) => {
          if (_optionalChain([error, 'optionalAccess', _4 => _4.status]) === 401) {
            return throwError(() => new Error("نشست کاربر منقضی شده است"));
          }
          if (_optionalChain([error, 'optionalAccess', _5 => _5.status]) === 403) {
            return throwError(() => new Error("دسترسی تغییر رزرو را ندارید"));
          }
          return throwError(() => error);
        }),
      )
      .pipe(this.ensureCommandSucceeded("تغییر زمان رزرو انجام نشد"));
  }

  rejectReservation(
    reservationId,
    payload,
  ) {
    return this.postReservationCommand(
      reservationId,
      "secretary-reject",
      payload,
      "رد درخواست رزرو انجام نشد",
    );
  }

  addReservationNote(
    reservationId,
    note,
  ) {
    return this.postReservationCommand(
      reservationId,
      "notes",
      { note },
      "ثبت یادداشت انجام نشد",
    );
  }

  logPatientContact(
    reservationId,
    result,
    note,
  ) {
    return this.postReservationCommand(
      reservationId,
      "contacts",
      { result, note },
      "ثبت تماس انجام نشد",
    );
  }

  createFollowUp(
    reservationId,
    scheduledAt,
    reason,
  ) {
    return this.postReservationCommand(
      reservationId,
      "follow-ups",
      { scheduledAt, reason },
      "ثبت پیگیری انجام نشد",
    );
  }

  recordVisitResult(
    reservationId,
    visitResultStatus,
    note,
  ) {
    return this.postReservationCommand(
      reservationId,
      "visit-result",
      { visitResultStatus, note },
      "ثبت نتیجه مراجعه انجام نشد",
    );
  }

  getReservationHistory(
    reservationId,
  ) {
    return this.http
      .get

(`${this.apiBaseUrl}/Reservation/${reservationId}/history`, { headers: this.authHeaders() })
      .pipe(
        map((response) => {
          if (!_optionalChain([response, 'optionalAccess', _6 => _6.isSuccess])) {
            throw new Error(_optionalChain([response, 'optionalAccess', _7 => _7.message]) || "دریافت تاریخچه انجام نشد");
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

   postReservationCommand(
    reservationId,
    action,
    payload,
    fallback,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Reservation/${reservationId}/${action}`,
        payload,
        { headers: this.authHeaders() },
      )
      .pipe(this.ensureCommandSucceeded(fallback));
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

   normalizeCommandResponse(
    response,
    fallback,
  ) {
    if (!_optionalChain([response, 'optionalAccess', _8 => _8.isSuccess])) {
      throw new Error(_optionalChain([response, 'optionalAccess', _9 => _9.message]) || fallback);
    }

    return response;
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

   readValue(source, ...keys) {
    if (!this.isRecord(source)) return null;

    for (const key of keys) {
      if (key in source) return source[key];
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
      if (pascalKey in source) return source[pascalKey];
    }

    return null;
  }

   isRecord(value) {
    return typeof value === "object" && value !== null;
  }

   toUserFacingError(error, fallback) {
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
      const httpError = error 


;
      if (typeof httpError.error === "object" && _optionalChain([httpError, 'access', _10 => _10.error, 'optionalAccess', _11 => _11.message]))
        return new Error(httpError.error.message);
      if (typeof httpError.error === "string" && httpError.error)
        return new Error(httpError.error);
      if (httpError.message) return new Error(httpError.message);
    }

    return new Error(fallback);
  }

   backendPermission(permission) {
    if (typeof permission === "boolean") return permission;

    const secretaryType = _optionalChain([this, 'access', _12 => _12.auth, 'access', _13 => _13.user, 'call', _14 => _14(), 'optionalAccess', _15 => _15.secretaryType, 'optionalAccess', _16 => _16.toLowerCase, 'call', _17 => _17()]);
    if (secretaryType === "assistant") return false;
    return true;
  }
}
