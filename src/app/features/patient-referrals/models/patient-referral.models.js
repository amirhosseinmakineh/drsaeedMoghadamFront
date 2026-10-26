export var PatientReferralStatus; (function (PatientReferralStatus) {
  const Submitted = 1; PatientReferralStatus[PatientReferralStatus["Submitted"] = Submitted] = "Submitted";
  const Contacted = 2; PatientReferralStatus[PatientReferralStatus["Contacted"] = Contacted] = "Contacted";
  const ReservedPendingAdminApproval = 3; PatientReferralStatus[PatientReferralStatus["ReservedPendingAdminApproval"] = ReservedPendingAdminApproval] = "ReservedPendingAdminApproval";
  const ApprovedRewarded = 4; PatientReferralStatus[PatientReferralStatus["ApprovedRewarded"] = ApprovedRewarded] = "ApprovedRewarded";
  const Rejected = 5; PatientReferralStatus[PatientReferralStatus["Rejected"] = Rejected] = "Rejected";
})(PatientReferralStatus || (PatientReferralStatus = {}));

export var DentalServiceType; (function (DentalServiceType) { const Composite = 1; DentalServiceType[DentalServiceType["Composite"] = Composite] = "Composite"; const Implant = 2; DentalServiceType[DentalServiceType["Implant"] = Implant] = "Implant"; const Laminate = 3; DentalServiceType[DentalServiceType["Laminate"] = Laminate] = "Laminate"; })(DentalServiceType || (DentalServiceType = {}));

export const REFERRAL_STATUS_LABELS = {
  [PatientReferralStatus.Submitted]: "ثبت‌شده؛ در انتظار تماس منشی",
  [PatientReferralStatus.Contacted]: "تماس منشی انجام شد",
  [PatientReferralStatus.ReservedPendingAdminApproval]: "رزرو شد؛ در انتظار تأیید حضور و ادمین",
  [PatientReferralStatus.ApprovedRewarded]: "تأیید و پاداش پرداخت شد",
  [PatientReferralStatus.Rejected]: "رد شده",
};































