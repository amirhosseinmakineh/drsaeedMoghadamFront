import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { RealtimeLeadAlertService } from "../lead/realtime-lead-alert.service";
import { PushNotificationService } from "../push/push-notification.service";

@Injectable({ providedIn: "root" })
export class LogoutService {
  constructor(
    private readonly auth: AuthService,
    private readonly realtimeLeadAlerts: RealtimeLeadAlertService,
    private readonly pushNotifications: PushNotificationService,
  ) {}

  logout(): void {
    this.realtimeLeadAlerts.teardownOnLogout();
    this.pushNotifications.resetRegisteredTokenCache();
    this.auth.logout();
  }
}
