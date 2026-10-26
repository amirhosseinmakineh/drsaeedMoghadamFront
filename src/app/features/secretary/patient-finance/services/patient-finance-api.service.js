 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { HttpHeaders, HttpParams } from "@angular/common/http";

import { map, } from "rxjs";

import { environment } from "../../../../../environments/environment";


@Injectable({ providedIn: "root" })
export class PatientFinanceApiService {
    __init() {this.baseUrl = `${environment.apiBaseUrl}/secretary`}
  constructor(  http,   auth) {;this.http = http;this.auth = auth;PatientFinanceApiService.prototype.__init.call(this);}
   options(query = {}) {
    const token = _optionalChain([this, 'access', _ => _.auth, 'access', _2 => _2.user, 'call', _3 => _3(), 'optionalAccess', _4 => _4.token]);
    return {
      headers: token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders(),
      params: this.params(query),
    };
  }
   params(query = {}) {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") params = params.set(key, String(value));
    });
    return params;
  }
  getCases(query) { return this.get(`${this.baseUrl}/patient-financial-cases`, query); }
  getCase(id) { return this.get(`${this.baseUrl}/patient-financial-cases/${id}`); }
  getCaseSummary(id) { return this.get(`${this.baseUrl}/patient-financial-cases/${id}/summary`); }
  createCase(body) { return this.http.post(`${this.baseUrl}/patient-financial-cases`, body, this.options()); }
  updateCase(id, body) { return this.http.put(`${this.baseUrl}/patient-financial-cases/${id}`, body, this.options()); }
  cancelCase(id) { return this.http.delete(`${this.baseUrl}/patient-financial-cases/${id}`, this.options()); }
  uploadGuaranteeDocument(id, file) {
    const token = _optionalChain([this, 'access', _5 => _5.auth, 'access', _6 => _6.user, 'call', _7 => _7(), 'optionalAccess', _8 => _8.token]);
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    const body = new FormData();
    body.append("file", file);
    return this.http.post(`${this.baseUrl}/patient-financial-cases/${id}/guarantee-document`, body, { headers });
  }
  deleteGuaranteeDocument(id) { return this.http.delete(`${this.baseUrl}/patient-financial-cases/${id}/guarantee-document`, this.options()); }
  addCheque(caseId, body) { return this.http.post(`${this.baseUrl}/patient-financial-cases/${caseId}/cheques`, body, this.options()); }
  addPromissoryNote(caseId, body) { return this.http.post(`${this.baseUrl}/patient-financial-cases/${caseId}/promissory-notes`, body, this.options()); }
  getCheques(query) { return this.get(`${this.baseUrl}/patient-cheques`, query); }
  updateCheque(id, body) { return this.http.put(`${this.baseUrl}/patient-cheques/${id}`, body, this.options()); }
  deleteCheque(id) { return this.http.delete(`${this.baseUrl}/patient-cheques/${id}`, this.options()); }
  updateChequeStatus(id, status) { return this.http.put(`${this.baseUrl}/patient-cheques/${id}/status`, { status }, this.options()); }
  getPromissoryNotes(query) { return this.get(`${this.baseUrl}/patient-promissory-notes`, query); }
  updatePromissoryNote(id, body) { return this.http.put(`${this.baseUrl}/patient-promissory-notes/${id}`, body, this.options()); }
  deletePromissoryNote(id) { return this.http.delete(`${this.baseUrl}/patient-promissory-notes/${id}`, this.options()); }
  updatePromissoryNoteStatus(id, status) { return this.http.put(`${this.baseUrl}/patient-promissory-notes/${id}/status`, { status }, this.options()); }
  getDebts(query) { return this.get(`${this.baseUrl}/patient-debts`, query); }
  payDebt(id) { return this.http.post(`${this.baseUrl}/patient-debts/${id}/pay`, null, this.options()); }
  getTransactions(query) { return this.get(`${this.baseUrl}/patient-financial-transactions`, query); }
  getDueCommitments(query) { return this.get(`${this.baseUrl}/patient-financial-commitments/due`, query); }

   get(url, query = {}) {
    return this.http.get(url, this.options(query)).pipe(
      map(response => {
        if (this.isApiResult(response)) {
          if (!response.isSuccess || response.data === null) {
            throw new Error(response.message || "دریافت اطلاعات مالی انجام نشد.");
          }
          return response.data;
        }
        return response;
      }),
    );
  }

   isApiResult(response) {
    return typeof response === "object" && response !== null && "isSuccess" in response && "data" in response;
  }
}
