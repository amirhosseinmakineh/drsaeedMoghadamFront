import { PersianDatePipe } from "./persian-date.pipe";
import { PersianDateService } from "./persian-date.service";

describe("PersianDatePipe", () => {
  it("delegates formatting to PersianDateService", () => {
    const pipe = new PersianDatePipe(new PersianDateService());
    expect(pipe.transform("2026-08-29", "date")).toContain("۱۴۰۵");
  });
});
