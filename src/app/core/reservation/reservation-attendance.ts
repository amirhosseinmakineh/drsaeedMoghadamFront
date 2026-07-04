export enum AttendanceConfirmationStatus {
  PendingConsultantConfirmation = 1,
  ConsultantConfirmedPresent = 2,
  ConsultantConfirmedAbsent = 3,
  SecretaryApproved = 4,
  SecretaryRejected = 5,
}

export const ATTENDANCE_SCORE_APPROVED = 10;
export const ATTENDANCE_SCORE_REJECTED = -10;

export type ReservationAttendanceBadgeTone =
  | "muted"
  | "info"
  | "success"
  | "warn"
  | "danger";

export interface ReservationAttendancePresentation {
  label: string;
  badgeClass: ReservationAttendanceBadgeTone;
}

const STATUS_PRESENTATIONS: Record<
  AttendanceConfirmationStatus,
  ReservationAttendancePresentation
> = {
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
  source: unknown,
  ...keys: string[]
): AttendanceConfirmationStatus | null {
  if (!source || typeof source !== "object") return null;

  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const raw =
      record[key] ??
      record[key.charAt(0).toUpperCase() + key.slice(1)] ??
      null;
    const numeric = Number(raw);
    if (
      Number.isFinite(numeric) &&
      numeric >= AttendanceConfirmationStatus.PendingConsultantConfirmation &&
      numeric <= AttendanceConfirmationStatus.SecretaryRejected
    ) {
      return numeric as AttendanceConfirmationStatus;
    }
  }

  return null;
}

export function attendanceStatusPresentation(
  status: AttendanceConfirmationStatus | number | null | undefined,
): ReservationAttendancePresentation {
  const normalized = Number(status);
  if (
    Number.isFinite(normalized) &&
    normalized in STATUS_PRESENTATIONS
  ) {
    return STATUS_PRESENTATIONS[normalized as AttendanceConfirmationStatus];
  }

  return { label: "نامشخص", badgeClass: "muted" };
}

export function attendanceScoreLabel(
  approved: boolean | null | undefined,
): string {
  if (approved === true) return `+${ATTENDANCE_SCORE_APPROVED}`;
  if (approved === false) return `${ATTENDANCE_SCORE_REJECTED}`;
  return "-";
}

export function canConsultantConfirmAttendance(
  status: AttendanceConfirmationStatus | number | null | undefined,
  isCanceled = false,
): boolean {
  return (
    !isCanceled &&
    status === AttendanceConfirmationStatus.PendingConsultantConfirmation
  );
}

export function isReservationDueForConsultantConfirmation(
  reservation: {
    reservationAt?: string | null;
    ReservationAt?: string | null;
    isDueForConsultantConfirmation?: boolean | null;
    IsDueForConsultantConfirmation?: boolean | null;
  },
  nowMs: number = Date.now(),
): boolean {
  const explicit =
    reservation.isDueForConsultantConfirmation ??
    reservation.IsDueForConsultantConfirmation;
  if (explicit === true) return true;
  if (explicit === false) return false;

  const raw = reservation.reservationAt ?? reservation.ReservationAt ?? "";
  if (!raw) return false;

  const reservationTime = new Date(raw).getTime();
  return Number.isFinite(reservationTime) && reservationTime <= nowMs;
}

export function canConsultantConfirmDueReservation(
  reservation: {
    reservationAt?: string | null;
    ReservationAt?: string | null;
    isDueForConsultantConfirmation?: boolean | null;
    IsDueForConsultantConfirmation?: boolean | null;
    isCanceled?: boolean | null;
    IsCanceled?: boolean | null;
    attendanceConfirmationStatus?: number | null;
    AttendanceConfirmationStatus?: number | null;
  },
): boolean {
  const isCanceled =
    (reservation.isCanceled ?? reservation.IsCanceled) === true;
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
  status: AttendanceConfirmationStatus | number | null | undefined,
  isWaitingForSecretaryReview = false,
): boolean {
  if (isWaitingForSecretaryReview) return true;

  return (
    status === AttendanceConfirmationStatus.ConsultantConfirmedPresent ||
    status === AttendanceConfirmationStatus.ConsultantConfirmedAbsent
  );
}

export function isSecretaryReviewCompleted(
  status: AttendanceConfirmationStatus | number | null | undefined,
): boolean {
  return (
    status === AttendanceConfirmationStatus.SecretaryApproved ||
    status === AttendanceConfirmationStatus.SecretaryRejected
  );
}

export function consultantAttendanceClaimLabel(
  attended: boolean | null | undefined,
): string {
  if (attended === true) return "بیمار آمده است";
  if (attended === false) return "بیمار نیامده است";
  return "-";
}
