import { PatientPaperRecord } from "./patient-paper-intake.models";
import { SecretaryReservation, ReviewAttendanceRequest } from "../../../core/secretary/secretary-dashboard.service";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { AuthService } from "../../../core/auth/auth.service";
import { environment } from "../../../../environments/environment";
import {
  CreatePatientFileRequest,
  CompletePatientFileRequest,
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

  getServiceResults(fileId: number, page = 1) {
    return this.http.get<{ items: SecretaryReservation[]; pageNumber: number; totalPages: number;
      totalCount: number; reviewableReservationIds: number[] }>(`${this.endpoint}/${fileId}/service-results`, {
      headers: this.authHeaders(), params: new HttpParams().set("page", page),
    });
  }

  reviewServiceResult(fileId: number, body: ReviewAttendanceRequest) {
    return this.http.post<{ isSuccess: boolean; message: string }>(`${this.endpoint}/${fileId}/service-results`, body,
      { headers: this.authHeaders() });
  }

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  completeFinance(patientFileId: number, body: CompletePatientFileRequest) {
    return this.http.post<{ financialCaseId: string }>(`${this.endpoint}/${patientFileId}/complete-finance`, body, { headers: this.authHeaders() });
  }

  getFinanceEdit(patientFileId: number) {
    return this.http.get<{ expectedFinanceHash: string; finance: CompletePatientFileRequest }>(
      `${this.endpoint}/${patientFileId}/finance-edit`, { headers: this.authHeaders() });
  }

  updateFinance(patientFileId: number, body: { expectedFinanceHash: string; finance: CompletePatientFileRequest }) {
    return this.http.put<{ financialCaseId: string }>(`${this.endpoint}/${patientFileId}/finance-edit`, body,
      { headers: this.authHeaders() });
  }

  confirmFinance(patientFileId: number) {
    return this.http.post<{ financeConfirmedAtUtc: string }>(`${this.endpoint}/${patientFileId}/confirm-finance`, {}, { headers: this.authHeaders() });
  }

  confirmProfile(patientFileId: number) {
    return this.http.post<{ profileConfirmedAtUtc: string }>(`${this.endpoint}/${patientFileId}/confirm-profile`, {}, { headers: this.authHeaders() });
  }

  approveService(patientFileId: number) {
    return this.http.post<{ approvedAtUtc: string }>(`${this.endpoint}/${patientFileId}/approve-service`, {}, { headers: this.authHeaders() });
  }

  linkFinance(patientFileId: number, financialCaseId: string) {
    return this.http.post<{ financialCaseId: string }>(`${this.endpoint}/${patientFileId}/link-finance`, { financialCaseId }, { headers: this.authHeaders() });
  }

  getPaperRecord(patientFileId: number): Observable<PatientPaperRecord> {
    return this.http.get<PatientPaperRecord>(`${this.endpoint}/${patientFileId}/paper-record`, {
      headers: this.authHeaders(),
    });
  }

  savePaperRecord(patientFileId: number, record: PatientPaperRecord): Observable<{ patientFileId: number; updatedAtUtc: string }> {
    return this.http.put<{ patientFileId: number; updatedAtUtc: string }>(
      `${this.endpoint}/${patientFileId}/paper-record`, record, { headers: this.authHeaders() });
  }

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
