export const DASHBOARD_MOBILE_LAYOUT_STYLES = `
  .dashboard-mobile-header {
    display: none;
  }
  .mobile-sidebar-backdrop,
  .mobile-sidebar-close,
  .mobile-sidebar-header,
  .mobile-menu-btn {
    display: none;
  }

  @media (max-width: 980px) {
    .dashboard-layout {
      grid-template-columns: 1fr;
      width: 100%;
      padding: 10px 10px calc(24px + env(safe-area-inset-bottom, 0px));
    }

    .dashboard-mobile-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      position: sticky;
      top: 0;
      z-index: 90;
      margin-bottom: 10px;
      padding: 10px 12px;
      border: 1px solid var(--line);
      border-radius: 22px;
      background: var(--surface);
      box-shadow: 0 8px 22px rgba(93, 64, 32, 0.08);
    }

    .mobile-header-info {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .mobile-avatar {
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 16px;
      background: color-mix(in srgb, var(--brand) 16%, transparent);
      color: var(--brand);
      flex-shrink: 0;
    }

    .mobile-header-info strong {
      display: block;
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mobile-header-info small {
      display: block;
      color: var(--muted);
      font-weight: 900;
      font-size: 0.78rem;
    }

    .mobile-logout-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 8px 12px;
      background: var(--surface-muted);
      color: var(--text);
      font: inherit;
      font-weight: 950;
      font-size: 0.82rem;
    }

    .mobile-menu-btn {
      display: inline-grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border: 1px solid var(--line);
      border-radius: 16px;
      background: var(--surface-muted);
      color: var(--brand);
      flex-shrink: 0;
    }

    .mobile-sidebar-backdrop {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 95;
      border: 0;
      background: rgba(20, 16, 12, 0.42);
    }

    .dashboard-sidebar {
      position: fixed;
      z-index: 100;
      top: 0;
      inset-inline-start: 0;
      bottom: 0;
      width: min(300px, 86vw);
      margin: 0;
      padding: 18px 16px calc(18px + env(safe-area-inset-bottom, 0px));
      border-start-start-radius: 0;
      border-end-start-radius: 28px;
      border-end-end-radius: 28px;
      border-start-end-radius: 0;
      border-inline-start: 0;
      transition: transform 0.28s ease, visibility 0.28s ease;
      overflow-y: auto;
      box-shadow: 12px 0 32px rgba(93, 64, 32, 0.16);
      transform: translateX(105%);
      visibility: hidden;
      pointer-events: none;
    }

    :host-context([dir="ltr"]) .dashboard-sidebar {
      transform: translateX(-105%);
    }

    .dashboard-sidebar.mobile-sidebar-open {
      transform: translateX(0);
      visibility: visible;
      pointer-events: auto;
    }

    .mobile-sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 4px;
    }

    .mobile-sidebar-header strong {
      font-size: 0.92rem;
    }

    .mobile-sidebar-close-x {
      display: inline-grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border: 1px solid var(--line);
      border-radius: 14px;
      background: var(--surface-muted);
      color: var(--text);
      flex-shrink: 0;
    }

    .dashboard-sidebar .logout-btn {
      display: none;
    }

    .mobile-sidebar-close {
      display: block;
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 10px 12px;
      background: var(--surface-muted);
      font: inherit;
      font-weight: 950;
    }

    .dashboard-nav {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .dashboard-nav button {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 48px;
      padding: 10px 12px;
      border-radius: 16px;
      text-align: start;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .dashboard-nav button span {
      display: block;
      overflow: visible;
      -webkit-line-clamp: unset;
    }

    .dashboard-nav app-fa-icon {
      color: var(--brand);
      font-size: 1rem;
      flex-shrink: 0;
    }

    .dashboard-content {
      padding-top: 10px;
    }
  }
`;
