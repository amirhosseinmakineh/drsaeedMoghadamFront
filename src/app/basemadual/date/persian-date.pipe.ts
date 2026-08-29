import { Pipe, PipeTransform } from "@angular/core";
import { PersianDateFormat, PersianDateValue } from "./persian-date.models";
import { PersianDateService } from "./persian-date.service";

@Pipe({ name: "persianDate", standalone: true, pure: true })
export class PersianDatePipe implements PipeTransform {
  constructor(private readonly persianDate: PersianDateService) {}

  transform(
    value: PersianDateValue,
    format: PersianDateFormat = "date",
  ): string {
    return this.persianDate.format(value, format);
  }
}
