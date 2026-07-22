export const IRAN_TIME_ZONE = "Asia/Tehran";

export function nowInIran(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: IRAN_TIME_ZONE }),
  );
}

export function startOfIranDay(date = nowInIran()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toIranDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
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
