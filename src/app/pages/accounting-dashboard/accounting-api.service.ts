import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
import { AccountingAccess, AccountingFilter, AccountingMetric, AccountingOperationResult, AccountingPage, AccountingSection, AccountantUser } from './accounting.models';
import { PatientFinancialCaseDetails } from '../../features/secretary/patient-finance/models/patient-finance.models';

@Injectable({ providedIn: 'root' })
export class AccountingApiService {
  private readonly base = `${environment.apiBaseUrl.replace(/\/$/, '')}/accounting`;
  constructor(private readonly http: HttpClient, private readonly auth: AuthService) {}
  private get headers() { return new HttpHeaders({ Authorization: `Bearer ${this.auth.user()?.token ?? ''}` }); }
  private params(filter: AccountingFilter) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filter)) if (value !== '' && value != null) params = params.set(key, value);
    return params;
  }
  access() { return this.http.get<AccountingAccess>(`${this.base}/access`, { headers: this.headers }); }
  overview(filter: AccountingFilter) { return this.http.get<{ metrics: AccountingMetric[] }>(`${this.base}/overview`, { headers: this.headers, params: this.params(filter) }); }
  page(section: AccountingSection, filter: AccountingFilter) { return this.http.get<AccountingPage>(`${this.base}/sections/${section}`, { headers: this.headers, params: this.params(filter) }); }
  export(section: AccountingSection, filter: AccountingFilter, excel = false) { return this.http.get(`${this.base}/export/${section}`, { headers: this.headers, params: this.params(filter).set('excel', excel), responseType: 'blob' }); }
  case(id: string) { return this.http.get<PatientFinancialCaseDetails>(`${this.base}/cases/${id}`, { headers: this.headers }); }
  transaction(id: string) { return this.http.get<Record<string, unknown>>(`${this.base}/transactions/${id}`, { headers: this.headers }); }
  operate(operation: string, targetId: string | null, data: unknown) { return this.http.post<AccountingOperationResult>(`${this.base}/operations/${operation}`, { targetId, data }, { headers: this.headers }); }
  documents(caseId: string) { return this.http.get<{id: string; description: string}[]>(`${this.base}/cases/${caseId}/documents`, { headers: this.headers }); }
  image(caseId: string, documentId: string) { return this.http.get(`${this.base}/cases/${caseId}/documents/${documentId}`, { headers: this.headers, responseType: 'blob' }); }
  receipt(id: string) { return this.http.get(`${this.base}/transactions/${id}/receipt`, { headers: this.headers, responseType: 'blob' }); }
  accountants() { return this.http.get<AccountantUser[]>(`${this.base}/accountants`, { headers: this.headers }); }
  permissions(userId: string, permissions: string[]) { return this.http.put<AccountingOperationResult>(`${this.base}/accountants/${userId}/permissions`, { permissions }, { headers: this.headers }); }
}

export function accountingError(error: unknown): string {
  const e = error as { status?: number; error?: { message?: string; errors?: Record<string, string[]>; traceId?: string } | string };
  if (typeof e?.error === 'string' && !e.error.trimStart().startsWith('<')) return e.error;
  if (typeof e?.error === 'object' && e.error) {
    const text = e.error.message || Object.values(e.error.errors ?? {}).flat().join(' — ');
    if (text) return text + (e.error.traceId ? ` (پیگیری: ${e.error.traceId})` : '');
  }
  if (e?.status === 0) return 'ارتباط با سرور برقرار نشد؛ دوباره تلاش کنید.';
  if (e?.status === 403) return 'دسترسی این عملیات را ندارید؛ مجوزها را از مدیر پیگیری کنید.';
  return 'دریافت یا ثبت اطلاعات انجام نشد؛ دوباره تلاش کنید.';
}
