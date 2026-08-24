/** Canonical reservation identity and patient appointment fields shared by dashboards. */
export interface ReservationDto {
  id?: number;
  Id?: number;
  patientName?: string | null;
  PatientName?: string | null;
  patientCount?: number | null;
  PatientCount?: number | null;
  reservationAt?: string | null;
  ReservationAt?: string | null;
  dentalServices?: number[] | null;
  DentalServices?: number[] | null;
}

export function reservationPatientCount(reservation: ReservationDto): number {
  return reservation.patientCount ?? reservation.PatientCount ?? 1;
}

export function validatePatientCount(value: number): string | undefined {
  return Number.isInteger(value) && value >= 1 && value <= 10
    ? undefined
    : "تعداد بیماران باید بین ۱ تا ۱۰ نفر باشد";
}
