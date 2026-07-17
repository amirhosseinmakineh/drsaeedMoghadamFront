import { DestroyRef } from "@angular/core";

export interface MobileSidebarHost {
  mobileSidebarOpen: boolean;
}

function lockBodyScroll(): void {
  document.body.style.overflow = "hidden";
}

function unlockBodyScroll(): void {
  document.body.style.overflow = "";
}

export function bindDashboardMobileSidebar(
  host: MobileSidebarHost,
  markDirty: () => void,
  destroyRef: DestroyRef,
): {
  toggleMobileSidebar(): void;
  closeMobileSidebar(): void;
} {
  const setOpen = (open: boolean): void => {
    if (host.mobileSidebarOpen === open) return;

    host.mobileSidebarOpen = open;
    if (open) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
    markDirty();
  };

  const closeMobileSidebar = (): void => {
    setOpen(false);
  };

  const toggleMobileSidebar = (): void => {
    setOpen(!host.mobileSidebarOpen);
  };

  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || !host.mobileSidebarOpen) return;
    closeMobileSidebar();
  };

  window.addEventListener("keydown", onKeydown);
  destroyRef.onDestroy(() => {
    window.removeEventListener("keydown", onKeydown);
    unlockBodyScroll();
  });

  return { toggleMobileSidebar, closeMobileSidebar };
}
