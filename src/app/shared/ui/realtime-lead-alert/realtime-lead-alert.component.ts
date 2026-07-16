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
  styles: [
    `
      .lead-alert-stack {
        position: fixed;
        top: 18px;
        left: 50%;
        z-index: 12001;
        display: grid;
        gap: 10px;
        width: min(460px, calc(100vw - 24px));
        transform: translateX(-50%);
        pointer-events: none;
      }

      .lead-alert-card {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin: 0;
        padding: 14px 12px 14px 14px;
        border: 1px solid color-mix(in srgb, var(--brand) 42%, var(--line));
        border-radius: 18px;
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--brand) 12%, var(--surface)),
          color-mix(in srgb, var(--brand-2) 10%, var(--surface))
        );
        color: var(--text);
        box-shadow: var(--shadow);
        pointer-events: auto;
      }

      .lead-alert-card__icon {
        flex: 0 0 auto;
        width: 42px;
        height: 42px;
        border-radius: 16px;
      }

      .lead-alert-card__message {
        display: flex;
        flex: 1;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-width: 0;
        margin: 2px 0 0;
        font-weight: 900;
        line-height: 1.7;
        text-align: center;
      }

      .lead-alert-card__title {
        font-size: 1rem;
        font-weight: 950;
      }

      .lead-alert-card__body {
        font-size: 0.92rem;
        font-weight: 800;
        color: color-mix(in srgb, var(--text) 88%, var(--brand));
      }

      .lead-alert-card__action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 36px;
        padding: 8px 14px;
        border: 0;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--brand), var(--brand-2));
        color: #1b1712;
        font: inherit;
        font-weight: 950;
        line-height: 1.4;
        cursor: pointer;
        box-shadow: 0 12px 28px color-mix(in srgb, var(--brand) 22%, transparent);
      }

      .lead-alert-card__action:disabled {
        opacity: 0.75;
        cursor: wait;
      }

      .lead-alert-card__dismiss {
        flex: 0 0 auto;
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        margin: 0;
        padding: 0;
        border: 1px solid color-mix(in srgb, currentColor 24%, transparent);
        border-radius: 999px;
        background: color-mix(in srgb, var(--surface) 72%, transparent);
        color: inherit;
        font-size: 1.35rem;
        line-height: 1;
        cursor: pointer;
      }

      .lead-alert-card__dismiss span {
        display: block;
        margin-top: -2px;
      }

      .lead-alert-card__dismiss:disabled {
        opacity: 0.6;
        cursor: wait;
      }
    `,
  ],
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
}
