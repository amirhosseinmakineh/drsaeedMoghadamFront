export const SMS_PANEL_LEAD_ALERT_TITLE = "لید جدید پنل پیامکی دارید";
export const LEAD_ALERT_MESSAGE = "شماره جدید دارید";
export const LEAD_ALERT_ACTION_LABEL = "ببین";
export const LEAD_ALERT_PUSH_TITLE = "شماره جدید دارید";
export const LEAD_ALERT_PUSH_BODY = "برای مشاهده، اعلان را باز کنید.";

export interface RealtimeLeadNotificationDetails {
  isSmsPanel?: boolean;
  leadLimitType?: "Realtime" | "Burnt";
  userName?: string | null;
  phoneNumber?: string | null;
  isReminder?: boolean;
}

export function buildRealtimeLeadNotificationTitle(
  details?: RealtimeLeadNotificationDetails,
): string {
  if (details?.isSmsPanel) return SMS_PANEL_LEAD_ALERT_TITLE;
  const name = normalizeLeadField(details?.userName);
  const leadTitle =
    details?.leadLimitType === "Burnt" ? "لید سوخته" : "شماره جدید";
  if (!name) return leadTitle;
  return details?.isReminder ? `یادآوری ${leadTitle}: ${name}` : `${leadTitle}: ${name}`;
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
