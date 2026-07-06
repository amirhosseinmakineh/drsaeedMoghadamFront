/** Mirrors `DentalDashboard.Domain.Enums.LeadAssignmentType`. */
export const LeadAssignmentType = {
  RealTime: 1,
  OfflineQueue: 2,
  ConsultantPatient: 3,
} as const;

/** Mirrors `DentalDashboard.Domain.Models.LeadAssignmentState`. */
export const LeadAssignmentState = {
  New: 1,
  Assigned: 2,
  Contacted: 3,
  Pending: 4,
  Converted: 5,
  Expired: 6,
  Rejected: 7,
} as const;

/** Mirrors `AdminReportPersianLabels.ToPersian(LeadAssignmentState)`. */
export const LEAD_ASSIGNMENT_STATE_LABELS: Record<number, string> = {
  [LeadAssignmentState.New]: "جدید",
  [LeadAssignmentState.Assigned]: "تخصیص‌یافته",
  [LeadAssignmentState.Contacted]: "تماس گرفته شده",
  [LeadAssignmentState.Pending]: "در انتظار",
  [LeadAssignmentState.Converted]: "تبدیل شده",
  [LeadAssignmentState.Expired]: "منقضی شده",
  [LeadAssignmentState.Rejected]: "رد شده",
};

/** Mirrors `AdminReportPersianLabels.ToPersian(LeadAssignmentType)`. */
export const LEAD_ASSIGNMENT_TYPE_LABELS: Record<number, string> = {
  [LeadAssignmentType.RealTime]: "آنی",
  [LeadAssignmentType.OfflineQueue]: "صف آفلاین",
  [LeadAssignmentType.ConsultantPatient]: "بیمار مشاور",
};

export const CONSULTANT_WORK_START_HOUR = 9;
export const CONSULTANT_WORK_END_HOUR = 21;

const LEAD_ASSIGNMENT_TYPE_BY_NAME: Record<string, number> = {
  realtime: LeadAssignmentType.RealTime,
  offlinequeue: LeadAssignmentType.OfflineQueue,
  consultantpatient: LeadAssignmentType.ConsultantPatient,
};

const LEAD_ASSIGNMENT_STATE_BY_NAME: Record<string, number> = {
  new: LeadAssignmentState.New,
  assigned: LeadAssignmentState.Assigned,
  contacted: LeadAssignmentState.Contacted,
  pending: LeadAssignmentState.Pending,
  converted: LeadAssignmentState.Converted,
  expired: LeadAssignmentState.Expired,
  rejected: LeadAssignmentState.Rejected,
};

export function resolveLeadAssignmentType(value: unknown): number | null {
  return resolveEnumValue(value, LEAD_ASSIGNMENT_TYPE_BY_NAME);
}

export function resolveLeadAssignmentState(value: unknown): number | null {
  return resolveEnumValue(value, LEAD_ASSIGNMENT_STATE_BY_NAME);
}

export function leadAssignmentTypeLabel(value: number | null): string {
  return value === null ? "نامشخص" : (LEAD_ASSIGNMENT_TYPE_LABELS[value] ?? "نامشخص");
}

export function leadAssignmentStateLabel(value: number | null): string {
  return value === null ? "نامشخص" : (LEAD_ASSIGNMENT_STATE_LABELS[value] ?? "نامشخص");
}

export function isConsultantWorkingHours(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= CONSULTANT_WORK_START_HOUR && hour < CONSULTANT_WORK_END_HOUR;
}

function resolveEnumValue(
  value: unknown,
  byName: Record<string, number>,
): number | null {
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
