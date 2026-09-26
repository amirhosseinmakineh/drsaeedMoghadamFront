import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { AuthService } from "../../../core/auth/auth.service";
import { environment } from "../../../../environments/environment";
import {
  CreatePatientFileRequest,
  CreatePatientFileResult,
  EligiblePatient,
  EligiblePatientQuery,
  ImportPatientFilesResult,
  PagedResult,
  PatientFile,
  PatientFileFinancialIdentity,
  PatientFileQuery,
} from "./patient-file.models";

@Injectable({ providedIn: "root" })
export class PatientFilesService {
  private readonly endpoint = `${environment.apiBaseUrl}/secretary/patient-files`;

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  getPatientFiles(query: PatientFileQuery): Observable<PagedResult<PatientFile>> {
    return this.http.get<unknown>(this.endpoint, {
      headers: this.authHeaders(),
      params: this.params(query),
    }).pipe(
      map((response) => this.page<PatientFile>(response, query.page, query.pageSize)),
    );
  }

  getPatientFileById(id: number): Observable<PatientFile> {
    return this.http.get<unknown>(`${this.endpoint}/${id}`, { headers: this.authHeaders() })
      .pipe(map((response) => this.data<PatientFile>(response)));
  }

  createPatientFile(request: CreatePatientFileRequest): Observable<CreatePatientFileResult> {
    return this.http.post<unknown>(this.endpoint, request, { headers: this.authHeaders() })
      .pipe(map((response) => this.data<CreatePatientFileResult>(response)));
  }

  getEligiblePatients(query: EligiblePatientQuery): Observable<PagedResult<EligiblePatient>> {
    return this.http.get<unknown>(`${this.endpoint}/eligible-patients`, {
      headers: this.authHeaders(), params: this.params(query),
    }).pipe(map((response) => this.page<EligiblePatient>(response, query.page, query.pageSize)));
  }

  createFromReservation(patientId: number): Observable<CreatePatientFileResult> {
    return this.http.post<unknown>(`${this.endpoint}/from-reservation`, { patientId }, {
      headers: this.authHeaders(),
    }).pipe(map((response) => this.data<CreatePatientFileResult>(response)));
  }

  ensureFinancialIdentity(patientFileId: number): Observable<PatientFileFinancialIdentity> {
    return this.http.post<unknown>(`${this.endpoint}/${patientFileId}/financial-identity`, {}, {
      headers: this.authHeaders(),
    }).pipe(
      map((response) => this.data<PatientFileFinancialIdentity>(response)),
    );
  }

  updatePatientFile(id: number, body: Pick<PatientFile, "firstName" | "lastName" | "phoneNumber" | "description">): Observable<PatientFile> {
    return this.http.put<unknown>(`${this.endpoint}/${id}`, body, { headers: this.authHeaders() })
      .pipe(map((response) => this.data<PatientFile>(response)));
  }

  deletePatientFile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`, { headers: this.authHeaders() });
  }

  importLegacyPatientFiles(file: File): Observable<ImportPatientFilesResult> {
    const form = new FormData();
    form.append("file", file, file.name);
    return this.http.post<unknown>(`${this.endpoint}/import`, form, { headers: this.authHeaders() })
      .pipe(map((response) => this.data<ImportPatientFilesResult>(response)));
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth.user()?.token;
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  private params(query: object): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== "" && value !== null && value !== undefined) params = params.set(key, String(value));
    }
    return params;
  }

  private data<T>(response: unknown): T {
    const value = response as { data?: T; result?: T };
    return value?.data ?? value?.result ?? response as T;
  }

  private page<T>(response: unknown, page: number, pageSize: number): PagedResult<T> {
    const root = this.data<Record<string, unknown>>(response);
    const items = (root["items"] ?? root["data"] ?? []) as T[];
    return {
      items,
      totalCount: Number(root["totalCount"] ?? items.length),
      page: Number(root["page"] ?? root["pageNumber"] ?? page),
      pageSize: Number(root["pageSize"] ?? pageSize),
    };
  }
}
