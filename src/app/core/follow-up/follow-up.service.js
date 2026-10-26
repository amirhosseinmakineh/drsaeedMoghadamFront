import { HttpHeaders, HttpParams} from "@angular/common/http";



import {environment} from "../../../environments/environment";




@Injectable({providedIn: "root"})
export class FollowUpService {
    __init() {this.baseUrl = environment.apiBaseUrl}

  constructor( http,  auth) {;this.http = http;this.auth = auth;FollowUpService.prototype.__init.call(this);}

  getConsultantFollowUps(page, pageSize, search)
 {
    return this.http.get(
        `${this.baseUrl}/consultant/follow-ups`, {
          headers: this.headers(),
          params: this.params(page, pageSize, search),
        });
  }

   params(page, pageSize, search) {
    let params = new HttpParams().set("page", page).set("pageSize", pageSize);
    if (search.trim()) params = params.set("search", search.trim());
    return params;
  }

   headers() {
    const token = this.auth.authToken();
    return new HttpHeaders(
        {Accept: "application/json", ...(token ? {Authorization: `Bearer ${token}`} : {})});
  }
}
