 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { HttpHeaders } from "@angular/common/http";
import { computed, signal } from "@angular/core";
import { catchError, map, throwError } from "rxjs";
import { environment } from "../../../environments/environment";

 












































































@Injectable({ providedIn: "root" })
export class AuthService {
    __init() {this.apiBaseUrl = environment.apiBaseUrl}
    __init2() {this.sessionStorageKey = "clinic-auth-session"}
    __init3() {this.dashboardRolePriority = [
    "admin",
    "consultant",
    "secretary",
    "patient",
  ]}
    __init4() {this.currentUser = signal(this.readSession())}

   __init5() {this.user = this.currentUser.asReadonly()}
   __init6() {this.isAuthenticated = computed(() => {
    const user = this.currentUser();
    return user !== null && !this.isTokenExpired(user.token);
  })}

  constructor( http) {;this.http = http;AuthService.prototype.__init.call(this);AuthService.prototype.__init2.call(this);AuthService.prototype.__init3.call(this);AuthService.prototype.__init4.call(this);AuthService.prototype.__init5.call(this);AuthService.prototype.__init6.call(this);}

  register(
    payload,
  ) {
    return this.http
      .post

(`${this.apiBaseUrl}/Auth`, payload)
      .pipe(
        map((response) => {
          if (!response.isSuccess) {
            throw new Error(response.message || "ثبت نام انجام نشد");
          }

          return response;
        }),
        catchError((error) =>
          throwError(() => this.toUserFacingError(error, "خطا در ثبت نام")),
        ),
      );
  }

  registerPushToken(
    deviceToken,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/Auth/RegisterPushToken`,
        { deviceToken },
        { headers: this.authHeaders() },
      )
      .pipe(
        map((response) => {
          if (!response.isSuccess) {
            throw new Error(response.message || "ثبت توکن نوتیفیکیشن انجام نشد");
          }

          return response;
        }),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(error, "ثبت توکن نوتیفیکیشن انجام نشد"),
          ),
        ),
      );
  }

  forgotPassword(
    phoneNumber,
    newPassword,
  ) {
    const payload = { phoneNumber, newPasswordHash: newPassword };

    return this.http
      .post

(`${this.apiBaseUrl}/Auth/ForgotPassword`, payload)
      .pipe(
        map((response) => {
          if (!response.isSuccess) {
            throw new Error(response.message || "تغییر رمز عبور انجام نشد");
          }

          return response;
        }),
        catchError((error) =>
          throwError(() =>
            this.toUserFacingError(error, "خطا در تغییر رمز عبور"),
          ),
        ),
      );
  }

  login(phoneNumber, password) {
    const payload = { phoneNumber, passwordHash: password };

    return this.http
      .post

(`${this.apiBaseUrl}/Auth/Login`, payload)
      .pipe(
        map((response) => {
          if (!response.isSuccess) {
            throw new Error(response.message || "ورود انجام نشد");
          }

          const token = this.extractToken(response);
          if (!token) {
            throw new Error("توکن ورود از سمت سرور دریافت نشد");
          }

          const decodedUser = this.userFromToken(token, response.data);
          const apiRoles = this.extractRolesFromResponseData(response.data).map(
            (role) => this.normalizeRole(role),
          );
          if (apiRoles.length) {
            const sortedRoles = this.sortDashboardRoles(apiRoles);
            decodedUser.roles = sortedRoles;
            decodedUser.role = sortedRoles[0];
            decodedUser.roleName = this.roleNameFromAuthRole(sortedRoles[0]);
          }
          this.saveSession(decodedUser);
          return decodedUser;
        }),
        catchError((error) =>
          throwError(() => this.toUserFacingError(error, "خطا در ورود")),
        ),
      );
  }

  logout() {
    const token = this.authToken();
    if (token) {
      this.http
        .post(
          `${environment.apiBaseUrl}/Auth/Logout`,
          {},
          {
            headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
          },
        )
        .subscribe({ error: () => undefined });
    }

    this.clearSession();
  }

  invalidateSession() {
    this.clearSession();
  }

  updateConsultantProfile(profileId, isCompleteProfile = true) {
    const user = this.currentUser();
    if (!user) return;

    this.saveSession({
      ...user,
      profileId,
      consultantProfileId: profileId,
      isCompleteProfile,
    });
  }

  updateSecretaryProfile(isCompleteProfile = true) {
    const user = this.currentUser();
    if (!user) return;

    this.saveSession({
      ...user,
      isCompleteProfile,
    });
  }

  isRoleProfileComplete(
    user = this.currentUser(),
    role,
  ) {
    if (!user) return false;

    const checkRole = _nullishCoalesce(role, () => ( user.role));

    if (checkRole === "consultant") {
      const profileId = _nullishCoalesce(user.consultantProfileId, () => ( user.profileId));
      return Boolean(profileId) && user.isCompleteProfile === true;
    }

    if (checkRole === "secretary") {
      return Boolean(user.userId) && user.isCompleteProfile === true;
    }

    return true;
  }

  hasRole(role, user = this.currentUser()) {
    return _nullishCoalesce(_optionalChain([user, 'optionalAccess', _ => _.roles, 'optionalAccess', _2 => _2.includes, 'call', _3 => _3(role)]), () => ( false));
  }

  selectableDashboardRoles(
    user = this.currentUser(),
  ) {
    if (!_optionalChain([user, 'optionalAccess', _4 => _4.roles, 'optionalAccess', _5 => _5.length])) return [];

    const uniqueRoles = [
      ...new Set(
        user.roles.filter((role) => this.dashboardRolePriority.includes(role)),
      ),
    ];

    return uniqueRoles.sort(
      (left, right) =>
        this.dashboardRolePriority.indexOf(left) -
        this.dashboardRolePriority.indexOf(right),
    );
  }

  needsRoleSelection(user = this.currentUser()) {
    return this.selectableDashboardRoles(user).length > 1;
  }

  setActiveRole(role) {
    const user = this.currentUser();
    if (!user || !this.hasRole(role, user)) return;

    this.saveSession({
      ...user,
      role,
      roleName: this.roleNameFromAuthRole(role),
    });
  }

  dashboardUrl(
    user = this.currentUser(),
    role,
  ) {
    if (!user) return "/";

    const activeRole = _nullishCoalesce(role, () => ( user.role));
    const base = `/dashboard/${activeRole}`;
    if (!this.isRoleProfileComplete(user, activeRole) && activeRole === "consultant") {
      return `${base}?section=profile`;
    }

    return base;
  }

  roleSelectionUrl() {
    return "/select-dashboard";
  }

  authToken() {
    const currentToken = _optionalChain([this, 'access', _6 => _6.currentUser, 'call', _7 => _7(), 'optionalAccess', _8 => _8.token]);
    if (_optionalChain([currentToken, 'optionalAccess', _9 => _9.trim, 'call', _10 => _10()])) {
      if (this.isTokenExpired(currentToken)) {
        this.clearSession();
        return null;
      }
      return currentToken;
    }

    const storedToken = this.readStoredToken();
    if (storedToken && this.isTokenExpired(storedToken)) {
      this.clearSession();
      return null;
    }
    return storedToken;
  }

  roleLabel(role, language) {
    const labels = {
      admin: { fa: "ادمین", en: "Admin" },
      consultant: { fa: "مشاور", en: "Consultant" },
      secretary: { fa: "منشی", en: "Secretary" },
      patient: { fa: "بیمار", en: "Patient" },
    };

    return labels[role][language];
  }

   extractToken(
    response,
  ) {
    const root = response 




;

    if (typeof response.data === "string") return response.data;
    if (_optionalChain([response, 'access', _11 => _11.data, 'optionalAccess', _12 => _12.accessToken])) return response.data.accessToken;
    if (_optionalChain([response, 'access', _13 => _13.data, 'optionalAccess', _14 => _14.token])) return response.data.token;
    if (_optionalChain([response, 'access', _15 => _15.data, 'optionalAccess', _16 => _16.access_token])) return response.data.access_token;
    if (_optionalChain([response, 'access', _17 => _17.data, 'optionalAccess', _18 => _18.jwt])) return response.data.jwt;
    return (
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(root.accessToken, () => ( root.token)), () => ( root.access_token)), () => ( root.jwt)), () => ( null))
    );
  }

   userFromToken(
    token,
    responseData,
  ) {
    const claims = this.decodeJwtPayload(token);
    const data =
      typeof responseData === "object" && responseData !== null
        ? responseData
        : {};
    const roleName =
      _nullishCoalesce(_nullishCoalesce(this.claimValue(claims, [
        "role",
        "Role",
        "roles",
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
      ]), () => (
      data.role)), () => (
      "Patient"));
    const roles = this.extractAllRoles(claims, data);

    return {
      token,
      firstName:
        _nullishCoalesce(_nullishCoalesce(this.claimValue(claims, [
          "firstName",
          "FirstName",
          "given_name",
          "name",
        ]), () => (
        data.firstName)), () => (
        "")),
      lastName:
        _nullishCoalesce(_nullishCoalesce(this.claimValue(claims, [
          "lastName",
          "LastName",
          "family_name",
          "surname",
        ]), () => (
        data.lastName)), () => (
        "")),
      phoneNumber: this.claimValue(claims, [
        "phoneNumber",
        "PhoneNumber",
        "phone_number",
        "phone",
      ]),
      userId:
        _nullishCoalesce(this.claimValue(claims, [
          "userId",
          "UserId",
          "sub",
          "nameid",
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
        ]), () => ( this.dataString(data, "userId", "UserId"))),
      profileId:
        _nullishCoalesce(this.claimNumber(claims, [
          "profileId",
          "ProfileId",
          "consultantProfileId",
          "ConsultantProfileId",
        ]), () => (
        this.dataNumber(
          data,
          "profileId",
          "ProfileId",
          "consultantProfileId",
          "ConsultantProfileId",
        ))),
      consultantProfileId:
        _nullishCoalesce(this.claimNumber(claims, [
          "consultantProfileId",
          "ConsultantProfileId",
          "profileId",
          "ProfileId",
        ]), () => (
        this.dataNumber(
          data,
          "consultantProfileId",
          "ConsultantProfileId",
          "profileId",
          "ProfileId",
        ))),
      isCompleteProfile:
        _nullishCoalesce(this.claimBoolean(claims, [
          "isCompleteProfile",
          "IsCompleteProfile",
          "profileComplete",
          "ProfileComplete",
        ]), () => ( this.dataBoolean(data, "isCompleteProfile"))),
      secretaryType:
        _nullishCoalesce(this.claimValue(claims, ["secretaryType", "SecretaryType"]), () => (
        this.dataString(data, "secretaryType", "SecretaryType"))),
      allowedDays: this.stringList(
        _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(claims["allowedDays"], () => (
          claims["AllowedDays"])), () => (
          data["allowedDays"])), () => (
          data["AllowedDays"])),
      ),
      secretaryPermissions: this.stringList(
        _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(claims["permissions"], () => (
          claims["Permissions"])), () => (
          data["permissions"])), () => (
          data["Permissions"])),
      ),
      roleName,
      role: _nullishCoalesce(roles[0], () => ( this.normalizeRole(roleName))),
      roles,
    };
  }

   extractAllRoles(
    claims,
    data,
  ) {
    const rawRoles = [
      ...this.claimValues(claims, [
        "role",
        "Role",
        "roles",
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
      ]),
      ...this.extractRolesFromResponseData(data),
    ];

    const normalized = rawRoles
      .map((role) => this.normalizeRole(role))
      .filter((role, index, roles) => roles.indexOf(role) === index);

    return this.sortDashboardRoles(normalized);
  }

   extractRolesFromResponseData(
    responseData,
  ) {
    if (!responseData || typeof responseData !== "object") return [];

    const data = responseData ;
    const roles = _nullishCoalesce(data["roles"], () => ( data["Roles"]));
    if (!Array.isArray(roles)) return [];

    return roles
      .filter((role) => typeof role === "string" && !!role.trim())
      .map((role) => role.trim());
  }

   sortDashboardRoles(roles) {
    if (!roles.length) return ["patient"];

    return [...roles].sort(
      (left, right) =>
        this.dashboardRolePriority.indexOf(left) -
        this.dashboardRolePriority.indexOf(right),
    );
  }

   roleNameFromAuthRole(role) {
    const roleNames = {
      admin: "Admin",
      consultant: "Consultant",
      secretary: "Secretary",
      patient: "Patient",
    };

    return roleNames[role];
  }

   normalizeRole(role) {
    const normalized = role.trim().toLowerCase();

    if (["admin", "administrator", "ادمین"].includes(normalized))
      return "admin";
    if (["consultant", "advisor", "مشاور"].includes(normalized))
      return "consultant";
    if (["secretary", "منشی"].includes(normalized)) return "secretary";
    if (
      ["patient", "normaluser", "user", "بیمار", "کاربر"].includes(normalized)
    )
      return "patient";
    return "patient";
  }

   decodeJwtPayload(token) {
    try {
      const payload = token.split(".")[1];
      if (!payload) return {};

      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(
        Math.ceil(normalized.length / 4) * 4,
        "=",
      );
      const decoded = atob(padded);
      const bytes = Uint8Array.from(decoded, (character) =>
        character.charCodeAt(0),
      );
      const json = new TextDecoder().decode(bytes);
      return JSON.parse(json) ;
    } catch (e) {
      return {};
    }
  }

   claimValue(
    claims,
    keys,
  ) {
    for (const key of keys) {
      const value = claims[key];
      if (typeof value === "string" && value.trim()) return value;
      if (
        Array.isArray(value) &&
        typeof value[0] === "string" &&
        value[0].trim()
      )
        return value[0];
    }

    return undefined;
  }

   claimValues(
    claims,
    keys,
  ) {
    const values = [];

    for (const key of keys) {
      const value = claims[key];
      if (typeof value === "string" && value.trim()) {
        values.push(value.trim());
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === "string" && item.trim()) values.push(item.trim());
        }
      }
    }

    return values;
  }

   stringList(value) {
    const values = Array.isArray(value)
      ? value
      : typeof value === "string"
        ? value.split(",")
        : [];
    const normalized = values
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
    return normalized.length ? normalized : undefined;
  }

   claimNumber(
    claims,
    keys,
  ) {
    for (const key of keys) {
      const value = claims[key];
      const numeric =
        typeof value === "number"
          ? value
          : typeof value === "string"
            ? Number(value)
            : NaN;
      if (Number.isFinite(numeric) && numeric > 0) return numeric;
    }

    return undefined;
  }

   claimBoolean(
    claims,
    keys,
  ) {
    for (const key of keys) {
      const value = claims[key];
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "1", "yes"].includes(normalized)) return true;
        if (["false", "0", "no"].includes(normalized)) return false;
      }
    }

    return undefined;
  }

   dataNumber(
    data,
    ...keys
  ) {
    for (const key of keys) {
      const value = data[key];
      const numeric =
        typeof value === "number"
          ? value
          : typeof value === "string"
            ? Number(value)
            : NaN;
      if (Number.isFinite(numeric) && numeric > 0) return numeric;
    }

    return undefined;
  }

   dataString(
    data,
    ...keys
  ) {
    for (const key of keys) {
      const value = data[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }

    return undefined;
  }

   dataBoolean(
    data,
    ...keys
  ) {
    for (const key of keys) {
      const value = data[key];
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "1", "yes"].includes(normalized)) return true;
        if (["false", "0", "no"].includes(normalized)) return false;
      }
    }

    return undefined;
  }

   saveSession(user) {
    this.currentUser.set(user);

    try {
      const { token, ...sessionUser } = user;
      const session = { token, user: sessionUser };
      localStorage.setItem(this.sessionStorageKey, JSON.stringify(session));
    } catch (e2) {
      // The in-memory session remains available until page refresh.
    }
  }

   readStoredToken() {
    const storageKeys = [
      "clinic-auth-session",
      "token",
      "accessToken",
      "authToken",
      "jwt",
    ];

    try {
      for (const storage of [localStorage, sessionStorage]) {
        for (const key of storageKeys) {
          const token = this.extractTokenFromStoredValue(storage.getItem(key));
          if (token) return token;
        }
      }
    } catch (e3) {
      return null;
    }

    return null;
  }

   extractTokenFromStoredValue(value) {
    if (!value) return null;

    const trimmed = value.trim();
    if (!trimmed) return null;
    if (this.looksLikeJwt(trimmed)) return trimmed;

    try {
      return this.findTokenInObject(JSON.parse(trimmed));
    } catch (e4) {
      return null;
    }
  }

   findTokenInObject(value, depth = 0) {
    if (depth > 4 || value === null || value === undefined) return null;
    if (typeof value === "string")
      return this.looksLikeJwt(value) ? value : null;
    if (typeof value !== "object") return null;

    const record = value ;
    for (const key of ["token", "accessToken", "access_token", "jwt"]) {
      const token = record[key];
      if (typeof token === "string" && token.trim()) return token.trim();
    }

    for (const nested of Object.values(record)) {
      const token = this.findTokenInObject(nested, depth + 1);
      if (token) return token;
    }

    return null;
  }

   looksLikeJwt(value) {
    return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(
      value.trim(),
    );
  }

   isTokenExpired(token) {
    const expiration = this.decodeJwtPayload(token)["exp"];
    const expirationSeconds =
      typeof expiration === "number" ? expiration : Number(expiration);

    return Number.isFinite(expirationSeconds) &&
      expirationSeconds * 1000 <= Date.now();
  }

   clearSession() {
    this.currentUser.set(null);
    try {
      localStorage.removeItem(this.sessionStorageKey);
    } catch (e5) {
      // The in-memory session is still cleared when storage is unavailable.
    }
  }

   hasJwtRoleClaim(token) {
    const claims = this.decodeJwtPayload(token);
    return Boolean(
      this.claimValue(claims, [
        "role",
        "Role",
        "roles",
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
      ]),
    );
  }

   readSession() {
    try {
      const rawSession = localStorage.getItem(this.sessionStorageKey);
      if (!rawSession) return null;

      const session = JSON.parse(rawSession) ;
      if (!session.token || !session.user) return null;
      if (this.isTokenExpired(session.token)) {
        localStorage.removeItem(this.sessionStorageKey);
        return null;
      }

      const tokenUser = this.userFromToken(session.token, null);

      const isCompleteProfile =
        session.user.isCompleteProfile === true ||
        tokenUser.isCompleteProfile === true
          ? true
          : (_nullishCoalesce(tokenUser.isCompleteProfile, () => ( session.user.isCompleteProfile)));

      return {
        ...tokenUser,
        ...session.user,
        firstName: tokenUser.firstName || session.user.firstName,
        lastName: tokenUser.lastName || session.user.lastName,
        phoneNumber: tokenUser.phoneNumber || session.user.phoneNumber,
        userId: tokenUser.userId || session.user.userId,
        profileId: _nullishCoalesce(tokenUser.profileId, () => ( session.user.profileId)),
        consultantProfileId:
          _nullishCoalesce(tokenUser.consultantProfileId, () => ( session.user.consultantProfileId)),
        isCompleteProfile,
        roleName: tokenUser.roleName || session.user.roleName,
        roles: this.sortDashboardRoles(
          [
            ...(_nullishCoalesce(tokenUser.roles, () => ( []))),
            ...(_nullishCoalesce(session.user.roles, () => ( []))),
            _nullishCoalesce(session.user.role, () => ( tokenUser.role)),
          ].filter((role) => Boolean(role)),
        ),
        role: this.hasJwtRoleClaim(session.token)
          ? tokenUser.role
          : (_nullishCoalesce(session.user.role, () => ( tokenUser.role))),
        token: session.token,
      };
    } catch (e6) {
      return null;
    }
  }

   authHeaders() {
    const token = this.authToken();
    const headers = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return new HttpHeaders(headers);
  }

   toUserFacingError(error, fallback) {
    if (error instanceof Error && error.message) return error;
    if (typeof error === "object" && error !== null && "error" in error) {
      const httpError = error 


;
      if (typeof httpError.error === "object" && _optionalChain([httpError, 'access', _19 => _19.error, 'optionalAccess', _20 => _20.message]))
        return new Error(httpError.error.message);
      if (typeof httpError.error === "string" && httpError.error)
        return new Error(httpError.error);
      if (httpError.message) return new Error(httpError.message);
    }

    return new Error(fallback);
  }
}
