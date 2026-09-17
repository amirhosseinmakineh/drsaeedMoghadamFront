import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { AuthService } from "../../../core/auth/auth.service";
import { ConsultantOption, CreateReferralRequest, PagedReferrals, PatientReferral, PatientReferralDashboard, ReferralQuery, ReserveReferralRequest } from "../models/patient-referral.models";

interface ApiResult<T> { isSuccess?: boolean; message?: string; data?: T }

@Injectable({ providedIn: "root" })
export class PatientReferralApiService {
  private readonly base = `${environment.apiBaseUrl}`;
  constructor(private http: HttpClient, private auth: AuthService) {}

  patientDashboard(): Observable<PatientReferralDashboard> { return this.getData(`${this.base}/patient/referrals/dashboard`); }
  patientReferrals(query: ReferralQuery): Observable<PagedReferrals> { return this.list(`${this.base}/patient/referrals`, query); }
  createReferral(body: CreateReferralRequest): Observable<PatientReferral> { return this.postData(`${this.base}/patient/referrals`, body); }
  secretaryReferrals(query: ReferralQuery): Observable<PagedReferrals> { return this.list(`${this.base}/secretary/patient-referrals`, query); }
  consultants(): Observable<ConsultantOption[]> { return this.getData(`${this.base}/secretary/patient-referrals/consultants`); }
  markContacted(id: number): Observable<PatientReferral> { return this.postData(`${this.base}/secretary/patient-referrals/${id}/contacted`, {}); }
  reserve(id: number, body: ReserveReferralRequest): Observable<PatientReferral> { return this.postData(`${this.base}/secretary/patient-referrals/${id}/reserve`, body); }
  adminReferrals(query: ReferralQuery): Observable<PagedReferrals> { return this.list(`${this.base}/admin/patient-referrals`, query); }
  review(id: number, approve: boolean, rejectionReason?: string): Observable<PatientReferral> {
    return this.postData(`${this.base}/admin/patient-referrals/${id}/review`, rejectionReason ? { approve, rejectionReason } : { approve });
  }

  private list(url: string, query: ReferralQuery): Observable<PagedReferrals> {
    let params = new HttpParams().set("page", query.page).set("pageSize", query.pageSize);
    if (query.search?.trim()) params = params.set("search", query.search.trim());
    if (query.status != null) params = params.set("status", query.status);
    return this.http.get<ApiResult<PagedReferrals> | PagedReferrals>(url, { params, headers: this.headers() }).pipe(map(value => this.unwrap(value)));
  }
  private getData<T>(url: string): Observable<T> { return this.http.get<ApiResult<T> | T>(url, { headers: this.headers() }).pipe(map(v => this.unwrap(v))); }
  private postData<T>(url: string, body: object): Observable<T> { return this.http.post<ApiResult<T> | T>(url, body, { headers: this.headers() }).pipe(map(v => this.unwrap(v))); }
  private unwrap<T>(value: ApiResult<T> | T): T { const result = value as ApiResult<T>; return result && "data" in (result as object) ? result.data as T : value as T; }
  private headers(): HttpHeaders { const token = this.auth.user()?.token; return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders(); }
}
