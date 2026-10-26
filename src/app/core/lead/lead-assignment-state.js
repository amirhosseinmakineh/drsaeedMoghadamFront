 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }export var LeadAssignmentState; (function (LeadAssignmentState) {
  const New = 1; LeadAssignmentState[LeadAssignmentState["New"] = New] = "New";
  const Assigned = 2; LeadAssignmentState[LeadAssignmentState["Assigned"] = Assigned] = "Assigned";
  const Contacted = 3; LeadAssignmentState[LeadAssignmentState["Contacted"] = Contacted] = "Contacted";
  const Pending = 4; LeadAssignmentState[LeadAssignmentState["Pending"] = Pending] = "Pending";
  const Converted = 5; LeadAssignmentState[LeadAssignmentState["Converted"] = Converted] = "Converted";
  const Expired = 6; LeadAssignmentState[LeadAssignmentState["Expired"] = Expired] = "Expired";
  const Rejected = 7; LeadAssignmentState[LeadAssignmentState["Rejected"] = Rejected] = "Rejected";
  const NoAnswer = 8; LeadAssignmentState[LeadAssignmentState["NoAnswer"] = NoAnswer] = "NoAnswer";
})(LeadAssignmentState || (LeadAssignmentState = {}));

 










const STATE_PRESENTATIONS


 = {
  [LeadAssignmentState.New]: {
    label: "جدید",
    badge: "info",
  },
  [LeadAssignmentState.Assigned]: {
    label: "تخصیص داده شده",
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
  [LeadAssignmentState.NoAnswer]: {
    label: "پاسخ نداد",
    badge: "warn",
  },
};

const STATE_BY_NAME = {
  New: LeadAssignmentState.New,
  Assigned: LeadAssignmentState.Assigned,
  Contacted: LeadAssignmentState.Contacted,
  Pending: LeadAssignmentState.Pending,
  Converted: LeadAssignmentState.Converted,
  Expired: LeadAssignmentState.Expired,
  Rejected: LeadAssignmentState.Rejected,
  NoAnswer: LeadAssignmentState.NoAnswer,
};

const UNKNOWN_PRESENTATION = {
  label: "نامشخص",
  badge: "danger",
};

export function readLeadAssignmentState(
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
    const parsed = parseLeadAssignmentStateValue(raw);
    if (parsed !== null) return parsed;
  }

  return null;
}

export function parseLeadAssignmentStateValue(
  value,
) {
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
    return _nullishCoalesce(byName, () => ( null));
  }

  return null;
}

export function leadAssignmentStatePresentation(
  state,
) {
  const normalized = Number(state);
  if (Number.isFinite(normalized) && isLeadAssignmentState(normalized)) {
    return STATE_PRESENTATIONS[normalized];
  }

  return UNKNOWN_PRESENTATION;
}

function isLeadAssignmentState(
  value,
) {
  return (
    value >= LeadAssignmentState.New && value <= LeadAssignmentState.NoAnswer
  );
}
