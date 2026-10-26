



@Pipe({ name: "persianDate", standalone: true, pure: true })
export class PersianDatePipe  {
  constructor(  persianDate) {;this.persianDate = persianDate;}

  transform(
    value,
    format = "date",
  ) {
    return this.persianDate.format(value, format);
  }
}
