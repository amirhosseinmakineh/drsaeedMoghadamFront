import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";
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
  SecretaryExpenseCategoryManagementDto,
  SaveSecretaryExpenseCategoryRequest,
  SecretaryFinancialSummaryDto,
  SecretaryFinancialTransactionDto,
  SecretaryFinancialTransactionListDto,
  UpdateSecretaryFinancialTransactionRequest,
} from "../models/secretary-account.models";

@Injectable({ providedIn: "root" })
export class SecretaryAccountService {
  private readonly baseUrl = `${environment.apiBaseUrl}/secretary/account`;
  private readonly expenseCategoriesUrl = `${environment.apiBaseUrl}/secretary/expense-categories`;

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

  getManagedExpenseCategories(): Observable<ApiResponse<SecretaryExpenseCategoryManagementDto[]>> {
    return this.http.get<ApiResponse<SecretaryExpenseCategoryManagementDto[]>>(
      this.expenseCategoriesUrl,
      { headers: this.authHeaders() },
    );
  }

  getManagedExpenseCategory(id: number): Observable<ApiResponse<SecretaryExpenseCategoryManagementDto>> {
    return this.http.get<ApiResponse<SecretaryExpenseCategoryManagementDto>>(
      `${this.expenseCategoriesUrl}/${id}`,
      { headers: this.authHeaders() },
    );
  }

  createExpenseCategory(request: SaveSecretaryExpenseCategoryRequest): Observable<ApiResponse<SecretaryExpenseCategoryManagementDto>> {
    return this.http.post<ApiResponse<SecretaryExpenseCategoryManagementDto>>(
      this.expenseCategoriesUrl,
      request,
      { headers: this.authHeaders() },
    );
  }

  updateExpenseCategory(id: number, request: SaveSecretaryExpenseCategoryRequest): Observable<ApiResponse<SecretaryExpenseCategoryManagementDto>> {
    return this.http.put<ApiResponse<SecretaryExpenseCategoryManagementDto>>(
      `${this.expenseCategoriesUrl}/${id}`,
      request,
      { headers: this.authHeaders() },
    );
  }

  deleteExpenseCategory(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.expenseCategoriesUrl}/${id}`, {
      headers: this.authHeaders(),
    });
  }

  getTransaction(id: number): Observable<ApiResponse<SecretaryFinancialTransactionDto>> {
    return this.http.get<ApiResponse<SecretaryFinancialTransactionDto>>(
      `${this.baseUrl}/financial-transactions/${id}`,
      { headers: this.authHeaders() },
    );
  }

  updateTransaction(id: number, request: UpdateSecretaryFinancialTransactionRequest): Observable<ApiResponse<CreatedTransactionDto>> {
    return this.http.put<ApiResponse<CreatedTransactionDto>>(
      `${this.baseUrl}/financial-transactions/${id}`,
      request,
      { headers: this.authHeaders() },
    );
  }

  deleteTransaction(id: number): Observable<ApiResponse<never>> {
    return this.http.delete<ApiResponse<never>>(
      `${this.baseUrl}/financial-transactions/${id}`,
      { headers: this.authHeaders() },
    );
  }

  getTransactionReceipt(id: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/financial-transactions/${id}/receipt`, {
      headers: this.authHeaders().set("Accept", "text/html"),
      observe: "response",
      responseType: "blob",
    });
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
