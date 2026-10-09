import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from "@angular/core";
import { Subscription } from "rxjs";
import {
  LEAD_ALERT_ACTION_LABEL,
  LEAD_ALERT_PUSH_TITLE,
} from "../../../core/lead/lead-alert-copy";
import {
  RealtimeLeadAlert,
  RealtimeLeadAlertService,
} from "../../../core/lead/realtime-lead-alert.service";

@Component({
  selector: "app-realtime-lead-alert",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: "./realtime-lead-alert.component.html",
  styleUrl: "./realtime-lead-alert.component.scss",
})
export class RealtimeLeadAlertComponent implements OnInit, OnDestroy {
  readonly leadAlertActionLabel = LEAD_ALERT_ACTION_LABEL;
  readonly leadAlertTitle = LEAD_ALERT_PUSH_TITLE;

  alerts: readonly RealtimeLeadAlert[] = [];
  private subscription: Subscription | null = null;
  private readonly isBrowser: boolean;

  constructor(
    private readonly injector: Injector,
    private readonly cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private get alertService(): RealtimeLeadAlertService {
    return this.injector.get(RealtimeLeadAlertService);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.alertService.initialize();
    this.subscription = this.alertService.alerts$.subscribe((alerts) => {
      this.alerts = alerts;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  pickup(leadId: number): void {
    void this.alertService.tryPickupLead(leadId);
  }

  dismiss(leadId: number): void {
    this.alertService.dismissLead(leadId);
  }

  titleFor(alert: RealtimeLeadAlert): string {
    return alert.leadLimitType === "Burnt"
      ? "لید سوخته دارید"
      : this.leadAlertTitle;
  }
}
