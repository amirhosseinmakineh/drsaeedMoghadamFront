 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { HttpHeaders, HttpParams } from "@angular/common/http";

import { map, } from "rxjs";
import { environment } from "../../../../environments/environment";





@Injectable({ providedIn: "root" })
export class PatientReferralApiService {
    __init() {this.base = `${environment.apiBaseUrl}`}
  constructor( http,  auth) {;this.http = http;this.auth = auth;PatientReferralApiService.prototype.__init.call(this);}

  patientDashboard() { return this.getData(`${this.base}/patient/referrals/dashboard`); }
  patientReferrals(query) { return this.list(`${this.base}/patient/referrals`, query); }
  createReferral(body) { return this.postData(`${this.base}/patient/referrals`, body); }
  secretaryReferrals(query) { return this.list(`${this.base}/secretary/patient-referrals`, query); }
  consultants() { return this.getData(`${this.base}/secretary/patient-referrals/consultants`); }
  markContacted(id) { return this.postData(`${this.base}/secretary/patient-referrals/${id}/contacted`, {}); }
  reserve(id, body) { return this.postData(`${this.base}/secretary/patient-referrals/${id}/reserve`, body); }
  adminReferrals(query) { return this.list(`${this.base}/admin/patient-referrals`, query); }
  exportAdminReferrals(query) {
    return this.http.get(`${this.base}/admin/patient-referrals/export`, { params: this.params(query), headers: this.headers(), responseType: "blob" });
  }
  review(id, approve, rejectionReason) {
    return approve
      ? this.postData(`${this.base}/admin/patient-referrals/${id}/approve`, {})
      : this.postData(`${this.base}/admin/patient-referrals/${id}/reject`, { reason: rejectionReason });
  }

   list(url, query) {
    const params = this.params(query);
    return this.http.get(url, { params, headers: this.headers() }).pipe(map(value => this.unwrap(value)));
  }
   params(query) {
    let params = new HttpParams().set("page", query.page).set("pageSize", query.pageSize);
    if (_optionalChain([query, 'access', _ => _.search, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])) params = params.set("search", query.search.trim());
    if (query.status != null) params = params.set("status", query.status);
    if (query.fromDate) params = params.set("fromDate", query.fromDate);
    if (query.toDate) params = params.set("toDate", query.toDate);
    return params;
  }
   getData(url) { return this.http.get(url, { headers: this.headers() }).pipe(map(v => this.unwrap(v))); }
   postData(url, body) { return this.http.post(url, body, { headers: this.headers() }).pipe(map(v => this.unwrap(v))); }
   unwrap(value) { const result = value ; return result && "data" in (result ) ? result.data  : value ; }
   headers() { const token = _optionalChain([this, 'access', _4 => _4.auth, 'access', _5 => _5.user, 'call', _6 => _6(), 'optionalAccess', _7 => _7.token]); return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders(); }
}
