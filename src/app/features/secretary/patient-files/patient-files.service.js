 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { HttpHeaders, HttpParams } from "@angular/common/http";

import { map, } from "rxjs";

import { environment } from "../../../../environments/environment";












@Injectable({ providedIn: "root" })
export class PatientFilesService {
    __init() {this.endpoint = `${environment.apiBaseUrl}/secretary/patient-files`}

  constructor(
      http,
      auth,
  ) {;this.http = http;this.auth = auth;PatientFilesService.prototype.__init.call(this);}

  getPatientFiles(query) {
    return this.http.get(this.endpoint, {
      headers: this.authHeaders(),
      params: this.params(query),
    }).pipe(
      map((response) => this.page(response, query.page, query.pageSize)),
    );
  }

  getPatientFileById(id) {
    return this.http.get(`${this.endpoint}/${id}`, { headers: this.authHeaders() })
      .pipe(map((response) => this.data(response)));
  }

  createPatientFile(request) {
    return this.http.post(this.endpoint, request, { headers: this.authHeaders() })
      .pipe(map((response) => this.data(response)));
  }

  getEligiblePatients(query) {
    return this.http.get(`${this.endpoint}/eligible-patients`, {
      headers: this.authHeaders(), params: this.params(query),
    }).pipe(map((response) => this.page(response, query.page, query.pageSize)));
  }

  createFromReservation(patientId) {
    return this.http.post(`${this.endpoint}/from-reservation`, { patientId }, {
      headers: this.authHeaders(),
    }).pipe(map((response) => this.data(response)));
  }

  ensureFinancialIdentity(patientFileId) {
    return this.http.post(`${this.endpoint}/${patientFileId}/financial-identity`, {}, {
      headers: this.authHeaders(),
    }).pipe(
      map((response) => this.data(response)),
    );
  }

  updatePatientFile(id, body) {
    return this.http.put(`${this.endpoint}/${id}`, body, { headers: this.authHeaders() })
      .pipe(map((response) => this.data(response)));
  }

  deletePatientFile(id) {
    return this.http.delete(`${this.endpoint}/${id}`, { headers: this.authHeaders() });
  }

  importLegacyPatientFiles(file) {
    const form = new FormData();
    form.append("file", file, file.name);
    return this.http.post(`${this.endpoint}/import`, form, { headers: this.authHeaders() })
      .pipe(map((response) => this.data(response)));
  }

   authHeaders() {
    const token = _optionalChain([this, 'access', _ => _.auth, 'access', _2 => _2.user, 'call', _3 => _3(), 'optionalAccess', _4 => _4.token]);
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

   params(query) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== "" && value !== null && value !== undefined) params = params.set(key, String(value));
    }
    return params;
  }

   data(response) {
    const value = response ;
    return _nullishCoalesce(_nullishCoalesce(_optionalChain([value, 'optionalAccess', _5 => _5.data]), () => ( _optionalChain([value, 'optionalAccess', _6 => _6.result]))), () => ( response ));
  }

   page(response, page, pageSize) {
    const root = this.data(response);
    const items = (_nullishCoalesce(_nullishCoalesce(root["items"], () => ( root["data"])), () => ( []))) ;
    return {
      items,
      totalCount: Number(_nullishCoalesce(root["totalCount"], () => ( items.length))),
      page: Number(_nullishCoalesce(_nullishCoalesce(root["page"], () => ( root["pageNumber"])), () => ( page))),
      pageSize: Number(_nullishCoalesce(root["pageSize"], () => ( pageSize))),
    };
  }
}
