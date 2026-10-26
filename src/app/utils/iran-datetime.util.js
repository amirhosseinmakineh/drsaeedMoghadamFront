 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }export const IRAN_TIME_ZONE = "Asia/Tehran";
const IRAN_UTC_OFFSET = "+03:30";
const IRAN_DATE_PARTS_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: IRAN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const IRAN_TIME_PARTS_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: IRAN_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const RESERVATION_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export function nowInIran() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: IRAN_TIME_ZONE }),
  );
}

export function startOfIranDay(date = nowInIran()) {
  return fromIranDateInputValue(toIranDateInputValue(date));
}

export function parseIranDateParts(date)



 {
  const parts = IRAN_DATE_PARTS_FORMATTER.formatToParts(date);

  return {
    year: Number(_optionalChain([parts, 'access', _ => _.find, 'call', _2 => _2((part) => part.type === "year"), 'optionalAccess', _3 => _3.value])),
    month: Number(_optionalChain([parts, 'access', _4 => _4.find, 'call', _5 => _5((part) => part.type === "month"), 'optionalAccess', _6 => _6.value])),
    day: Number(_optionalChain([parts, 'access', _7 => _7.find, 'call', _8 => _8((part) => part.type === "day"), 'optionalAccess', _9 => _9.value])),
  };
}

export function parseIranTimeParts(date)


 {
  const parts = IRAN_TIME_PARTS_FORMATTER.formatToParts(date);

  return {
    hours: Number(_optionalChain([parts, 'access', _10 => _10.find, 'call', _11 => _11((part) => part.type === "hour"), 'optionalAccess', _12 => _12.value])),
    minutes: Number(_optionalChain([parts, 'access', _13 => _13.find, 'call', _14 => _14((part) => part.type === "minute"), 'optionalAccess', _15 => _15.value])),
  };
}

export function toIranDateInputValue(date) {
  const { year, month, day } = parseIranDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function fromIranDateInputValue(value) {
  return new Date(`${value}T00:00:00${IRAN_UTC_OFFSET}`);
}

export function toIranTimeInputValue(date) {
  const { hours, minutes } = parseIranTimeParts(date);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function combineIranDateAndTime(date, time) {
  const dateValue = toIranDateInputValue(date);
  const [hours, minutes] = time.split(":").map(Number);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  const combined = new Date(
    `${dateValue}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00${IRAN_UTC_OFFSET}`,
  );
  return Number.isNaN(combined.getTime()) ? null : combined;
}

export function nowInIranMs() {
  return nowInIran().getTime();
}

export function formatIranDateTime(
  value,
  options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  },
) {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("fa-IR", {
    ...options,
    timeZone: IRAN_TIME_ZONE,
  }).format(date);
}

export function formatIranDate(value) {
  return formatIranDateTime(value, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatIranTime(value) {
  return formatIranDateTime(value, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Formats an appointment's backend clock value as a 24-hour HH:mm string. */
export function formatReservationTime(value) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return RESERVATION_TIME_FORMATTER.format(date);
}

export function createRelativeYearDateInIran(yearsOffset) {
  const date = startOfIranDay(nowInIran());
  date.setFullYear(date.getFullYear() + yearsOffset);
  return date;
}

export function createYesterdayInIran() {
  const date = startOfIranDay(nowInIran());
  date.setDate(date.getDate() - 1);
  return date;
}

export function createTomorrowInIran() {
  const date = startOfIranDay(nowInIran());
  date.setDate(date.getDate() + 1);
  return date;
}
