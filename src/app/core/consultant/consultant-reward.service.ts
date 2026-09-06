import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthService } from "../auth/auth.service";

export type ConsultantRewardStatus = "WaitingSecretary" | "Pending" | "Approved" | "Rejected";
export interface ConsultantRewardItem {
  reservationId: number; consultantProfileId: number; consultantUserId: string;
  consultantName: string; patientName: string; patientPhoneNumber?: string;
  patientCount: number; rewardAmount: number; status: ConsultantRewardStatus;
  secretaryApprovalStatus: "Waiting" | "Approved" | "Rejected";
  secretaryReviewedAt?: string; adminReviewedAt?: string;
}
export interface ConsultantWalletReport {
  balance: number; totalApprovedRewards: number; approvedPatientCount: number;
  pendingPatientCount: number; items: ConsultantRewardItem[];
}
export interface RewardCommandResult { isSuccess: boolean; message: string; }

@Injectable({ providedIn: "root" })
export class ConsultantRewardService {
  private readonly consultantUrl = `${environment.apiBaseUrl}/consultant/wallet`;
  private readonly adminUrl = `${environment.apiBaseUrl}/admin/consultant-rewards`;
  constructor(private readonly http: HttpClient, private readonly auth: AuthService) {}
  wallet(): Observable<ConsultantWalletReport> { return this.http.get<ConsultantWalletReport>(this.consultantUrl, this.options()); }
  adminReport(status?: ConsultantRewardStatus): Observable<ConsultantRewardItem[]> {
    const params = status ? new HttpParams().set("status", status) : new HttpParams();
    return this.http.get<ConsultantRewardItem[]>(this.adminUrl, { ...this.options(), params });
  }
  approve(id: number): Observable<RewardCommandResult> { return this.http.post<RewardCommandResult>(`${this.adminUrl}/${id}/approve`, {}, this.options()); }
  reject(id: number): Observable<RewardCommandResult> { return this.http.post<RewardCommandResult>(`${this.adminUrl}/${id}/reject`, {}, this.options()); }
  private options(): { headers: HttpHeaders } {
    const token = this.auth.authToken();
    return { headers: token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders() };
  }
}
