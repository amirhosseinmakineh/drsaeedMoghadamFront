export enum LeadAssignmentState {
  New = 1,
  Assigned = 2,
  Contacted = 3,
  Pending = 4,
  Converted = 5,
  Expired = 6,
  Rejected = 7,
}

export type LeadAssignmentStateBadgeTone =
  | "info"
  | "success"
  | "warn"
  | "danger";

export interface LeadAssignmentStatePresentation {
  label: string;
  badge: LeadAssignmentStateBadgeTone;
}

const STATE_PRESENTATIONS: Record<
  LeadAssignmentState,
  LeadAssignmentStatePresentation
> = {
  [LeadAssignmentState.New]: {
    label: "جدید",
    badge: "info",
  },
  [LeadAssignmentState.Assigned]: {
    label: "تخصیص‌یافته",
    badge: "info",
  },
  [LeadAssignmentState.Contacted]: {
    label: "تماس گرفته شده",
    badge: "info",
  },
  [LeadAssignmentState.Pending]: {
    label: "پیگیری",
    badge: "warn",
  },
  [LeadAssignmentState.Converted]: {
    label: "تبدیل شده",
    badge: "success",
  },
  [LeadAssignmentState.Expired]: {
    label: "منقضی شده",
    badge: "warn",
  },
  [LeadAssignmentState.Rejected]: {
    label: "رد شده",
    badge: "danger",
  },
};

const STATE_BY_NAME: Record<string, LeadAssignmentState> = {
  New: LeadAssignmentState.New,
  Assigned: LeadAssignmentState.Assigned,
  Contacted: LeadAssignmentState.Contacted,
  Pending: LeadAssignmentState.Pending,
  Converted: LeadAssignmentState.Converted,
  Expired: LeadAssignmentState.Expired,
  Rejected: LeadAssignmentState.Rejected,
};

const UNKNOWN_PRESENTATION: LeadAssignmentStatePresentation = {
  label: "نامشخص",
  badge: "danger",
};

export function readLeadAssignmentState(
  source: unknown,
  ...keys: string[]
): LeadAssignmentState | null {
  if (!source || typeof source !== "object") return null;

  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const raw =
      record[key] ??
      record[key.charAt(0).toUpperCase() + key.slice(1)] ??
      null;
    const parsed = parseLeadAssignmentStateValue(raw);
    if (parsed !== null) return parsed;
  }

  return null;
}

export function parseLeadAssignmentStateValue(
  value: unknown,
): LeadAssignmentState | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    return isLeadAssignmentState(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const asNumber = Number(trimmed);
    if (Number.isFinite(asNumber) && isLeadAssignmentState(asNumber)) {
      return asNumber;
    }

    const byName = STATE_BY_NAME[trimmed];
    return byName ?? null;
  }

  return null;
}

export function leadAssignmentStatePresentation(
  state: LeadAssignmentState | number | null | undefined,
): LeadAssignmentStatePresentation {
  const normalized = Number(state);
  if (Number.isFinite(normalized) && isLeadAssignmentState(normalized)) {
    return STATE_PRESENTATIONS[normalized];
  }

  return UNKNOWN_PRESENTATION;
}

function isLeadAssignmentState(
  value: number,
): value is LeadAssignmentState {
  return (
    value >= LeadAssignmentState.New && value <= LeadAssignmentState.Rejected
  );
}
