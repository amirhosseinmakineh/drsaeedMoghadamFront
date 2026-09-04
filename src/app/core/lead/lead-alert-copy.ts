export const LEAD_ALERT_MESSAGE = "شماره جدید دارید";
export const LEAD_ALERT_ACTION_LABEL = "ببین";
export const LEAD_ALERT_PUSH_TITLE = "شماره جدید دارید";
export const LEAD_ALERT_PUSH_BODY = "برای مشاهده، اعلان را باز کنید.";

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
  return details?.isReminder ? `یادآوری شماره: ${name}` : `شماره جدید: ${name}`;
}

export function buildRealtimeLeadNotificationBody(
  details?: RealtimeLeadNotificationDetails,
): string {
  const phoneNumber = normalizeLeadField(details?.phoneNumber);
  return phoneNumber ? `شماره تماس: ${phoneNumber}` : LEAD_ALERT_PUSH_BODY;
}

export function resolveRealtimeLeadNotificationTitle(
  details?: RealtimeLeadNotificationDetails,
  fallbackTitle?: string | null,
): string {
  const builtTitle = buildRealtimeLeadNotificationTitle(details);
  if (builtTitle !== LEAD_ALERT_PUSH_TITLE) return builtTitle;
  return normalizeLeadField(fallbackTitle) || builtTitle;
}

export function resolveRealtimeLeadNotificationBody(
  details?: RealtimeLeadNotificationDetails,
  fallbackBody?: string | null,
): string {
  return (
    buildRealtimeLeadNotificationBody(details) ||
    normalizeLeadField(fallbackBody) ||
    LEAD_ALERT_PUSH_BODY
  );
}

export function normalizeLeadField(value?: string | null): string {
  return typeof value === "string" ? value.trim() : "";
}
