export const LEAD_ALERT_MESSAGE = "شماره جدید دارید";
export const LEAD_ALERT_ACTION_LABEL = "ببین";
export const LEAD_ALERT_PUSH_TITLE = "شماره جدید دارید";
export const LEAD_ALERT_PUSH_BODY = "";

export interface RealtimeLeadNotificationDetails {
  userName?: string | null;
  phoneNumber?: string | null;
  isReminder?: boolean;
}

export function buildRealtimeLeadNotificationTitle(
  _details?: RealtimeLeadNotificationDetails,
): string {
  return LEAD_ALERT_PUSH_TITLE;
}

export function buildRealtimeLeadNotificationBody(
  _details?: RealtimeLeadNotificationDetails,
): string {
  return LEAD_ALERT_PUSH_BODY;
}

export function resolveRealtimeLeadNotificationTitle(
  _details?: RealtimeLeadNotificationDetails,
  _fallbackTitle?: string | null,
): string {
  return LEAD_ALERT_PUSH_TITLE;
}

export function resolveRealtimeLeadNotificationBody(
  _details?: RealtimeLeadNotificationDetails,
  _fallbackBody?: string | null,
): string {
  return LEAD_ALERT_PUSH_BODY;
}

export function normalizeLeadField(value?: string | null): string {
  return typeof value === "string" ? value.trim() : "";
}
