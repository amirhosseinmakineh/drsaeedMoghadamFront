import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "../../core/auth/auth.service";
import { environment } from "../../../environments/environment";

export type InstallmentStatus = "paid" | "unpaid" | "overdue" | "pending";
export interface AdminInstallment {
  id: number;
  caseId: string;
  amount: number;
  dueDate: string;
  paidAtUtc: string | null;
  paidBy: string | null;
  patientName: string;
  phoneNumber: string;
  fileNumber: string;
  description: string | null;
  status: "paid" | "overdue" | "pending";
}
export interface AdminInstallmentsReport {
  items: AdminInstallment[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  summary: { totalAmount: number; paidAmount: number; remainingAmount: number; overdueAmount: number };
}
export interface AdminInstallmentsFilters {
  search: string;
  status: InstallmentStatus | "";
  fromDate?: string;
  toDate?: string;
}

@Injectable({ providedIn: "root" })
export class AdminInstallmentsService {
  constructor(private readonly http: HttpClient, private readonly auth: AuthService) {}

  list(filters: AdminInstallmentsFilters, page = 1): Observable<AdminInstallmentsReport> {
    let params = new HttpParams().set("page", page).set("pageSize", 50);
    Object.entries(filters).forEach(([key, value]) => { if (value) params = params.set(key, value); });
    return this.http.get<AdminInstallmentsReport>(`${environment.apiBaseUrl}/admin/patient-installments`, {
      headers: this.headers(), params,
    });
  }

  recordPayment(row: AdminInstallment): Observable<unknown> {
    return this.http.post(`${environment.apiBaseUrl}/secretary/patient-financial-cases/${row.caseId}/installments/${row.id}/pay`,
      {}, { headers: this.headers() });
  }

  private headers(): HttpHeaders {
    const token = this.auth.authToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
