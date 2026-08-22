import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

import {environment} from "../../../environments/environment";
import {AuthService} from "../auth/auth.service";

import {ConsultantFollowUp, CreateSecretaryFollowUpRequest, PaginatedResponse, PatientFollowUpInfo, PatientSearchItem, SecretaryFollowUp, UpdateSecretaryFollowUpRequest,} from "./follow-up.model";

@Injectable({providedIn: "root"})
export class FollowUpService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  searchPatients(search: string, page = 1, pageSize = 20):
      Observable<PaginatedResponse<PatientSearchItem>> {
    return this.http.get<PaginatedResponse<PatientSearchItem>>(
        `${this.baseUrl}/secretary/follow-ups/patients`, {
          headers: this.headers(),
          params: this.params(page, pageSize, search),
        });
  }

  getPatientFollowUpInfo(patientId: number): Observable<PatientFollowUpInfo> {
    return this.http.get<PatientFollowUpInfo>(
        `${this.baseUrl}/secretary/follow-ups/patients/${patientId}`, {headers: this.headers()});
  }

  getSecretaryFollowUps(page: number, pageSize: number, search: string):
      Observable<PaginatedResponse<SecretaryFollowUp>> {
    return this.http.get<PaginatedResponse<SecretaryFollowUp>>(
        `${this.baseUrl}/secretary/follow-ups`, {
          headers: this.headers(),
          params: this.params(page, pageSize, search),
        });
  }

  getSecretaryFollowUpById(id: number): Observable<SecretaryFollowUp> {
    return this.http.get<SecretaryFollowUp>(
        `${this.baseUrl}/secretary/follow-ups/${id}`, {headers: this.headers()});
  }

  createSecretaryFollowUp(request: CreateSecretaryFollowUpRequest): Observable<SecretaryFollowUp> {
    return this.http.post<SecretaryFollowUp>(
        `${this.baseUrl}/secretary/follow-ups`, request, {headers: this.headers()});
  }

  updateSecretaryFollowUp(id: number, request: UpdateSecretaryFollowUpRequest):
      Observable<SecretaryFollowUp> {
    return this.http.put<SecretaryFollowUp>(
        `${this.baseUrl}/secretary/follow-ups/${id}`, request, {headers: this.headers()});
  }

  deleteSecretaryFollowUp(id: number): Observable<void> {
    return this.http.delete<void>(
        `${this.baseUrl}/secretary/follow-ups/${id}`, {headers: this.headers()});
  }

  getConsultantFollowUps(page: number, pageSize: number, search: string):
      Observable<PaginatedResponse<ConsultantFollowUp>> {
    return this.http.get<PaginatedResponse<ConsultantFollowUp>>(
        `${this.baseUrl}/consultant/follow-ups`, {
          headers: this.headers(),
          params: this.params(page, pageSize, search),
        });
  }

  private params(page: number, pageSize: number, search: string): HttpParams {
    let params = new HttpParams().set("page", page).set("pageSize", pageSize);
    if (search.trim()) params = params.set("search", search.trim());
    return params;
  }

  private headers(): HttpHeaders {
    const token = this.auth.authToken();
    return new HttpHeaders(
        {Accept: "application/json", ...(token ? {Authorization: `Bearer ${token}`} : {})});
  }
}
