/** Canonical reservation identity and patient appointment fields shared by dashboards. */
export interface ReservationDto {
  id?: number;
  Id?: number;
  patientName?: string | null;
  PatientName?: string | null;
  reservationAt?: string | null;
  ReservationAt?: string | null;
}
