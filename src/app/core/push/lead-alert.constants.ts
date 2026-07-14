/** Strong vibration pattern for realtime lead OS + in-app alerts (Android). */
export const REALTIME_LEAD_VIBRATE_PATTERN = [
  400, 120, 400, 120, 400, 120, 500, 120, 500,
] as const;

/** How often each device re-registers its push subscription with the backend. */
export const PUSH_BACKEND_SYNC_INTERVAL_MS = 5 * 60 * 1000;

/** Periodic health-check while a consultant session is active. */
export const PUSH_SUBSCRIPTION_HEALTH_CHECK_MS = 4 * 60 * 1000;
