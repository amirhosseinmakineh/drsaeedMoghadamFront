import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

import {environment} from "../../../environments/environment";
import {AuthService} from "../auth/auth.service";

import {ConsultantFollowUp, PaginatedResponse} from "./follow-up.model";

@Injectable({providedIn: "root"})
export class FollowUpService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

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
