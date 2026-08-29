import { Injectable } from "@angular/core";
import {
  PersianDateFormat,
  PersianDateParts,
  PersianDateValue,
} from "./persian-date.models";

const TEHRAN_TIME_ZONE = "Asia/Tehran";

@Injectable({ providedIn: "root" })
export class PersianDateService {
  format(value: PersianDateValue, format: PersianDateFormat = "date"): string {
    const date = this.toDate(value);
    if (!date) {
      return "—";
    }

    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      ...this.formatOptions(format),
      timeZone: TEHRAN_TIME_ZONE,
    }).format(date);
  }

  toPersianParts(value: PersianDateValue): PersianDateParts | null {
    const date = this.toDate(value);
    if (!date) {
      return null;
    }

    const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      timeZone: TEHRAN_TIME_ZONE,
    }).formatToParts(date);

    return {
      year: this.partNumber(parts, "year"),
      month: this.partNumber(parts, "month"),
      day: this.partNumber(parts, "day"),
    };
  }

  toGregorian(parts: PersianDateParts): Date | null {
    if (!this.validParts(parts)) {
      return null;
    }

    const expectedKey = this.partsKey(parts);
    const approximateYear = parts.year + 621;
    const start = Date.UTC(approximateYear, 2, 1);
    const end = Date.UTC(approximateYear + 1, 2, 31);

    for (let timestamp = start; timestamp <= end; timestamp += 86_400_000) {
      const candidate = new Date(timestamp);
      const candidateParts = this.toPersianParts(candidate);

      if (candidateParts && this.partsKey(candidateParts) === expectedKey) {
        return candidate;
      }
    }

    return null;
  }

  compare(first: PersianDateValue, second: PersianDateValue): number {
    const firstDate = this.toDate(first);
    const secondDate = this.toDate(second);

    if (!firstDate || !secondDate) {
      return 0;
    }

    return Math.sign(firstDate.getTime() - secondDate.getTime());
  }

  private toDate(value: PersianDateValue): Date | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private formatOptions(format: PersianDateFormat): Intl.DateTimeFormatOptions {
    if (format === "dateTime") {
      return {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      };
    }

    if (format === "long") {
      return {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
    }

    if (format === "short") {
      return { year: "2-digit", month: "2-digit", day: "2-digit" };
    }

    return { year: "numeric", month: "2-digit", day: "2-digit" };
  }

  private partNumber(
    parts: Intl.DateTimeFormatPart[],
    type: Intl.DateTimeFormatPartTypes,
  ): number {
    const value = parts.find((part) => part.type === type)?.value;
    return Number(value ?? 0);
  }

  private validParts(parts: PersianDateParts): boolean {
    return (
      Number.isInteger(parts.year) &&
      Number.isInteger(parts.month) &&
      Number.isInteger(parts.day) &&
      parts.month >= 1 &&
      parts.month <= 12 &&
      parts.day >= 1 &&
      parts.day <= 31
    );
  }

  private partsKey(parts: PersianDateParts): string {
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
}
