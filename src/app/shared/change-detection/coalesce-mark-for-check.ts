import { ChangeDetectorRef } from "@angular/core";

export function createCoalescedMarkForCheck(
  cdr: ChangeDetectorRef,
  isDestroyed: () => boolean,
): () => void {
  let scheduled = false;

  return () => {
    if (isDestroyed() || scheduled) return;

    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      if (!isDestroyed()) {
        cdr.markForCheck();
      }
    });
  };
}
