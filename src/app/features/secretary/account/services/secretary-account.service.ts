import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "../../../../core/auth/auth.service";
import { environment } from "../../../../../environments/environment";
import {
  ApiResponse,
  CreateSecretaryFinancialTransactionRequest,
  CreatedTransactionDto,
  GetSecretaryFinancialTransactionsRequest,
  SecretaryExpenseCategoryDto,
  SecretaryFinancialSummaryDto,
  SecretaryFinancialTransactionDto,
  SecretaryFinancialTransactionListDto,
} from "../models/secretary-account.models";

@Injectable({ providedIn: "root" })
export class SecretaryAccountService {
  private readonly baseUrl = `${environment.apiBaseUrl}/secretary/account`;

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  createTransaction(request: CreateSecretaryFinancialTransactionRequest): Observable<ApiResponse<CreatedTransactionDto>> {
    return this.http.post<ApiResponse<CreatedTransactionDto>>(
      `${this.baseUrl}/financial-transactions`,
      request,
      { headers: this.authHeaders() },
    );
  }

  getTransactions(request: GetSecretaryFinancialTransactionsRequest): Observable<ApiResponse<SecretaryFinancialTransactionListDto>> {
    return this.http.get<ApiResponse<SecretaryFinancialTransactionListDto>>(
      `${this.baseUrl}/financial-transactions`,
      { headers: this.authHeaders(), params: this.toParams(request) },
    );
  }

  getSummary(fromDate?: string, toDate?: string): Observable<ApiResponse<SecretaryFinancialSummaryDto>> {
    let params = new HttpParams();
    if (fromDate) params = params.set("fromDate", fromDate);
    if (toDate) params = params.set("toDate", toDate);
    return this.http.get<ApiResponse<SecretaryFinancialSummaryDto>>(
      `${this.baseUrl}/financial-transactions/summary`,
      { headers: this.authHeaders(), params },
    );
  }

  getExpenseCategories(): Observable<ApiResponse<SecretaryExpenseCategoryDto[]>> {
    return this.http.get<ApiResponse<SecretaryExpenseCategoryDto[]>>(
      `${this.baseUrl}/expense-categories`,
      { headers: this.authHeaders() },
    );
  }

  getTransaction(id: number): Observable<ApiResponse<SecretaryFinancialTransactionDto>> {
    return this.http.get<ApiResponse<SecretaryFinancialTransactionDto>>(
      `${this.baseUrl}/financial-transactions/${id}`,
      { headers: this.authHeaders() },
    );
  }

  private toParams(request: GetSecretaryFinancialTransactionsRequest): HttpParams {
    let params = new HttpParams()
      .set("page", request.page)
      .set("pageSize", request.pageSize);
    const optionalValues: Record<string, string | number | undefined> = {
      type: request.type,
      fromDate: request.fromDate,
      toDate: request.toDate,
      search: request.search,
      expenseCategoryId: request.expenseCategoryId,
    };
    Object.entries(optionalValues).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params = params.set(key, value);
    });
    return params;
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth.authToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
