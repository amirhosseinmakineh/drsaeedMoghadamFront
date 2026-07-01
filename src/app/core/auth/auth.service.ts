import { HttpClient } from "@angular/common/http";
import { Injectable, computed, signal } from "@angular/core";
import { Observable, catchError, map, throwError } from "rxjs";
import { environment } from "../../../environments/environment";

export type AuthRole = "admin" | "consultant" | "secretary" | "patient";

export interface AuthUser {
  firstName: string;
  lastName: string;
  role: AuthRole;
  roleName: string;
  token: string;
  userId?: string;
  phoneNumber?: string;
  profileId?: number;
  consultantProfileId?: number;
  isCompleteProfile?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  passwordHash: string;
  isCompleteProfile: boolean;
  avatarImageName: string | null;
  gender: number;
  birthDate?: string;
  roleName?: string;
  reservationId?: number;
  nationalCode?: string;
  address?: string;
  emergencyPhoneNumber?: string | null;
  insuranceName?: string | null;
  notes?: string | null;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

type LoginPayload = {
  phoneNumber: string;
  passwordHash: string;
};

type TokenResponseData =
  | string
  | {
      token?: string;
      accessToken?: string;
      access_token?: string;
      jwt?: string;
      userId?: string;
      role?: string;
      firstName?: string;
      lastName?: string;
      profileId?: number | string;
      consultantProfileId?: number | string;
      isCompleteProfile?: boolean | string;
    };

interface StoredSession {
  token: string;
  user: Omit<AuthUser, "token">;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly sessionStorageKey = "clinic-auth-session";
  private readonly currentUser = signal<AuthUser | null>(this.readSession());

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  constructor(private http: HttpClient) {}

  register(
    payload: RegisterRequest,
  ): Observable<ApiResponse<{ userId: string; role: string } | null>> {
    return this.http
      .post<
        ApiResponse<{ userId: string; role: string } | null>
      >(`${this.apiBaseUrl}/Auth`, payload)
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

  login(phoneNumber: string, password: string): Observable<AuthUser> {
    const payload: LoginPayload = { phoneNumber, passwordHash: password };

    return this.http
      .post<
        ApiResponse<TokenResponseData | null>
      >(`${this.apiBaseUrl}/Auth/Login`, payload)
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
          this.saveSession(decodedUser);
          return decodedUser;
        }),
        catchError((error) =>
          throwError(() => this.toUserFacingError(error, "خطا در ورود")),
        ),
      );
  }

  logout(): void {
    this.currentUser.set(null);

    try {
      localStorage.removeItem(this.sessionStorageKey);
    } catch {
      // Auth state is still cleared in memory when storage is unavailable.
    }
  }

  updateConsultantProfile(profileId: number, isCompleteProfile = true): void {
    const user = this.currentUser();
    if (!user) return;

    this.saveSession({
      ...user,
      profileId,
      consultantProfileId: profileId,
      isCompleteProfile,
    });
  }

  updateSecretaryProfile(isCompleteProfile = true): void {
    const user = this.currentUser();
    if (!user) return;

    this.saveSession({
      ...user,
      isCompleteProfile,
    });
  }

  dashboardUrl(user: AuthUser | null = this.currentUser()): string {
    if (!user) return "/";

    return `/dashboard/${user.role}`;
  }

  authToken(): string | null {
    const currentToken = this.currentUser()?.token;
    if (currentToken?.trim()) return currentToken;

    return this.readStoredToken();
  }

  roleLabel(role: AuthRole, language: "fa" | "en"): string {
    const labels: Record<AuthRole, { fa: string; en: string }> = {
      admin: { fa: "ادمین", en: "Admin" },
      consultant: { fa: "مشاور", en: "Consultant" },
      secretary: { fa: "منشی", en: "Secretary" },
      patient: { fa: "بیمار", en: "Patient" },
    };

    return labels[role][language];
  }

  private extractToken(
    response: ApiResponse<TokenResponseData | null>,
  ): string | null {
    const root = response as ApiResponse<TokenResponseData | null> & {
      token?: string;
      accessToken?: string;
      access_token?: string;
      jwt?: string;
    };

    if (typeof response.data === "string") return response.data;
    if (response.data?.accessToken) return response.data.accessToken;
    if (response.data?.token) return response.data.token;
    if (response.data?.access_token) return response.data.access_token;
    if (response.data?.jwt) return response.data.jwt;
    return (
      root.accessToken ?? root.token ?? root.access_token ?? root.jwt ?? null
    );
  }

  private userFromToken(
    token: string,
    responseData: TokenResponseData | null,
  ): AuthUser {
    const claims = this.decodeJwtPayload(token);
    const data =
      typeof responseData === "object" && responseData !== null
        ? responseData
        : {};
    const roleName =
      this.claimValue(claims, [
        "role",
        "Role",
        "roles",
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
      ]) ??
      data.role ??
      "Patient";

    return {
      token,
      firstName:
        this.claimValue(claims, [
          "firstName",
          "FirstName",
          "given_name",
          "name",
        ]) ??
        data.firstName ??
        "",
      lastName:
        this.claimValue(claims, [
          "lastName",
          "LastName",
          "family_name",
          "surname",
        ]) ??
        data.lastName ??
        "",
      phoneNumber: this.claimValue(claims, [
        "phoneNumber",
        "PhoneNumber",
        "phone_number",
        "phone",
      ]),
      userId:
        this.claimValue(claims, [
          "userId",
          "UserId",
          "sub",
          "nameid",
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
        ]) ?? data.userId,
      profileId:
        this.claimNumber(claims, [
          "profileId",
          "ProfileId",
          "consultantProfileId",
          "ConsultantProfileId",
        ]) ?? this.dataNumber(data, "profileId", "consultantProfileId"),
      consultantProfileId:
        this.claimNumber(claims, [
          "consultantProfileId",
          "ConsultantProfileId",
          "profileId",
          "ProfileId",
        ]) ?? this.dataNumber(data, "consultantProfileId", "profileId"),
      isCompleteProfile:
        this.claimBoolean(claims, [
          "isCompleteProfile",
          "IsCompleteProfile",
          "profileComplete",
          "ProfileComplete",
        ]) ?? this.dataBoolean(data, "isCompleteProfile"),
      roleName,
      role: this.normalizeRole(roleName),
    };
  }

  private normalizeRole(role: string): AuthRole {
    const normalized = role.trim().toLowerCase();

    if (["admin", "administrator", "ادمین"].includes(normalized))
      return "admin";
    if (["consultant", "advisor", "مشاور"].includes(normalized))
      return "consultant";
    if (["secretary", "منشی"].includes(normalized)) return "secretary";
    return "patient";
  }

  private decodeJwtPayload(token: string): Record<string, unknown> {
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
      return JSON.parse(json) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  private claimValue(
    claims: Record<string, unknown>,
    keys: string[],
  ): string | undefined {
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

  private claimNumber(
    claims: Record<string, unknown>,
    keys: string[],
  ): number | undefined {
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

  private claimBoolean(
    claims: Record<string, unknown>,
    keys: string[],
  ): boolean | undefined {
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

  private dataNumber(
    data: Record<string, unknown>,
    ...keys: string[]
  ): number | undefined {
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

  private dataBoolean(
    data: Record<string, unknown>,
    ...keys: string[]
  ): boolean | undefined {
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

  private saveSession(user: AuthUser): void {
    this.currentUser.set(user);

    try {
      const { token, ...sessionUser } = user;
      const session: StoredSession = { token, user: sessionUser };
      localStorage.setItem(this.sessionStorageKey, JSON.stringify(session));
    } catch {
      // The in-memory session remains available until page refresh.
    }
  }

  private readStoredToken(): string | null {
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
    } catch {
      return null;
    }

    return null;
  }

  private extractTokenFromStoredValue(value: string | null): string | null {
    if (!value) return null;

    const trimmed = value.trim();
    if (!trimmed) return null;
    if (this.looksLikeJwt(trimmed)) return trimmed;

    try {
      return this.findTokenInObject(JSON.parse(trimmed));
    } catch {
      return null;
    }
  }

  private findTokenInObject(value: unknown, depth = 0): string | null {
    if (depth > 4 || value === null || value === undefined) return null;
    if (typeof value === "string")
      return this.looksLikeJwt(value) ? value : null;
    if (typeof value !== "object") return null;

    const record = value as Record<string, unknown>;
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

  private looksLikeJwt(value: string): boolean {
    return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(
      value.trim(),
    );
  }

  private readSession(): AuthUser | null {
    try {
      const rawSession = localStorage.getItem(this.sessionStorageKey);
      if (!rawSession) return null;

      const session = JSON.parse(rawSession) as StoredSession;
      if (!session.token || !session.user) return null;

      const tokenUser = this.userFromToken(session.token, null);

      return {
        ...tokenUser,
        ...session.user,
        firstName: tokenUser.firstName || session.user.firstName,
        lastName: tokenUser.lastName || session.user.lastName,
        phoneNumber: tokenUser.phoneNumber || session.user.phoneNumber,
        userId: tokenUser.userId || session.user.userId,
        profileId: session.user.profileId ?? tokenUser.profileId,
        consultantProfileId:
          session.user.consultantProfileId ?? tokenUser.consultantProfileId,
        isCompleteProfile:
          session.user.isCompleteProfile ?? tokenUser.isCompleteProfile,
        roleName: session.user.roleName || tokenUser.roleName,
        role: session.user.role || tokenUser.role,
        token: session.token,
      };
    } catch {
      return null;
    }
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
