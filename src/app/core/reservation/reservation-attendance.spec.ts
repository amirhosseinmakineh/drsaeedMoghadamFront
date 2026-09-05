import { describe, expect, it } from "vitest";
import {
  AttendanceConfirmationStatus as Status,
  attendanceScoreLabel,
  attendanceStatusPresentation,
  canConsultantConfirmDueReservation,
  canSecretaryReviewAttendance,
  consultantAttendanceClaimLabel,
  isReservationDueForConsultantConfirmation,
  isSecretaryReviewCompleted,
  readAttendanceStatus,
} from "./reservation-attendance";

describe("secretary reservation attendance rules", () => {
  it("reads camelCase and PascalCase backend status fields", () => {
    expect(readAttendanceStatus({ attendanceConfirmationStatus: 2 }, "attendanceConfirmationStatus")).toBe(Status.ConsultantConfirmedPresent);
    expect(readAttendanceStatus({ AttendanceConfirmationStatus: "3" }, "attendanceConfirmationStatus")).toBe(Status.ConsultantConfirmedAbsent);
  });

  it("rejects missing and out-of-range statuses", () => {
    expect(readAttendanceStatus({}, "attendanceConfirmationStatus")).toBeNull();
    expect(readAttendanceStatus({ attendanceConfirmationStatus: 99 }, "attendanceConfirmationStatus")).toBeNull();
  });

  it.each([
    [Status.PendingConsultantConfirmation, "منتظر تایید مشاور", "muted"],
    [Status.ConsultantConfirmedPresent, "مشاور: بیمار آمده", "success"],
    [Status.ConsultantConfirmedAbsent, "مشاور: بیمار نیامده", "warn"],
    [Status.SecretaryApproved, "تایید نهایی منشی", "success"],
    [Status.SecretaryRejected, "رد نهایی منشی", "danger"],
  ])("maps status %s to its secretary presentation", (status, label, badgeClass) => {
    expect(attendanceStatusPresentation(status)).toEqual({ label, badgeClass });
  });

  it("allows secretary review only after consultant decision or explicit backend permission", () => {
    expect(canSecretaryReviewAttendance(Status.ConsultantConfirmedPresent)).toBe(true);
    expect(canSecretaryReviewAttendance(Status.ConsultantConfirmedAbsent)).toBe(true);
    expect(canSecretaryReviewAttendance(Status.PendingConsultantConfirmation)).toBe(false);
    expect(canSecretaryReviewAttendance(Status.PendingConsultantConfirmation, true)).toBe(true);
  });

  it("recognizes final secretary decisions", () => {
    expect(isSecretaryReviewCompleted(Status.SecretaryApproved)).toBe(true);
    expect(isSecretaryReviewCompleted(Status.SecretaryRejected)).toBe(true);
    expect(isSecretaryReviewCompleted(Status.ConsultantConfirmedPresent)).toBe(false);
  });

  it("does not allow consultant confirmation before due time or for canceled reservations", () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(isReservationDueForConsultantConfirmation({ reservationAt: future })).toBe(false);
    expect(canConsultantConfirmDueReservation({ reservationAt: past, attendanceConfirmationStatus: Status.PendingConsultantConfirmation })).toBe(true);
    expect(canConsultantConfirmDueReservation({ reservationAt: past, attendanceConfirmationStatus: Status.PendingConsultantConfirmation, isCanceled: true })).toBe(false);
  });

  it("formats secretary score and consultant claim labels", () => {
    expect(attendanceScoreLabel(true)).toBe("+10");
    expect(attendanceScoreLabel(false)).toBe("-10");
    expect(consultantAttendanceClaimLabel(true)).toBe("بیمار آمده است");
    expect(consultantAttendanceClaimLabel(false)).toBe("بیمار نیامده است");
  });
});
