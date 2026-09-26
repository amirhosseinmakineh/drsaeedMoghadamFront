import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthService } from "../../core/auth/auth.service";
import { AdminAccountingFilters, AdminAccountingReport } from "./admin-accounting.models";

@Injectable({ providedIn: "root" })
export class AdminAccountingService {
  private readonly url = `${environment.apiBaseUrl}/admin/accounting/report`;

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  report(filters: AdminAccountingFilters): Observable<AdminAccountingReport> {
    return this.http.get<AdminAccountingReport>(this.url, this.options(filters));
  }

  export(filters: AdminAccountingFilters): Observable<Blob> {
    return this.http.get(`${this.url}/export`, {
      ...this.options(filters),
      responseType: "blob",
    });
  }

  private options(filters: AdminAccountingFilters): { headers: HttpHeaders; params: HttpParams } {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params = params.set(key, value);
    });
    const token = this.auth.authToken();
    return {
      headers: token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders(),
      params,
    };
  }
}
