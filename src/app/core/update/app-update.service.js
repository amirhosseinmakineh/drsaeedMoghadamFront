import { isDevMode } from "@angular/core";

import { catchError, filter, interval, merge, of, startWith, Subject, switchMap } from "rxjs";

@Injectable({ providedIn: "root" })
export class AppUpdateService {
    __init() {this.visibilityChecks = new Subject()}
   __init2() {this.started = false}
   __init3() {this.activating = false}

  constructor(  updates) {;this.updates = updates;AppUpdateService.prototype.__init.call(this);AppUpdateService.prototype.__init2.call(this);AppUpdateService.prototype.__init3.call(this);}

  start() {
    if (this.started || isDevMode() || !this.updates.isEnabled) return;
    this.started = true;

    this.updates.versionUpdates
      .pipe(filter((event) => event.type === "VERSION_READY"))
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

   async activateAndReload() {
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
