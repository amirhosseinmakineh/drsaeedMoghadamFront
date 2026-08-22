import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, map, throwError } from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthService } from "../auth/auth.service";

export interface PaginatedResponse<T> { items: T[]; page: number; pageSize: number; totalCount: number; }
export interface PatientSearchItem { patientId: number; patientName: string; phoneNumber: string; }
export interface PatientFollowUpInfo extends PatientSearchItem { consultantId: number; consultantName: string; reservationId: number; reservationDate: string; reservationTime: string; }
export interface SecretaryFollowUp { id: number; patientId: number; patientName: string; phoneNumber: string; consultantName: string; reservationDate: string; reservationTime: string; contacted: boolean; contactResult: string; createdAt: string; }
export interface CreateSecretaryFollowUpRequest { patientId: number; contacted: boolean; contactResult: string; }
export interface UpdateSecretaryFollowUpRequest { contacted: boolean; contactResult: string; }
export interface ConsultantFollowUp extends Omit<SecretaryFollowUp, "consultantName"> { secretaryName: string; }

@Injectable({ providedIn: "root" })
export class FollowUpService {
  private readonly baseUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient, private auth: AuthService) {}

  searchPatients(search: string, page = 1, pageSize = 20): Observable<PaginatedResponse<PatientSearchItem>> { return this.getPage(`${this.baseUrl}/secretary/follow-ups/patients`, { search, page, pageSize }, "جستجوی بیماران انجام نشد"); }
  getPatientFollowUpInfo(patientId: number): Observable<PatientFollowUpInfo> { return this.http.get<unknown>(`${this.baseUrl}/secretary/follow-ups/patients/${patientId}`, { headers: this.headers() }).pipe(map(response => this.unwrap<PatientFollowUpInfo>(response)), catchError(error => this.error(error, "دریافت اطلاعات بیمار انجام نشد"))); }
  getSecretaryFollowUps(page: number, pageSize: number, search: string): Observable<PaginatedResponse<SecretaryFollowUp>> { return this.getPage(`${this.baseUrl}/secretary/follow-ups`, { page, pageSize, search }, "دریافت دفترچه پیگیری انجام نشد"); }
  getSecretaryFollowUpById(id: number): Observable<SecretaryFollowUp> { return this.http.get<unknown>(`${this.baseUrl}/secretary/follow-ups/${id}`, { headers: this.headers() }).pipe(map(response => this.unwrap<SecretaryFollowUp>(response)), catchError(error => this.error(error, "دریافت پیگیری انجام نشد"))); }
  createSecretaryFollowUp(payload: CreateSecretaryFollowUpRequest): Observable<SecretaryFollowUp> { return this.http.post<unknown>(`${this.baseUrl}/secretary/follow-ups`, payload, { headers: this.headers() }).pipe(map(response => this.unwrap<SecretaryFollowUp>(response)), catchError(error => this.error(error, "ثبت پیگیری انجام نشد"))); }
  updateSecretaryFollowUp(id: number, payload: UpdateSecretaryFollowUpRequest): Observable<SecretaryFollowUp> { return this.http.put<unknown>(`${this.baseUrl}/secretary/follow-ups/${id}`, payload, { headers: this.headers() }).pipe(map(response => this.unwrap<SecretaryFollowUp>(response)), catchError(error => this.error(error, "ویرایش پیگیری انجام نشد"))); }
  deleteSecretaryFollowUp(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/secretary/follow-ups/${id}`, { headers: this.headers() }).pipe(catchError(error => this.error(error, "حذف پیگیری انجام نشد"))); }
  getConsultantFollowUps(page: number, pageSize: number, search: string): Observable<PaginatedResponse<ConsultantFollowUp>> { return this.getPage(`${this.baseUrl}/consultant/follow-ups`, { page, pageSize, search }, "دریافت پیگیری‌های منشی انجام نشد"); }

  private getPage<T>(
    url: string,
    query: Record<string, string | number>,
    fallback: string,
  ): Observable<PaginatedResponse<T>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== "") params = params.set(key, String(value));
    });

    return this.http.get<unknown>(url, { headers: this.headers(), params }).pipe(
      map((response) => {
        const value = this.unwrap<Record<string, unknown>>(response);
        const rawItems = value["items"];
        const items = Array.isArray(rawItems) ? (rawItems as T[]) : [];

        return {
          items,
          page: Number(value["page"] ?? query["page"] ?? 1),
          pageSize: Number(value["pageSize"] ?? query["pageSize"] ?? 20),
          totalCount: Number(value["totalCount"] ?? items.length),
        };
      }),
      catchError((error) => this.error(error, fallback)),
    );
  }
  private unwrap<T>(response: unknown): T { const root = response as Record<string, unknown>; return (root?.["data"] ?? root?.["Data"] ?? response) as T; }
  private headers(): HttpHeaders { const token = this.auth.authToken(); return new HttpHeaders(token ? { Accept: "application/json", Authorization: `Bearer ${token}` } : { Accept: "application/json" }); }
  private error(error: unknown, fallback: string): Observable<never> { const item = error as { error?: { message?: string }; message?: string }; return throwError(() => new Error(item?.error?.message || item?.message || fallback)); }
}
