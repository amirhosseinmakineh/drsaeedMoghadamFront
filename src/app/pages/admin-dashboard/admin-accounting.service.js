import { HttpHeaders, HttpParams } from "@angular/common/http";


import { environment } from "../../../environments/environment";



@Injectable({ providedIn: "root" })
export class AdminAccountingService {
    __init() {this.url = `${environment.apiBaseUrl}/admin/accounting/report`}

  constructor(
      http,
      auth,
  ) {;this.http = http;this.auth = auth;AdminAccountingService.prototype.__init.call(this);}

  report(filters) {
    return this.http.get(this.url, this.options(filters));
  }

  export(filters) {
    return this.http.get(`${this.url}/export`, {
      ...this.options(filters),
      responseType: "blob",
    });
  }

   options(filters) {
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
