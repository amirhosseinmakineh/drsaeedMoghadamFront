import { HttpHeaders } from "@angular/common/http";


import { environment } from "../../../../environments/environment";









@Injectable({ providedIn: "root" })
export class LeadAssignmentSettingsService {
    __init() {this.url = `${environment.apiBaseUrl}/admin/lead-assignment-settings`}

  constructor(
      http,
      auth,
  ) {;this.http = http;this.auth = auth;LeadAssignmentSettingsService.prototype.__init.call(this);}

  get() {
    return this.http.get(this.url, this.options());
  }

  update(assignmentSourceType) {
    return this.http.put(
      this.url,
      { assignmentSourceType },
      this.options(),
    );
  }

  getConsultants() {
    return this.http.get(
      `${this.url}/consultants`,
      this.options(),
    );
  }

  updateConsultant(
    consultantProfileId,
    preferredLeadSourceType,
  ) {
    return this.http.put(
      `${this.url}/consultants/${consultantProfileId}`,
      { preferredLeadSourceType },
      this.options(),
    );
  }

   options() {
    const token = this.auth.authToken();
    return {
      headers: token
        ? new HttpHeaders({ Authorization: `Bearer ${token}` })
        : new HttpHeaders(),
    };
  }
}
