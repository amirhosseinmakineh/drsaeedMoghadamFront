export const IRAN_TIME_ZONE = "Asia/Tehran";
const IRAN_UTC_OFFSET = "+03:30";

export function nowInIran(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: IRAN_TIME_ZONE }),
  );
}

export function startOfIranDay(date = nowInIran()): Date {
  return fromIranDateInputValue(toIranDateInputValue(date));
}

export function parseIranDateParts(date: Date): {
  year: number;
  month: number;
  day: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: IRAN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

export function parseIranTimeParts(date: Date): {
  hours: number;
  minutes: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: IRAN_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  return {
    hours: Number(parts.find((part) => part.type === "hour")?.value),
    minutes: Number(parts.find((part) => part.type === "minute")?.value),
  };
}

export function toIranDateInputValue(date: Date): string {
  const { year, month, day } = parseIranDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function fromIranDateInputValue(value: string): Date {
  return new Date(`${value}T00:00:00${IRAN_UTC_OFFSET}`);
}

export function toIranTimeInputValue(date: Date): string {
  const { hours, minutes } = parseIranTimeParts(date);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function combineIranDateAndTime(
  date: Date,
  time: string,
): Date | null {
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

export function nowInIranMs(): number {
  return nowInIran().getTime();
}

export function formatIranDateTime(
  value?: string | Date | null,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  },
): string {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("fa-IR", {
    ...options,
    timeZone: IRAN_TIME_ZONE,
  }).format(date);
}

export function formatIranDate(value?: string | Date | null): string {
  return formatIranDateTime(value, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatIranTime(value?: string | Date | null): string {
  return formatIranDateTime(value, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function createRelativeYearDateInIran(yearsOffset: number): Date {
  const date = startOfIranDay(nowInIran());
  date.setFullYear(date.getFullYear() + yearsOffset);
  return date;
}

export function createYesterdayInIran(): Date {
  const date = startOfIranDay(nowInIran());
  date.setDate(date.getDate() - 1);
  return date;
}

export function createTomorrowInIran(): Date {
  const date = startOfIranDay(nowInIran());
  date.setDate(date.getDate() + 1);
  return date;
}
