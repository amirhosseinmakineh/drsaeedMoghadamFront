import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
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

  constructor(
    private readonly alertService: RealtimeLeadAlertService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
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
