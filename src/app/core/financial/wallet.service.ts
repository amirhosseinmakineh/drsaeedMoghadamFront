import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthService } from "../auth/auth.service";
import { ApiEnvelope, Wallet, WalletOperationRequest } from "./financial.models";

@Injectable({ providedIn: "root" })
export class WalletService {
  private readonly url = `${environment.apiBaseUrl}/wallet`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getMyWallet(): Observable<Wallet> {
    return this.http.get<ApiEnvelope<Wallet> | Wallet>(`${this.url}/me`, { headers: this.headers() }).pipe(map(this.unwrap));
  }

  getWallets(): Observable<Wallet[]> {
    return this.http.get<ApiEnvelope<Wallet[]> | Wallet[]>(this.url, { headers: this.headers() }).pipe(map(this.unwrap));
  }

  getUserWallet(userId: string): Observable<Wallet> {
    return this.http.get<ApiEnvelope<Wallet> | Wallet>(`${this.url}/${userId}`, { headers: this.headers() }).pipe(map(this.unwrap));
  }

  depositWallet(userId: string, data: WalletOperationRequest): Observable<Wallet> {
    return this.http.post<ApiEnvelope<Wallet> | Wallet>(`${this.url}/${userId}/deposit`, data, { headers: this.headers() }).pipe(map(this.unwrap));
  }

  withdrawWallet(userId: string, data: WalletOperationRequest): Observable<Wallet> {
    return this.http.post<ApiEnvelope<Wallet> | Wallet>(`${this.url}/${userId}/withdraw`, data, { headers: this.headers() }).pipe(map(this.unwrap));
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.authToken() ?? ""}` });
  }

  private unwrap<T>(response: ApiEnvelope<T> | T): T {
    const envelope = response as ApiEnvelope<T>;
    if (envelope && typeof envelope === "object" && "data" in envelope) {
      if (envelope.isSuccess === false) throw new Error(envelope.message || "عملیات انجام نشد");
      return envelope.data;
    }
    return response as T;
  }
}
