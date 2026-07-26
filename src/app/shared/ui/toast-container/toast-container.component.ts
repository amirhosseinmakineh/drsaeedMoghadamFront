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
  templateUrl: "./toast-container.component.html",
  styleUrl: "./toast-container.component.scss",
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
