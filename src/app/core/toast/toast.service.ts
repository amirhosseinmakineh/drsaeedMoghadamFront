import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export type ToastType = "success" | "error" | "info";

export interface ToastAction {
  label: string;
  handler: () => void;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  action?: ToastAction;
  autoDismissMs?: number | null;
}

@Injectable({ providedIn: "root" })
export class ToastService {
  private nextId = 0;
  private readonly messagesSubject = new Subject<ToastMessage>();
  readonly messages$ = this.messagesSubject.asObservable();

  success(message: string): void {
    this.show(message, "success");
  }

  error(message: string): void {
    this.show(message, "error");
  }

  info(message: string): void {
    this.show(message, "info");
  }

  action(
    message: string,
    action: ToastAction,
    type: ToastType = "info",
    autoDismissMs: number | null = null,
  ): void {
    this.emit(message, type, action, autoDismissMs);
  }

  show(message: string, type: ToastType = "info"): void {
    this.emit(message, type);
  }

  private emit(
    message: string,
    type: ToastType,
    action?: ToastAction,
    autoDismissMs: number | null = 2000,
  ): void {
    const trimmed = message.trim();
    if (!trimmed) return;

    this.messagesSubject.next({
      id: ++this.nextId,
      message: trimmed,
      type,
      action,
      autoDismissMs,
    });
  }
}
