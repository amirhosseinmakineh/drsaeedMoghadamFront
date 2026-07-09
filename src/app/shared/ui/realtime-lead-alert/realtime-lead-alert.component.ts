import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
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
      <div class="realtime-lead-alert-layer" aria-live="assertive">
        @for (alert of alerts; track alert.leadId) {
          <section class="realtime-lead-alert-card">
            <div class="realtime-lead-alert-card__pulse" aria-hidden="true"></div>

            <header class="realtime-lead-alert-card__header">
              <span class="realtime-lead-alert-card__icon" aria-hidden="true">📣</span>
              <div>
                <h2>{{ alert.title }}</h2>
                <p>{{ alert.body }}</p>
              </div>
            </header>

            <p class="realtime-lead-alert-card__hint">
              اولین مشاوری که بردارد، لید را می‌گیرد. شما ۳ دقیقه برای تماس دارید.
            </p>

            <div class="realtime-lead-alert-card__actions">
              <button
                type="button"
                class="realtime-lead-alert-card__pickup"
                [disabled]="alert.isSubmitting"
                (click)="pickup(alert.leadId)"
              >
                {{ alert.isSubmitting ? "در حال برداشتن..." : "برداریدش!" }}
              </button>

              <button
                type="button"
                class="realtime-lead-alert-card__dismiss"
                [disabled]="alert.isSubmitting"
                (click)="dismiss(alert.leadId)"
              >
                رد کردن
              </button>
            </div>
          </section>
        }
      </div>
    }
  `,
  styles: [
    `
      .realtime-lead-alert-layer {
        position: fixed;
        inset: 0;
        z-index: 12000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        background: rgba(15, 23, 42, 0.72);
        backdrop-filter: blur(4px);
      }

      .realtime-lead-alert-card {
        position: relative;
        width: min(100%, 28rem);
        padding: 1.5rem;
        border-radius: 1.25rem;
        background: linear-gradient(160deg, #0f172a 0%, #1e293b 55%, #0f766e 100%);
        color: #f8fafc;
        box-shadow:
          0 24px 60px rgba(15, 23, 42, 0.45),
          0 0 0 1px rgba(255, 255, 255, 0.08);
        overflow: hidden;
        animation: realtimeLeadPop 280ms ease-out;
      }

      .realtime-lead-alert-card__pulse {
        position: absolute;
        inset: -30%;
        background: radial-gradient(
          circle,
          rgba(45, 212, 191, 0.28) 0%,
          transparent 65%
        );
        animation: realtimeLeadPulse 1.4s ease-in-out infinite;
        pointer-events: none;
      }

      .realtime-lead-alert-card__header {
        position: relative;
        display: flex;
        gap: 0.9rem;
        align-items: flex-start;
      }

      .realtime-lead-alert-card__icon {
        font-size: 2.4rem;
        line-height: 1;
      }

      .realtime-lead-alert-card__header h2 {
        margin: 0 0 0.35rem;
        font-size: 1.45rem;
        font-weight: 800;
      }

      .realtime-lead-alert-card__header p {
        margin: 0;
        color: #cbd5e1;
        line-height: 1.7;
      }

      .realtime-lead-alert-card__hint {
        position: relative;
        margin: 1rem 0 1.25rem;
        padding: 0.75rem 0.9rem;
        border-radius: 0.85rem;
        background: rgba(15, 23, 42, 0.45);
        color: #e2e8f0;
        font-size: 0.92rem;
        line-height: 1.7;
      }

      .realtime-lead-alert-card__actions {
        position: relative;
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 0.75rem;
      }

      .realtime-lead-alert-card__pickup,
      .realtime-lead-alert-card__dismiss {
        border: 0;
        border-radius: 0.9rem;
        padding: 0.95rem 1rem;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .realtime-lead-alert-card__pickup {
        background: linear-gradient(135deg, #14b8a6, #22d3ee);
        color: #0f172a;
        box-shadow: 0 10px 24px rgba(34, 211, 238, 0.35);
      }

      .realtime-lead-alert-card__pickup:disabled,
      .realtime-lead-alert-card__dismiss:disabled {
        opacity: 0.7;
        cursor: wait;
      }

      .realtime-lead-alert-card__dismiss {
        background: rgba(148, 163, 184, 0.18);
        color: #e2e8f0;
      }

      @keyframes realtimeLeadPop {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.96);
        }

        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes realtimeLeadPulse {
        0%,
        100% {
          transform: scale(1);
          opacity: 0.75;
        }

        50% {
          transform: scale(1.08);
          opacity: 1;
        }
      }

      @media (max-width: 480px) {
        .realtime-lead-alert-card__actions {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class RealtimeLeadAlertComponent implements OnInit, OnDestroy {
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
