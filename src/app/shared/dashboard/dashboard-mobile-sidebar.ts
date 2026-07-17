import { DestroyRef } from "@angular/core";

const SIDEBAR_HISTORY_KEY = "dashboardMobileSidebar";

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
  let ignoreNextPopstate = false;

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
    if (!host.mobileSidebarOpen) return;

    if (history.state?.[SIDEBAR_HISTORY_KEY]) {
      ignoreNextPopstate = true;
      history.back();
    }

    setOpen(false);
  };

  const toggleMobileSidebar = (): void => {
    if (host.mobileSidebarOpen) {
      closeMobileSidebar();
      return;
    }

    setOpen(true);
    history.pushState({ [SIDEBAR_HISTORY_KEY]: true }, "");
  };

  const onPopstate = (): void => {
    if (ignoreNextPopstate) {
      ignoreNextPopstate = false;
      return;
    }

    if (host.mobileSidebarOpen) {
      setOpen(false);
    }
  };

  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || !host.mobileSidebarOpen) return;
    closeMobileSidebar();
  };

  window.addEventListener("popstate", onPopstate);
  window.addEventListener("keydown", onKeydown);
  destroyRef.onDestroy(() => {
    window.removeEventListener("popstate", onPopstate);
    window.removeEventListener("keydown", onKeydown);
    unlockBodyScroll();
  });

  return { toggleMobileSidebar, closeMobileSidebar };
}
