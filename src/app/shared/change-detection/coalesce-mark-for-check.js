

export function createCoalescedMarkForCheck(
  cdr,
  isDestroyed,
) {
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
