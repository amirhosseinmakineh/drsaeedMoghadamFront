import { Injectable, isDevMode } from "@angular/core";
import { SwUpdate, VersionEvent } from "@angular/service-worker";
import { catchError, filter, interval, merge, of, startWith, Subject, switchMap } from "rxjs";

@Injectable({ providedIn: "root" })
export class AppUpdateService {
  private readonly visibilityChecks = new Subject<void>();
  private started = false;
  private activating = false;

  constructor(private readonly updates: SwUpdate) {}

  start(): void {
    if (this.started || isDevMode() || !this.updates.isEnabled) return;
    this.started = true;

    this.updates.versionUpdates
      .pipe(filter((event: VersionEvent) => event.type === "VERSION_READY"))
      .subscribe(() => void this.activateAndReload());

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") this.visibilityChecks.next();
    });

    merge(interval(5 * 60 * 1000), this.visibilityChecks)
      .pipe(
        startWith(0),
        switchMap(() => this.updates.checkForUpdate().catch(error => {
          console.warn("App update check failed", error);
          return false;
        })),
        catchError(error => {
          console.warn("App update stream failed", error);
          return of(false);
        }),
      )
      .subscribe();
  }

  private async activateAndReload(): Promise<void> {
    if (this.activating) return;
    this.activating = true;
    try {
      await this.updates.activateUpdate();
      window.location.reload();
    } catch (error) {
      this.activating = false;
      console.warn("App update activation failed", error);
    }
  }
}
