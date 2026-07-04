import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { Subscription } from "rxjs";
import { FaIconComponent } from "../fa-icon/fa-icon.component";
import {
  ActiveBroadcastLead,
  LeadBroadcastService,
} from "../../../core/lead-broadcast/lead-broadcast.service";

@Component({
  selector: "app-lead-broadcast-modal",
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (activeLead) {
      <div class="broadcast-overlay" role="dialog" aria-modal="true">
        <div class="broadcast-card">
          <div class="broadcast-pulse" aria-hidden="true">
            <app-fa-icon name="phone"></app-fa-icon>
          </div>
          <p class="broadcast-kicker">لید جدید</p>
          <h2>یک لید منتظر پذیرش است</h2>
          <p class="broadcast-copy">
            {{ activeLead.maskedName }}
            <span>شماره بعد از پذیرش نمایش داده می‌شود.</span>
          </p>

          <div class="broadcast-actions">
            <button
              class="accept-btn"
              type="button"
              [disabled]="accepting"
              (click)="accept()"
            >
              {{
                accepting ? "در حال پذیرش..." : "پذیرش و تماس"
              }}
            </button>
            <button
              class="reject-btn"
              type="button"
              [disabled]="accepting"
              (click)="dismiss()"
            >
              رد کردن
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .broadcast-overlay {
        position: fixed;
        inset: 0;
        z-index: 12000;
        display: grid;
        place-items: center;
        padding: 20px;
        background: rgba(8, 15, 30, 0.72);
        backdrop-filter: blur(8px);
      }

      .broadcast-card {
        width: min(420px, 100%);
        border-radius: 28px;
        padding: 28px 24px 24px;
        background: linear-gradient(180deg, #ffffff, #f4f8ff);
        box-shadow: 0 24px 80px rgba(15, 23, 42, 0.28);
        text-align: center;
      }

      .broadcast-pulse {
        width: 84px;
        height: 84px;
        margin: 0 auto 16px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        color: #fff;
        background: linear-gradient(135deg, #16a34a, #22c55e);
        animation: pulse 1.2s ease-in-out infinite;
        font-size: 1.8rem;
      }

      .broadcast-kicker {
        margin: 0;
        color: #16a34a;
        font-weight: 700;
      }

      h2 {
        margin: 8px 0 12px;
        font-size: 1.5rem;
      }

      .broadcast-copy {
        margin: 0 0 24px;
        color: #475569;
        line-height: 1.7;
      }

      .broadcast-copy span {
        display: block;
        margin-top: 6px;
        font-size: 0.92rem;
      }

      .broadcast-actions {
        display: grid;
        gap: 12px;
      }

      .accept-btn,
      .reject-btn {
        border: 0;
        border-radius: 16px;
        padding: 14px 18px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .accept-btn {
        background: #16a34a;
        color: #fff;
      }

      .accept-btn:disabled,
      .reject-btn:disabled {
        opacity: 0.7;
        cursor: wait;
      }

      .reject-btn {
        background: #e2e8f0;
        color: #334155;
      }

      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.45);
        }
        50% {
          transform: scale(1.04);
          box-shadow: 0 0 0 18px rgba(34, 197, 94, 0);
        }
      }
    `,
  ],
})
export class LeadBroadcastModalComponent implements OnInit, OnDestroy {
  activeLead: ActiveBroadcastLead | null = null;
  accepting = false;

  private subscriptions = new Subscription();
  private acceptHandler?: (leadAssignmentId: number) => void;

  constructor(
    private broadcastService: LeadBroadcastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.broadcastService.activeLead$.subscribe((lead) => {
        this.activeLead = lead;
        this.cdr.markForCheck();
      }),
    );
    this.subscriptions.add(
      this.broadcastService.accepting$.subscribe((accepting) => {
        this.accepting = accepting;
        this.cdr.markForCheck();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  registerAcceptHandler(handler: (leadAssignmentId: number) => void): void {
    this.acceptHandler = handler;
  }

  async accept(): Promise<void> {
    if (!this.activeLead || this.accepting) return;

    try {
      const accepted = await this.broadcastService.acceptActiveLead();
      this.acceptHandler?.(accepted.leadAssignmentId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "پذیرش لید انجام نشد.";
      window.dispatchEvent(
        new CustomEvent("consultant-broadcast-error", { detail: { message } }),
      );
    }
  }

  dismiss(): void {
    this.broadcastService.dismissActiveLead();
  }
}
