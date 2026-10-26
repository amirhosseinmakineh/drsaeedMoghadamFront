 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }export const LEAD_ALERT_MESSAGE = "شماره جدید دارید";
export const LEAD_ALERT_ACTION_LABEL = "ببین";
export const LEAD_ALERT_PUSH_TITLE = "شماره جدید دارید";
export const LEAD_ALERT_PUSH_BODY = "برای مشاهده، اعلان را باز کنید.";








export function buildRealtimeLeadNotificationTitle(
  details,
) {
  const name = normalizeLeadField(_optionalChain([details, 'optionalAccess', _ => _.userName]));
  const leadTitle =
    _optionalChain([details, 'optionalAccess', _2 => _2.leadLimitType]) === "Burnt" ? "لید سوخته" : "شماره جدید";
  if (!name) return leadTitle;
  return _optionalChain([details, 'optionalAccess', _3 => _3.isReminder]) ? `یادآوری ${leadTitle}: ${name}` : `${leadTitle}: ${name}`;
}

export function buildRealtimeLeadNotificationBody(
  details,
) {
  const phoneNumber = normalizeLeadField(_optionalChain([details, 'optionalAccess', _4 => _4.phoneNumber]));
  return phoneNumber ? `شماره تماس: ${phoneNumber}` : LEAD_ALERT_PUSH_BODY;
}

export function resolveRealtimeLeadNotificationTitle(
  details,
  fallbackTitle,
) {
  const builtTitle = buildRealtimeLeadNotificationTitle(details);
  if (builtTitle !== LEAD_ALERT_PUSH_TITLE) return builtTitle;
  return normalizeLeadField(fallbackTitle) || builtTitle;
}

export function resolveRealtimeLeadNotificationBody(
  details,
  fallbackBody,
) {
  return (
    buildRealtimeLeadNotificationBody(details) ||
    normalizeLeadField(fallbackBody) ||
    LEAD_ALERT_PUSH_BODY
  );
}

export function normalizeLeadField(value) {
  return typeof value === "string" ? value.trim() : "";
}
