import { HttpHeaders, HttpParams } from "@angular/common/http";


import { environment } from "../../../environments/environment";


 













@Injectable({ providedIn: "root" })
export class ConsultantRewardService {
    __init() {this.consultantUrl = `${environment.apiBaseUrl}/consultant/wallet`}
    __init2() {this.adminUrl = `${environment.apiBaseUrl}/admin/consultant-rewards`}
  constructor(  http,   auth) {;this.http = http;this.auth = auth;ConsultantRewardService.prototype.__init.call(this);ConsultantRewardService.prototype.__init2.call(this);}
  wallet() { return this.http.get(this.consultantUrl, this.options()); }
  adminReport(status) {
    const params = status ? new HttpParams().set("status", status) : new HttpParams();
    return this.http.get(this.adminUrl, { ...this.options(), params });
  }
  approve(id) { return this.http.post(`${this.adminUrl}/${id}/approve`, {}, this.options()); }
  reject(id) { return this.http.post(`${this.adminUrl}/${id}/reject`, {}, this.options()); }
   options() {
    const token = this.auth.authToken();
    return { headers: token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders() };
  }
}
