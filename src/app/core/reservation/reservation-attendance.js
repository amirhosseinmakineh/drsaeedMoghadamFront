 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }export var AttendanceConfirmationStatus; (function (AttendanceConfirmationStatus) {
  const PendingConsultantConfirmation = 1; AttendanceConfirmationStatus[AttendanceConfirmationStatus["PendingConsultantConfirmation"] = PendingConsultantConfirmation] = "PendingConsultantConfirmation";
  const ConsultantConfirmedPresent = 2; AttendanceConfirmationStatus[AttendanceConfirmationStatus["ConsultantConfirmedPresent"] = ConsultantConfirmedPresent] = "ConsultantConfirmedPresent";
  const ConsultantConfirmedAbsent = 3; AttendanceConfirmationStatus[AttendanceConfirmationStatus["ConsultantConfirmedAbsent"] = ConsultantConfirmedAbsent] = "ConsultantConfirmedAbsent";
  const SecretaryApproved = 4; AttendanceConfirmationStatus[AttendanceConfirmationStatus["SecretaryApproved"] = SecretaryApproved] = "SecretaryApproved";
  const SecretaryRejected = 5; AttendanceConfirmationStatus[AttendanceConfirmationStatus["SecretaryRejected"] = SecretaryRejected] = "SecretaryRejected";
})(AttendanceConfirmationStatus || (AttendanceConfirmationStatus = {}));

export const ATTENDANCE_SCORE_APPROVED = 10;
export const ATTENDANCE_SCORE_REJECTED = -10;

 











const STATUS_PRESENTATIONS


 = {
  [AttendanceConfirmationStatus.PendingConsultantConfirmation]: {
    label: "منتظر تایید مشاور",
    badgeClass: "muted",
  },
  [AttendanceConfirmationStatus.ConsultantConfirmedPresent]: {
    label: "مشاور: بیمار آمده",
    badgeClass: "success",
  },
  [AttendanceConfirmationStatus.ConsultantConfirmedAbsent]: {
    label: "مشاور: بیمار نیامده",
    badgeClass: "warn",
  },
  [AttendanceConfirmationStatus.SecretaryApproved]: {
    label: "تایید نهایی منشی",
    badgeClass: "success",
  },
  [AttendanceConfirmationStatus.SecretaryRejected]: {
    label: "رد نهایی منشی",
    badgeClass: "danger",
  },
};

export function readAttendanceStatus(
  source,
  ...keys
) {
  if (!source || typeof source !== "object") return null;

  const record = source ;
  for (const key of keys) {
    const raw =
      _nullishCoalesce(_nullishCoalesce(record[key], () => (
      record[key.charAt(0).toUpperCase() + key.slice(1)])), () => (
      null));
    const numeric = Number(raw);
    if (
      Number.isFinite(numeric) &&
      numeric >= AttendanceConfirmationStatus.PendingConsultantConfirmation &&
      numeric <= AttendanceConfirmationStatus.SecretaryRejected
    ) {
      return numeric ;
    }
  }

  return null;
}

export function attendanceStatusPresentation(
  status,
) {
  const normalized = Number(status);
  if (
    Number.isFinite(normalized) &&
    normalized in STATUS_PRESENTATIONS
  ) {
    return STATUS_PRESENTATIONS[normalized ];
  }

  return { label: "نامشخص", badgeClass: "muted" };
}

export function attendanceScoreLabel(
  approved,
) {
  if (approved === true) return `+${ATTENDANCE_SCORE_APPROVED}`;
  if (approved === false) return `${ATTENDANCE_SCORE_REJECTED}`;
  return "-";
}

export function canConsultantConfirmAttendance(
  status,
  isCanceled = false,
) {
  return (
    !isCanceled &&
    status === AttendanceConfirmationStatus.PendingConsultantConfirmation
  );
}

export function isReservationDueForConsultantConfirmation(
  reservation




,
  nowMs = Date.now(),
) {
  const explicit =
    _nullishCoalesce(reservation.isDueForConsultantConfirmation, () => (
    reservation.IsDueForConsultantConfirmation));
  if (explicit === true) return true;

  const raw = _nullishCoalesce(_nullishCoalesce(reservation.reservationAt, () => ( reservation.ReservationAt)), () => ( ""));
  if (!raw) return false;

  const reservationTime = new Date(raw).getTime();
  return Number.isFinite(reservationTime) && reservationTime <= nowMs;
}

export function isAwaitingConsultantAttendanceConfirmation(
  reservation




,
) {
  const isCanceled =
    (_nullishCoalesce(reservation.isCanceled, () => ( reservation.IsCanceled))) === true;
  const status = readAttendanceStatus(
    reservation,
    "attendanceConfirmationStatus",
    "AttendanceConfirmationStatus",
  );

  return canConsultantConfirmAttendance(status, isCanceled);
}

export function isPendingConsultantConfirmationNotYetDue(
  reservation








,
  nowMs = Date.now(),
) {
  return (
    isAwaitingConsultantAttendanceConfirmation(reservation) &&
    !isReservationDueForConsultantConfirmation(reservation, nowMs)
  );
}

export function canConsultantConfirmDueReservation(
  reservation








,
) {
  const isCanceled =
    (_nullishCoalesce(reservation.isCanceled, () => ( reservation.IsCanceled))) === true;
  const status = readAttendanceStatus(
    reservation,
    "attendanceConfirmationStatus",
    "AttendanceConfirmationStatus",
  );

  return (
    canConsultantConfirmAttendance(status, isCanceled) &&
    isReservationDueForConsultantConfirmation(reservation)
  );
}

export function canSecretaryReviewAttendance(
  status,
  isWaitingForSecretaryReview = false,
) {
  if (isWaitingForSecretaryReview) return true;

  return (
    status === AttendanceConfirmationStatus.ConsultantConfirmedPresent ||
    status === AttendanceConfirmationStatus.ConsultantConfirmedAbsent
  );
}

export function isSecretaryReviewCompleted(
  status,
) {
  return (
    status === AttendanceConfirmationStatus.SecretaryApproved ||
    status === AttendanceConfirmationStatus.SecretaryRejected
  );
}

export function canConsultantEditReservation(reservation








) {
  const isCanceled =
    (_nullishCoalesce(reservation.isCanceled, () => ( reservation.IsCanceled))) === true;
  if (isCanceled) return false;

  const status = readAttendanceStatus(
    reservation,
    "attendanceConfirmationStatus",
    "AttendanceConfirmationStatus",
  );
  if (isSecretaryReviewCompleted(status)) return false;

  const secretaryReviewedAt =
    _nullishCoalesce(reservation.secretaryReviewedAt, () => ( reservation.SecretaryReviewedAt));
  const secretaryDecision =
    _nullishCoalesce(reservation.secretaryApprovedConsultantConfirmation, () => (
    reservation.SecretaryApprovedConsultantConfirmation));

  return !secretaryReviewedAt && secretaryDecision == null;
}

export function consultantAttendanceClaimLabel(
  attended,
) {
  if (attended === true) return "بیمار آمده است";
  if (attended === false) return "بیمار نیامده است";
  return "-";
}
