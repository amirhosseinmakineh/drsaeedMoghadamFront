import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "../../../../core/auth/auth.service";
import { environment } from "../../../../../environments/environment";
import {
  ApiResult,
  Paginated,
  SecretarySale,
  SecretarySalePatient,
  SecretarySaleService,
  SecretarySaleStatus,
  SecretaryWallet,
  SecretaryWalletTransaction,
  SecretaryWalletTransactionType,
} from "../models/secretary-sales.models";

@Injectable({ providedIn: "root" })
export class SecretarySalesService {
  private readonly secretaryUrl = `${environment.apiBaseUrl}/secretary/account/sales`;
  private readonly adminUrl = `${environment.apiBaseUrl}/admin/secretary-sales`;

  constructor(private readonly http: HttpClient, private readonly auth: AuthService) {}

  activeServices(): Observable<SecretarySaleService[]> {
    return this.http.get<SecretarySaleService[]>(`${this.secretaryUrl}/services`, this.options());
  }

  patients(search: string, page = 1, pageSize = 20): Observable<Paginated<SecretarySalePatient>> {
    return this.http.get<Paginated<SecretarySalePatient>>(`${this.secretaryUrl}/patients`, this.options({ search, page, pageSize }));
  }

  createSale(patientUserId: string, serviceId: number): Observable<ApiResult<{ saleId: number }>> {
    return this.http.post<ApiResult<{ saleId: number }>>(this.secretaryUrl, { patientUserId, serviceId }, this.options());
  }

  mySales(filters: Record<string, string | number | undefined>): Observable<Paginated<SecretarySale>> {
    return this.http.get<Paginated<SecretarySale>>(this.secretaryUrl, this.options(filters));
  }

  wallet(): Observable<SecretaryWallet> {
    return this.http.get<SecretaryWallet>(`${this.secretaryUrl}/wallet`, this.options());
  }

  walletTransactions(filters: { page: number; pageSize: number; fromDate?: string; toDate?: string; transactionType?: SecretaryWalletTransactionType }): Observable<Paginated<SecretaryWalletTransaction>> {
    return this.http.get<Paginated<SecretaryWalletTransaction>>(`${this.secretaryUrl}/wallet/transactions`, this.options(filters));
  }

  adminServices(filters: { search?: string; isActive?: boolean; page: number; pageSize: number }): Observable<Paginated<SecretarySaleService>> {
    return this.http.get<Paginated<SecretarySaleService>>(`${this.adminUrl}/services`, this.options(filters));
  }

  createService(body: Pick<SecretarySaleService, "title" | "price" | "secretaryReward" | "isActive">): Observable<ApiResult<SecretarySaleService>> {
    return this.http.post<ApiResult<SecretarySaleService>>(`${this.adminUrl}/services`, body, this.options());
  }

  updateService(id: number, body: Pick<SecretarySaleService, "title" | "price" | "secretaryReward" | "isActive">): Observable<ApiResult<SecretarySaleService>> {
    return this.http.put<ApiResult<SecretarySaleService>>(`${this.adminUrl}/services/${id}`, body, this.options());
  }

  setServiceStatus(id: number, isActive: boolean): Observable<ApiResult> {
    return this.http.patch<ApiResult>(`${this.adminUrl}/services/${id}/status`, { isActive }, this.options());
  }

  adminSales(filters: { search?: string; serviceId?: number; status?: SecretarySaleStatus; fromDate?: string; toDate?: string; page: number; pageSize: number }): Observable<Paginated<SecretarySale>> {
    return this.http.get<Paginated<SecretarySale>>(`${this.adminUrl}/sales`, this.options(filters));
  }

  approve(id: number): Observable<ApiResult> {
    return this.http.post<ApiResult>(`${this.adminUrl}/sales/${id}/approve`, {}, this.options());
  }

  reject(id: number): Observable<ApiResult> {
    return this.http.post<ApiResult>(`${this.adminUrl}/sales/${id}/reject`, {}, this.options());
  }

  private options(values?: Record<string, string | number | boolean | undefined>): { headers: HttpHeaders; params?: HttpParams } {
    const token = this.auth.authToken();
    let params = new HttpParams();
    Object.entries(values ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params = params.set(key, String(value));
    });
    return { headers: token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders(), params };
  }
}
