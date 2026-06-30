import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import {
  AdminDashboardService,
  ApiCommandResponse,
  CompletePatientProfileRequest,
  CompletePatientProfileResponse,
  PaginatedResponse,
  ReviewAttendanceRequest,
  SecretaryReservation,
  SecretaryReservationFilters,
} from "../admin/admin-dashboard.service";

@Injectable({ providedIn: "root" })
export class SecretaryDashboardService {
  constructor(private readonly adminApi: AdminDashboardService) {}

  getReservations(
    filters: SecretaryReservationFilters,
  ): Observable<PaginatedResponse<SecretaryReservation>> {
    return this.adminApi.getSecretaryReservations(filters);
  }

  reviewAttendance(
    payload: ReviewAttendanceRequest,
  ): Observable<ApiCommandResponse> {
    return this.adminApi.reviewAttendance(payload);
  }

  completePatientProfile(
    payload: CompletePatientProfileRequest,
  ): Observable<ApiCommandResponse<CompletePatientProfileResponse>> {
    return this.adminApi.completePatientProfile(payload);
  }
}
