import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "../../core/auth/auth.service";
import { environment } from "../../../environments/environment";
export interface PatientPortalCase {
  id: string; createdAt: string; totalAmount: number; paidAmount: number; remainingAmount: number;
  paymentMethod: string | null; status: number; installmentStatus: string | null;
  fileNumber: number | null; stage: string;
  treatmentConfirmedAtUtc: string | null; financeConfirmedAtUtc: string | null;
  profileConfirmedAtUtc: string | null; approvedAtUtc: string | null;
  cheques: { id: number; amount: number; dueDate: string; status: number; isGuarantee: boolean; sayadNumber: string }[];
  notes: { id: number; amount: number; dueDate: string; status: number; serialNumber: string }[];
  debts: { id: number; amount: number; dueDate: string; status: number; sourceType: number }[];
  transactions: { id: number; amount: number; createdAt: string; type: number; sourceType: number }[];
}
export interface PatientPortalOverview {
  profile: { id: string; firstName: string; lastName: string; phoneNumber: string; birthDate: string; gender: number; nationalCode: string | null };
  summary: { totalTreatment: number; totalPaid: number; totalRemaining: number; caseCount: number };
  cases: PatientPortalCase[];
}
@Injectable({ providedIn: "root" })
export class PatientPortalService {
  private readonly url = `${environment.apiBaseUrl}/patient/portal`;
  constructor(private readonly http: HttpClient, private readonly auth: AuthService) {}
  private headers(): HttpHeaders { return new HttpHeaders({ Authorization: `Bearer ${this.auth.authToken() || ""}` }); }
  overview() { return this.http.get<PatientPortalOverview>(`${this.url}/overview`, { headers: this.headers() }); }
  updateProfile(firstName: string, lastName: string) {
    return this.http.put<{ firstName: string; lastName: string }>(`${this.url}/profile`, { firstName, lastName }, { headers: this.headers() });
  }
  changePassword(currentPassword: string, newPassword: string) {
    return this.http.post<{ message: string }>(`${this.url}/change-password`, { currentPassword, newPassword }, { headers: this.headers() });
  }
}
