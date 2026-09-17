export enum PatientReferralStatus {
  Submitted = 1,
  Contacted = 2,
  ReservedPendingAdminApproval = 3,
  ApprovedRewarded = 4,
  Rejected = 5,
}

export enum DentalServiceType { Composite = 1, Implant = 2, Laminate = 3 }

export const REFERRAL_STATUS_LABELS: Record<PatientReferralStatus, string> = {
  [PatientReferralStatus.Submitted]: "ثبت‌شده؛ در انتظار تماس منشی",
  [PatientReferralStatus.Contacted]: "تماس منشی انجام شد",
  [PatientReferralStatus.ReservedPendingAdminApproval]: "رزرو شد؛ در انتظار تأیید ادمین",
  [PatientReferralStatus.ApprovedRewarded]: "تأیید و پاداش پرداخت شد",
  [PatientReferralStatus.Rejected]: "رد شده",
};

export interface PatientReferral {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  description?: string | null;
  status: PatientReferralStatus;
  createdAt: string;
  contactedAt?: string | null;
  reservationAt?: string | null;
  reviewedAt?: string | null;
  rewardAmount?: number | null;
  rejectionReason?: string | null;
  referrerFirstName?: string | null;
  referrerLastName?: string | null;
  referrerFullName?: string | null;
  secretaryFullName?: string | null;
}

export interface PatientReferralDashboard {
  firstName: string; lastName: string; walletBalance: number;
  totalReferrals: number; pendingReferrals: number; approvedReferrals: number;
  rejectedReferrals?: number; recentReferrals: PatientReferral[];
}
export interface ReferralQuery { search?: string; status?: PatientReferralStatus | null; page: number; pageSize: number }
export interface PagedReferrals { items: PatientReferral[]; totalCount: number; page: number; pageSize: number; totalPages: number }
export interface CreateReferralRequest { firstName: string; lastName: string; phoneNumber: string; description?: string }
export interface ConsultantOption { id: number; fullName: string }
export interface ReserveReferralRequest { consultantProfileId: number; reservationAt: string; patientCity: string; patientRegion: string; dentalServices: DentalServiceType[]; description?: string }
