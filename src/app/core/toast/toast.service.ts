import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
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

  show(message: string, type: ToastType = "info"): void {
    const trimmed = message.trim();
    if (!trimmed) return;

    this.messagesSubject.next({
      id: ++this.nextId,
      message: trimmed,
      type,
    });
  }
}
