 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }






const TEHRAN_TIME_ZONE = "Asia/Tehran";

@Injectable({ providedIn: "root" })
export class PersianDateService {
  format(value, format = "date") {
    const date = this.toDate(value);
    if (!date) {
      return "—";
    }

    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      ...this.formatOptions(format),
      timeZone: TEHRAN_TIME_ZONE,
    }).format(date);
  }

  toPersianParts(value) {
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

  toGregorian(parts) {
    if (!this.validParts(parts)) {
      return null;
    }

    const expectedKey = this.partsKey(parts);
    const approximateYear = parts.year + 621;
    const start = Date.UTC(approximateYear, 2, 1);
    const end = Date.UTC(approximateYear + 1, 2, 31);

    for (let timestamp = start; timestamp <= end; timestamp += 86400000) {
      const candidate = new Date(timestamp);
      const candidateParts = this.toPersianParts(candidate);

      if (candidateParts && this.partsKey(candidateParts) === expectedKey) {
        return candidate;
      }
    }

    return null;
  }

  compare(first, second) {
    const firstDate = this.toDate(first);
    const secondDate = this.toDate(second);

    if (!firstDate || !secondDate) {
      return 0;
    }

    return Math.sign(firstDate.getTime() - secondDate.getTime());
  }

   toDate(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

   formatOptions(format) {
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

   partNumber(
    parts,
    type,
  ) {
    const value = _optionalChain([parts, 'access', _ => _.find, 'call', _2 => _2((part) => part.type === type), 'optionalAccess', _3 => _3.value]);
    return Number(_nullishCoalesce(value, () => ( 0)));
  }

   validParts(parts) {
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

   partsKey(parts) {
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
}
