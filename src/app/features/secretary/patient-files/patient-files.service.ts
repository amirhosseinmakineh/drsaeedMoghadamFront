import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  CreatePatientFileResult,
  EligiblePatient,
  EligiblePatientQuery,
  ImportPatientFilesResult,
  PagedResult,
  PatientFile,
  PatientFileQuery,
} from "./patient-file.models";

@Injectable({ providedIn: "root" })
export class PatientFilesService {
  private readonly endpoint = `${environment.apiBaseUrl}/secretary/patient-files`;

  constructor(private readonly http: HttpClient) {}

  getPatientFiles(query: PatientFileQuery): Observable<PagedResult<PatientFile>> {
    return this.http.get<unknown>(this.endpoint, { params: this.params(query) }).pipe(
      map((response) => this.page<PatientFile>(response, query.page, query.pageSize)),
    );
  }

  getPatientFileById(id: number): Observable<PatientFile> {
    return this.http.get<unknown>(`${this.endpoint}/${id}`).pipe(map((response) => this.data<PatientFile>(response)));
  }

  getEligiblePatients(query: EligiblePatientQuery): Observable<PagedResult<EligiblePatient>> {
    return this.http.get<unknown>(`${this.endpoint}/eligible-patients`, { params: this.params(query) }).pipe(
      map((response) => this.page<EligiblePatient>(response, query.page, query.pageSize)),
    );
  }

  createPatientFile(patientId: number): Observable<CreatePatientFileResult> {
    return this.http.post<unknown>(this.endpoint, { patientId }).pipe(map((response) => this.data<CreatePatientFileResult>(response)));
  }

  updatePatientFile(id: number, body: Pick<PatientFile, "firstName" | "lastName" | "phoneNumber">): Observable<PatientFile> {
    return this.http.put<unknown>(`${this.endpoint}/${id}`, body).pipe(map((response) => this.data<PatientFile>(response)));
  }

  deletePatientFile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

  importLegacyPatientFiles(file: File): Observable<ImportPatientFilesResult> {
    const form = new FormData();
    form.append("file", file, file.name);
    return this.http.post<unknown>(`${this.endpoint}/import`, form).pipe(map((response) => this.data<ImportPatientFilesResult>(response)));
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
