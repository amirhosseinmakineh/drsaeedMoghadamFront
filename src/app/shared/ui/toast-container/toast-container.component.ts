import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import {
  ToastMessage,
  ToastService,
} from "../../../core/toast/toast.service";

const DEFAULT_TOAST_AUTO_DISMISS_MS = 2000;

@Component({
  selector: "app-toast-container",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="false">
      @for (toast of toasts; track toast.id) {
        <div
          class="toast"
          [class.success]="toast.type === 'success'"
          [class.error]="toast.type === 'error'"
          [class.info]="toast.type === 'info'"
          [class.has-action]="toast.action"
          role="status"
        >
          <div class="toast-content">
            <p class="toast-message">
              {{ toast.message }}
              @if (toast.action) {
                <button
                  class="toast-action"
                  type="button"
                  (click)="runAction(toast)"
                >
                  {{ toast.action.label }}
                </button>
              }
            </p>
          </div>
          <button
            class="toast-dismiss"
            type="button"
            aria-label="بستن اعلان"
            title="بستن"
            (click)="dismiss(toast.id)"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-stack {
        position: fixed;
        top: 18px;
        left: 50%;
        z-index: 12000;
        display: grid;
        gap: 10px;
        width: min(460px, calc(100vw - 24px));
        transform: translateX(-50%);
        pointer-events: none;
      }
      .toast {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin: 0;
        padding: 12px 12px 12px 16px;
        border-radius: 16px;
        border: 1px solid var(--line);
        background: var(--surface);
        color: var(--text);
        box-shadow: var(--shadow);
        font-weight: 900;
        line-height: 1.6;
        pointer-events: auto;
      }
      .toast.has-action {
        padding: 14px 12px 14px 16px;
        border-color: color-mix(in srgb, var(--brand) 42%, var(--line));
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--brand) 10%, var(--surface)),
          color-mix(in srgb, var(--brand-2) 8%, var(--surface))
        );
      }
      .toast-content {
        flex: 1;
        min-width: 0;
      }
      .toast-message {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin: 0;
        text-align: center;
      }
      .toast-action {
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
      .toast-action:hover {
        filter: brightness(1.03);
      }
      .toast-dismiss {
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
      .toast-dismiss span {
        display: block;
        margin-top: -2px;
      }
      .toast-dismiss:hover {
        background: color-mix(in srgb, var(--text) 12%, var(--surface));
      }
      .toast.success {
        border-color: color-mix(in srgb, #16a34a 40%, var(--line));
        background: color-mix(in srgb, #16a34a 12%, var(--surface));
        color: #14532d;
      }
      .toast.error {
        border-color: color-mix(in srgb, var(--danger) 40%, var(--line));
        background: color-mix(in srgb, var(--danger) 12%, var(--surface));
        color: #991b1b;
      }
      .toast.info {
        border-color: color-mix(in srgb, var(--brand) 40%, var(--line));
        background: color-mix(in srgb, var(--brand) 10%, var(--surface));
        color: var(--text);
      }
      .toast.info.has-action {
        border-color: color-mix(in srgb, var(--brand) 42%, var(--line));
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--brand) 10%, var(--surface)),
          color-mix(in srgb, var(--brand-2) 8%, var(--surface))
        );
      }
    `,
  ],
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription: Subscription | null = null;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.messages$.subscribe((toast) => {
      this.toasts = [...this.toasts, toast];
      const autoDismissMs =
        toast.autoDismissMs === undefined
          ? DEFAULT_TOAST_AUTO_DISMISS_MS
          : toast.autoDismissMs;
      if (autoDismissMs === null) return;

      const timer = setTimeout(() => this.dismiss(toast.id), autoDismissMs);
      this.timers.set(toast.id, timer);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }

  runAction(toast: ToastMessage): void {
    toast.action?.handler();
    this.dismiss(toast.id);
  }

  dismiss(id: number): void {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }
}
