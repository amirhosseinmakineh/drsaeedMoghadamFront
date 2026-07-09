export const OFFLINE_LEAD_PUSH_TITLE = "لید آفلاین جدید!";

export const OFFLINE_LEAD_ALERT_SOUND_URL = "/sounds/offline-lead-alert.mp3";

export const OFFLINE_LEAD_VIBRATE_PATTERN = [
  400, 120, 400, 120, 400, 120, 400, 120, 400,
];

export function formatOfflineLeadPushBody(count?: string | number | null): string {
  const leadCount = count ?? "چند";
  return `${leadCount} لید آفلاین داری، بیا اینارو تعیین تکلیف کن`;
}

export function resolveOfflineLeadPushContent(
  payload: {
    title?: string;
    body?: string;
    data?: Record<string, string>;
  } = {},
): { title: string; body: string } {
  const count = payload.data?.["count"];
  if (payload.data?.["type"] === "offline_leads") {
    return {
      title: OFFLINE_LEAD_PUSH_TITLE,
      body: formatOfflineLeadPushBody(count),
    };
  }

  return {
    title: payload.title || OFFLINE_LEAD_PUSH_TITLE,
    body: payload.body || formatOfflineLeadPushBody(count),
  };
}
