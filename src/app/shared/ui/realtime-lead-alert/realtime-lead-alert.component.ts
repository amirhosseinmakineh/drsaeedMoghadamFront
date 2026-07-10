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
  LEAD_ALERT_MESSAGE,
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
  template: `
    @if (alerts.length > 0) {
      <div class="lead-alert-stack" aria-live="assertive" aria-atomic="false">
        @for (alert of alerts; track alert.leadId) {
          <section class="lead-alert-card">
            <span class="lead-alert-card__icon icon-bubble" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path
                  d="M12 2a7 7 0 0 1 7 7v3.09l1.45 2.9a1 1 0 0 1-.9 1.45H4.45a1 1 0 0 1-.9-1.45L5 12.09V9a7 7 0 0 1 7-7Zm0 20a3 3 0 0 0 2.83-2h-5.66A3 3 0 0 0 12 22Z"
                />
              </svg>
            </span>

            <p class="lead-alert-card__message">
              {{ leadAlertMessage }}
              <button
                type="button"
                class="lead-alert-card__action"
                [disabled]="alert.isSubmitting"
                (click)="pickup(alert.leadId)"
              >
                {{
                  alert.isSubmitting
                    ? "در حال دریافت..."
                    : leadAlertActionLabel
                }}
              </button>
            </p>

            <button
              type="button"
              class="lead-alert-card__dismiss"
              aria-label="بستن اعلان"
              title="بستن"
              [disabled]="alert.isSubmitting"
              (click)="dismiss(alert.leadId)"
            >
              <span aria-hidden="true">×</span>
            </button>
          </section>
        }
      </div>
    }
  `,
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
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-width: 0;
        margin: 2px 0 0;
        font-weight: 900;
        line-height: 1.7;
        text-align: center;
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
  readonly leadAlertMessage = LEAD_ALERT_MESSAGE;
  readonly leadAlertActionLabel = LEAD_ALERT_ACTION_LABEL;

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
