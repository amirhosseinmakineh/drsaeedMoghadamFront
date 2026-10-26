 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }/** Canonical reservation identity and patient appointment fields shared by dashboards. */













export function reservationPatientCount(reservation) {
  return _nullishCoalesce(_nullishCoalesce(reservation.patientCount, () => ( reservation.PatientCount)), () => ( 1));
}

export function validatePatientCount(value) {
  return Number.isInteger(value) && value >= 1 && value <= 10
    ? undefined
    : "تعداد بیماران باید بین ۱ تا ۱۰ نفر باشد";
}
