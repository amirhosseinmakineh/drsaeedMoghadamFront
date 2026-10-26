 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import { HttpHeaders, HttpParams } from "@angular/common/http";



import { environment } from "../../../../../environments/environment";












@Injectable({ providedIn: "root" })
export class SecretarySalesService {
    __init() {this.secretaryUrl = `${environment.apiBaseUrl}/secretary/account/sales`}
    __init2() {this.adminUrl = `${environment.apiBaseUrl}/admin/secretary-sales`}

  constructor(  http,   auth) {;this.http = http;this.auth = auth;SecretarySalesService.prototype.__init.call(this);SecretarySalesService.prototype.__init2.call(this);}

  activeServices() {
    return this.http.get(`${this.secretaryUrl}/services`, this.options());
  }

  patients(search, page = 1, pageSize = 20) {
    return this.http.get(`${this.secretaryUrl}/patients`, this.options({ search, page, pageSize }));
  }

  createSale(patientUserId, serviceId) {
    return this.http.post(this.secretaryUrl, { patientUserId, serviceId }, this.options());
  }

  mySales(filters) {
    return this.http.get(this.secretaryUrl, this.options(filters));
  }

  wallet() {
    return this.http.get(`${this.secretaryUrl}/wallet`, this.options());
  }

  walletTransactions(filters) {
    return this.http.get(`${this.secretaryUrl}/wallet/transactions`, this.options(filters));
  }

  adminServices(filters) {
    return this.http.get(`${this.adminUrl}/services`, this.options(filters));
  }

  createService(body) {
    return this.http.post(`${this.adminUrl}/services`, body, this.options());
  }

  updateService(id, body) {
    return this.http.put(`${this.adminUrl}/services/${id}`, body, this.options());
  }

  setServiceStatus(id, isActive) {
    return this.http.patch(`${this.adminUrl}/services/${id}/status`, { isActive }, this.options());
  }

  adminSales(filters) {
    return this.http.get(`${this.adminUrl}/sales`, this.options(filters));
  }

  approve(id) {
    return this.http.post(`${this.adminUrl}/sales/${id}/approve`, {}, this.options());
  }

  reject(id) {
    return this.http.post(`${this.adminUrl}/sales/${id}/reject`, {}, this.options());
  }

   options(values) {
    const token = this.auth.authToken();
    let params = new HttpParams();
    Object.entries(_nullishCoalesce(values, () => ( {}))).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params = params.set(key, String(value));
    });
    return { headers: token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders(), params };
  }
}
