export type PersianDateFormat = "date" | "dateTime" | "short" | "long";

export interface PersianDateParts {
  year: number;
  month: number;
  day: number;
}

export type PersianDateValue = Date | string | number | null | undefined;
