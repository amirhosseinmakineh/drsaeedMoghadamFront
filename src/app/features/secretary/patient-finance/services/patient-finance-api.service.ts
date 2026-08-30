import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "../../../../core/auth/auth.service";
import { environment } from "../../../../../environments/environment";
import { ApiResult, CreateChequeRequest, CreateFinancialCaseRequest, CreatePromissoryNoteRequest, IdResponse, PageQuery, PaginatedResult, PatientCheque, PatientDebt, PatientFinancialCase, PatientFinancialCaseDetails, PatientFinancialCaseSummary, PatientFinancialCommitment, PatientFinancialTransaction, PatientPromissoryNote, UpdateFinancialCaseRequest } from "../models/patient-finance.models";

@Injectable({ providedIn: "root" })
export class PatientFinanceApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/secretary`;
  constructor(private readonly http: HttpClient, private readonly auth: AuthService) {}
  private options(query: PageQuery = {}) {
    const token = this.auth.user()?.token;
    return {
      headers: token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders(),
      params: this.params(query),
    };
  }
  private params(query: PageQuery = {}): HttpParams {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") params = params.set(key, String(value));
    });
    return params;
  }
  getCases(query: PageQuery) { return this.http.get<PaginatedResult<PatientFinancialCase>>(`${this.baseUrl}/patient-financial-cases`, this.options(query)); }
  getCase(id: number) { return this.http.get<PatientFinancialCaseDetails>(`${this.baseUrl}/patient-financial-cases/${id}`, this.options()); }
  getCaseSummary(id: number) { return this.http.get<PatientFinancialCaseSummary>(`${this.baseUrl}/patient-financial-cases/${id}/summary`, this.options()); }
  createCase(body: CreateFinancialCaseRequest) { return this.http.post<ApiResult<IdResponse>>(`${this.baseUrl}/patient-financial-cases`, body, this.options()); }
  updateCase(id: number, body: UpdateFinancialCaseRequest) { return this.http.put<ApiResult<IdResponse>>(`${this.baseUrl}/patient-financial-cases/${id}`, body, this.options()); }
  cancelCase(id: number) { return this.http.delete<ApiResult<IdResponse>>(`${this.baseUrl}/patient-financial-cases/${id}`, this.options()); }
  addCheque(caseId: number, body: CreateChequeRequest) { return this.http.post<ApiResult<IdResponse>>(`${this.baseUrl}/patient-financial-cases/${caseId}/cheques`, body, this.options()); }
  addPromissoryNote(caseId: number, body: CreatePromissoryNoteRequest) { return this.http.post<ApiResult<IdResponse>>(`${this.baseUrl}/patient-financial-cases/${caseId}/promissory-notes`, body, this.options()); }
  getCheques(query: PageQuery) { return this.http.get<PaginatedResult<PatientCheque>>(`${this.baseUrl}/patient-cheques`, this.options(query)); }
  updateChequeStatus(id: number, status: 2 | 3 | 4) { return this.http.put<ApiResult<IdResponse>>(`${this.baseUrl}/patient-cheques/${id}/status`, { status }, this.options()); }
  getPromissoryNotes(query: PageQuery) { return this.http.get<PaginatedResult<PatientPromissoryNote>>(`${this.baseUrl}/patient-promissory-notes`, this.options(query)); }
  updatePromissoryNoteStatus(id: number, status: 2 | 3 | 4) { return this.http.put<ApiResult<IdResponse>>(`${this.baseUrl}/patient-promissory-notes/${id}/status`, { status }, this.options()); }
  getDebts(query: PageQuery) { return this.http.get<PaginatedResult<PatientDebt>>(`${this.baseUrl}/patient-debts`, this.options(query)); }
  payDebt(id: number) { return this.http.post<ApiResult<IdResponse>>(`${this.baseUrl}/patient-debts/${id}/pay`, null, this.options()); }
  getTransactions(query: PageQuery) { return this.http.get<PaginatedResult<PatientFinancialTransaction>>(`${this.baseUrl}/patient-financial-transactions`, this.options(query)); }
  getDueCommitments(query: PageQuery) { return this.http.get<PaginatedResult<PatientFinancialCommitment>>(`${this.baseUrl}/patient-financial-commitments/due`, this.options(query)); }
}
