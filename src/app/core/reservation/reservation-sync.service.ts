import { Injectable, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({ providedIn: "root" })
export class ReservationSyncService implements OnDestroy {
  private static readonly channelName = "reservation-updates";
  private readonly refreshSubject = new Subject<void>();
  private readonly channel =
    typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel(ReservationSyncService.channelName);

  readonly refreshRequested$ = this.refreshSubject.asObservable();

  constructor() {
    if (this.channel) {
      this.channel.onmessage = () => this.refreshSubject.next();
    }
  }

  requestRefresh(): void {
    this.refreshSubject.next();
    this.channel?.postMessage("refresh");
  }

  ngOnDestroy(): void {
    this.channel?.close();
    this.refreshSubject.complete();
  }
}
