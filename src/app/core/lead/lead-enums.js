 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }/** Mirrors `DentalDashboard.Domain.Enums.LeadAssignmentType`. */
export const LeadAssignmentType = {
  RealTime: 1,
  ConsultantPatient: 3,
} ;

/** Mirrors `DentalDashboard.Domain.Models.LeadAssignmentState`. */
export const LeadAssignmentState = {
  New: 1,
  Assigned: 2,
  Contacted: 3,
  Pending: 4,
  Converted: 5,
  Expired: 6,
  Rejected: 7,
  NoAnswer: 8,
  ClosedByConsultant: 9,
} ;

/** Mirrors `AdminReportPersianLabels.ToPersian(LeadAssignmentState)`. */
export const LEAD_ASSIGNMENT_STATE_LABELS = {
  [LeadAssignmentState.New]: "جدید",
  [LeadAssignmentState.Assigned]: "تخصیص‌یافته",
  [LeadAssignmentState.Contacted]: "تماس گرفته شده",
  [LeadAssignmentState.Pending]: "پیگیری",
  [LeadAssignmentState.Converted]: "تبدیل شده",
  [LeadAssignmentState.Expired]: "منقضی شده",
  [LeadAssignmentState.Rejected]: "رد شده",
  [LeadAssignmentState.NoAnswer]: "پاسخ نداد",
  [LeadAssignmentState.ClosedByConsultant]: "بسته‌شده توسط مشاور",
};

/** Mirrors `AdminReportPersianLabels.ToPersian(LeadAssignmentType)`. */
export const LEAD_ASSIGNMENT_TYPE_LABELS = {
  [LeadAssignmentType.RealTime]: "آنی",
  [LeadAssignmentType.ConsultantPatient]: "بیمار مشاور",
};

export const CONSULTANT_WORK_START_HOUR = 9;
export const CONSULTANT_WORK_END_HOUR = 21;

const LEAD_ASSIGNMENT_TYPE_BY_NAME = {
  realtime: LeadAssignmentType.RealTime,
  consultantpatient: LeadAssignmentType.ConsultantPatient,
};

const LEAD_ASSIGNMENT_STATE_BY_NAME = {
  new: LeadAssignmentState.New,
  assigned: LeadAssignmentState.Assigned,
  contacted: LeadAssignmentState.Contacted,
  pending: LeadAssignmentState.Pending,
  converted: LeadAssignmentState.Converted,
  expired: LeadAssignmentState.Expired,
  rejected: LeadAssignmentState.Rejected,
  noanswer: LeadAssignmentState.NoAnswer,
  closedbyconsultant: LeadAssignmentState.ClosedByConsultant,
};

export function resolveLeadAssignmentType(value) {
  return resolveEnumValue(value, LEAD_ASSIGNMENT_TYPE_BY_NAME);
}

export function resolveLeadAssignmentState(value) {
  return resolveEnumValue(value, LEAD_ASSIGNMENT_STATE_BY_NAME);
}

export function leadAssignmentTypeLabel(value) {
  return value === null ? "نامشخص" : (_nullishCoalesce(LEAD_ASSIGNMENT_TYPE_LABELS[value], () => ( "نامشخص")));
}

export function leadAssignmentStateLabel(value) {
  return value === null ? "نامشخص" : (_nullishCoalesce(LEAD_ASSIGNMENT_STATE_LABELS[value], () => ( "نامشخص")));
}

export function isConsultantWorkingHours(date = new Date()) {
  const hour = date.getHours();
  return hour >= CONSULTANT_WORK_START_HOUR && hour < CONSULTANT_WORK_END_HOUR;
}

export function isConsultantOnlineBlockedByTime(date = new Date()) {
  return date.getHours() >= CONSULTANT_WORK_END_HOUR;
}

export function canConsultantGoOnline(date = new Date()) {
  return !isConsultantOnlineBlockedByTime(date);
}

export const ADMIN_LEAD_STATE_FILTER_OPTIONS


 = [
  { value: null, label: "همه وضعیت‌ها" },
  { value: LeadAssignmentState.New, label: LEAD_ASSIGNMENT_STATE_LABELS[LeadAssignmentState.New] },
  { value: LeadAssignmentState.Assigned, label: LEAD_ASSIGNMENT_STATE_LABELS[LeadAssignmentState.Assigned] },
  { value: LeadAssignmentState.Contacted, label: LEAD_ASSIGNMENT_STATE_LABELS[LeadAssignmentState.Contacted] },
  { value: LeadAssignmentState.Pending, label: LEAD_ASSIGNMENT_STATE_LABELS[LeadAssignmentState.Pending] },
  { value: LeadAssignmentState.Converted, label: LEAD_ASSIGNMENT_STATE_LABELS[LeadAssignmentState.Converted] },
  { value: LeadAssignmentState.Expired, label: LEAD_ASSIGNMENT_STATE_LABELS[LeadAssignmentState.Expired] },
  { value: LeadAssignmentState.Rejected, label: LEAD_ASSIGNMENT_STATE_LABELS[LeadAssignmentState.Rejected] },
  { value: LeadAssignmentState.NoAnswer, label: LEAD_ASSIGNMENT_STATE_LABELS[LeadAssignmentState.NoAnswer] },
  { value: LeadAssignmentState.ClosedByConsultant, label: LEAD_ASSIGNMENT_STATE_LABELS[LeadAssignmentState.ClosedByConsultant] },
];

export const ADMIN_LEAD_TYPE_FILTER_OPTIONS


 = [
  { value: null, label: "همه نوع‌ها" },
  { value: LeadAssignmentType.RealTime, label: LEAD_ASSIGNMENT_TYPE_LABELS[LeadAssignmentType.RealTime] },
  { value: LeadAssignmentType.ConsultantPatient, label: LEAD_ASSIGNMENT_TYPE_LABELS[LeadAssignmentType.ConsultantPatient] },
];

function resolveEnumValue(
  value,
  byName,
) {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    const named = byName[trimmed.toLowerCase()];
    if (named !== undefined) return named;

    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) return numeric;
  }

  return null;
}
