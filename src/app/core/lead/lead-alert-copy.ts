export const LEAD_ALERT_MESSAGE = "لید جدیدی دارید. جهت دریافت";
export const LEAD_ALERT_ACTION_LABEL = "روی آن کلیک کنید.";
export const LEAD_ALERT_PUSH_TITLE = "لید جدیدی دارید";
export const LEAD_ALERT_PUSH_BODY = "جهت دریافت روی آن کلیک کنید.";

export interface RealtimeLeadNotificationDetails {
  userName?: string | null;
  phoneNumber?: string | null;
  isReminder?: boolean;
}

export function buildRealtimeLeadNotificationTitle(
  details?: RealtimeLeadNotificationDetails,
): string {
  const name = normalizeLeadField(details?.userName);
  if (!name) return LEAD_ALERT_PUSH_TITLE;
  return details?.isReminder ? `یادآوری لید: ${name}` : `لید جدید: ${name}`;
}

export function buildRealtimeLeadNotificationBody(
  details?: RealtimeLeadNotificationDetails,
): string {
  const phone = normalizeLeadField(details?.phoneNumber);
  if (!phone) return LEAD_ALERT_PUSH_BODY;
  return `شماره تماس: ${phone} — جهت دریافت روی اعلان کلیک کنید.`;
}

function normalizeLeadField(value?: string | null): string {
  return typeof value === "string" ? value.trim() : "";
}
