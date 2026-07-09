import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, map, of } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { environment } from "../../../environments/environment";
import { ApiCommandResponse } from "../consultant/consultant-dashboard.service";

export type PickupLeadStatus =
  | "success"
  | "alreadyTaken"
  | "dailyLimitReached"
  | "error";

export interface PickupLeadResponse {
  status: PickupLeadStatus;
  message: string;
  leadAssignmentId?: number;
  consultantProfileId?: number;
  callDeadlineAt?: string;
}

interface PickupLeadData {
  leadAssignmentId?: number;
  consultantProfileId?: number;
  callDeadlineAt?: string;
}

interface CanPickupData {
  canPickup?: boolean;
  dailyLimit?: number;
  message?: string | null;
}

@Injectable({ providedIn: "root" })
export class RealtimeLeadPickupService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  canPickupLead(profileId: number): Observable<boolean> {
    return this.http
      .get<ApiCommandResponse<CanPickupData>>(
        `${this.apiBaseUrl}/Consultant/CanPickupLead`,
        {
          headers: this.authHeaders(),
          params: { profileId },
        },
      )
      .pipe(
        map((response) => {
          const data = response.data ?? (response as { Data?: CanPickupData }).Data;
          return Boolean(data?.canPickup);
        }),
        catchError(() => of(false)),
      );
  }

  pickupLead(
    leadAssignmentId: number,
    consultantProfileId: number,
  ): Observable<PickupLeadResponse> {
    return this.http
      .post<ApiCommandResponse<PickupLeadData>>(
        `${this.apiBaseUrl}/LeadAssignment/${leadAssignmentId}/pickup`,
        null,
        {
          headers: this.authHeaders(),
          params: { consultantProfileId },
        },
      )
      .pipe(
        map((response) => ({
          status: "success" as const,
          message: response.message ?? "لید با موفقیت برداشته شد",
          leadAssignmentId:
            response.data?.leadAssignmentId ??
            (response as { Data?: PickupLeadData }).Data?.leadAssignmentId,
          consultantProfileId:
            response.data?.consultantProfileId ??
            (response as { Data?: PickupLeadData }).Data?.consultantProfileId,
          callDeadlineAt:
            response.data?.callDeadlineAt ??
            (response as { Data?: PickupLeadData }).Data?.callDeadlineAt,
        })),
        catchError((error: HttpErrorResponse) => of(this.mapPickupError(error))),
      );
  }

  private mapPickupError(error: HttpErrorResponse): PickupLeadResponse {
    const body = error.error as ApiCommandResponse | string | null;
    const message =
      body && typeof body === "object"
        ? (body.message ?? "عملیات ناموفق بود")
        : typeof body === "string" && body.trim()
          ? body
          : error.message;

    if (error.status === 429) {
      return { status: "dailyLimitReached", message };
    }

    if (error.status === 409) {
      return { status: "alreadyTaken", message };
    }

    return { status: "error", message };
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth.authToken();
    const baseHeaders: Record<string, string> = { Accept: "application/json" };
    if (token) baseHeaders["Authorization"] = `Bearer ${token}`;
    return new HttpHeaders(baseHeaders);
  }
}
