import { PersianDateService } from "./persian-date.service";

describe("PersianDateService", () => {
  const service = new PersianDateService();

  it("formats Gregorian dates with the Persian calendar", () => {
    expect(service.format("2026-08-29T00:00:00Z", "date")).toContain("۱۴۰۵");
  });

  it("converts Persian date parts to Gregorian and back", () => {
    const gregorian = service.toGregorian({ year: 1405, month: 6, day: 7 });
    expect(service.toPersianParts(gregorian)).toEqual({
      year: 1405,
      month: 6,
      day: 7,
    });
  });
});
