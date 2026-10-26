





function lockBodyScroll() {
  document.body.style.overflow = "hidden";
}

function unlockBodyScroll() {
  document.body.style.overflow = "";
}

export function bindDashboardMobileSidebar(
  host,
  markDirty,
  destroyRef,
)


 {
  const setOpen = (open) => {
    host.mobileSidebarOpen = open;
    if (open) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
    markDirty();
  };

  const closeMobileSidebar = () => {
    setOpen(false);
  };

  const toggleMobileSidebar = () => {
    setOpen(!host.mobileSidebarOpen);
  };

  const onKeydown = (event) => {
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
