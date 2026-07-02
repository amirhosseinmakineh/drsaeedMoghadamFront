import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import {
  ToastMessage,
  ToastService,
} from "../../../core/toast/toast.service";

@Component({
  selector: "app-toast-container",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="false">
      @for (toast of toasts; track toast.id) {
        <p
          class="toast"
          [class.success]="toast.type === 'success'"
          [class.error]="toast.type === 'error'"
          [class.info]="toast.type === 'info'"
          role="status"
        >
          {{ toast.message }}
        </p>
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
        width: min(420px, calc(100vw - 24px));
        transform: translateX(-50%);
        pointer-events: none;
      }
      .toast {
        margin: 0;
        padding: 12px 16px;
        border-radius: 16px;
        border: 1px solid var(--line);
        background: var(--surface);
        color: var(--text);
        box-shadow: var(--shadow);
        font-weight: 900;
        line-height: 1.6;
        text-align: center;
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
      const timer = setTimeout(() => this.dismiss(toast.id), 4200);
      this.timers.set(toast.id, timer);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }

  private dismiss(id: number): void {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }
}
