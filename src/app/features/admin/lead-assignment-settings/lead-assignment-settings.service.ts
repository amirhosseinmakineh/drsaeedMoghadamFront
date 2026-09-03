import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { AuthService } from "../../../core/auth/auth.service";
import {
  LeadAssignmentSetting,
  LeadAssignmentSettingResult,
  LeadAssignmentSourceType,
} from "./lead-assignment-settings.models";

@Injectable({ providedIn: "root" })
export class LeadAssignmentSettingsService {
  private readonly url = `${environment.apiBaseUrl}/admin/lead-assignment-settings`;

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  get(): Observable<LeadAssignmentSetting> {
    return this.http.get<LeadAssignmentSetting>(this.url, this.options());
  }

  update(assignmentSourceType: LeadAssignmentSourceType): Observable<LeadAssignmentSettingResult> {
    return this.http.put<LeadAssignmentSettingResult>(
      this.url,
      { assignmentSourceType },
      this.options(),
    );
  }

  private options(): { headers: HttpHeaders } {
    const token = this.auth.authToken();
    return {
      headers: token
        ? new HttpHeaders({ Authorization: `Bearer ${token}` })
        : new HttpHeaders(),
    };
  }
}
