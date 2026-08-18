import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthService } from "../auth/auth.service";
import { ApiEnvelope, FinancialTransaction } from "./financial.models";

@Injectable({ providedIn: "root" })
export class FinancialService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  getTransaction(id: string): Observable<FinancialTransaction> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.authToken() ?? ""}` });
    return this.http
      .get<ApiEnvelope<FinancialTransaction> | FinancialTransaction>(`${environment.apiBaseUrl}/financial-transactions/${id}`, { headers })
      .pipe(map((response) => "data" in (response as ApiEnvelope<FinancialTransaction>) ? (response as ApiEnvelope<FinancialTransaction>).data : response as FinancialTransaction));
  }

  getTransactions(): Observable<FinancialTransaction[]> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.authToken() ?? ""}` });
    return this.http
      .get<ApiEnvelope<FinancialTransaction[]> | FinancialTransaction[]>(`${environment.apiBaseUrl}/financial-transactions`, { headers })
      .pipe(map((response) => "data" in (response as ApiEnvelope<FinancialTransaction[]>) ? (response as ApiEnvelope<FinancialTransaction[]>).data : response as FinancialTransaction[]));
  }
}
