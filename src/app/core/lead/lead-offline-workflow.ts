import {
  LeadAssignmentState,
  LeadAssignmentType,
  leadAssignmentStateLabel,
} from "./lead-enums";

/** Mirrors backend `LeadCallResult` enum used in call reports. */
export const LeadCallResult = {
  Connected: 1,
  Converted: 2,
  Rejected: 3,
  NoAnswer: 4,
  WrongNumber: 5,
  NeedsFollowUp: 6,
  Busy: 7,
  PatientHungUp: 8,
} as const;

export const LEAD_CALL_RESULT_LABELS: Record<number, string> = {
  [LeadCallResult.Connected]: "تماس برقرار شد",
  [LeadCallResult.Converted]: "تبدیل به بیمار",
  [LeadCallResult.Rejected]: "رد شد",
  [LeadCallResult.NoAnswer]: "پاسخ نداد",
  [LeadCallResult.WrongNumber]: "شماره اشتباه بود",
  [LeadCallResult.NeedsFollowUp]: "نیاز به پیگیری",
  [LeadCallResult.Busy]: "اشغال",
  [LeadCallResult.PatientHungUp]: "قطع تماس توسط بیمار",
};

const FOLLOW_UP_CALL_RESULTS = new Set<number>([
  LeadCallResult.Rejected,
  LeadCallResult.NoAnswer,
  LeadCallResult.WrongNumber,
  LeadCallResult.NeedsFollowUp,
  LeadCallResult.Busy,
  LeadCallResult.PatientHungUp,
]);

export function isFollowUpCallResult(callResult: number | null | undefined): boolean {
  return callResult !== null && callResult !== undefined && FOLLOW_UP_CALL_RESULTS.has(callResult);
}

/** Offline leads still waiting for the first call report. */
export function isUnreportedOfflineLeadState(state: number | null | undefined): boolean {
  return (
    state === LeadAssignmentState.New || state === LeadAssignmentState.Assigned
  );
}

export function isOfflineLeadBlockingOnline(
  type: number | null | undefined,
  state: number | null | undefined,
): boolean {
  if (type !== LeadAssignmentType.OfflineQueue) return false;
  return isUnreportedOfflineLeadState(state);
}

/** Offline lead reported with a non-terminal outcome that stays in follow-up. */
export function isFollowUpOfflineLead(
  type: number | null | undefined,
  state: number | null | undefined,
  callResult?: number | null,
): boolean {
  if (type !== LeadAssignmentType.OfflineQueue) return false;
  if (state === LeadAssignmentState.Pending) return true;
  if (
    state === LeadAssignmentState.Contacted &&
    isFollowUpCallResult(callResult)
  ) {
    return true;
  }
  return false;
}

export function expectedOfflineStateAfterReport(callResult: number): number {
  if (
    callResult === LeadCallResult.Connected ||
    callResult === LeadCallResult.Converted
  ) {
    return LeadAssignmentState.Contacted;
  }
  if (callResult === LeadCallResult.Rejected) {
    return LeadAssignmentState.Rejected;
  }
  return LeadAssignmentState.Pending;
}

export function leadCallResultLabel(callResult: number | null | undefined): string {
  if (callResult === null || callResult === undefined) return "بدون گزارش";
  return LEAD_CALL_RESULT_LABELS[callResult] ?? "نامشخص";
}

export function leadFollowUpDisplayLabel(
  callResult: number | null | undefined,
): string {
  const resultLabel = leadCallResultLabel(callResult);
  if (resultLabel === "بدون گزارش") return "پیگیری";
  return `پیگیری — ${resultLabel}`;
}

export function leadOfflineDisplayStatus(
  type: number | null | undefined,
  state: number | null | undefined,
  callResult?: number | null,
): string {
  if (isFollowUpOfflineLead(type, state, callResult)) {
    return leadFollowUpDisplayLabel(callResult);
  }
  if (isUnreportedOfflineLeadState(state)) {
    return "منتظر گزارش تماس";
  }
  return leadAssignmentStateLabel(state ?? null);
}

export function countUnreportedOfflineLeads(
  leads: ReadonlyArray<{
    leadAssignmentType?: number | null;
    LeadAssignmentType?: number | null;
    assignmentType?: number | null;
    AssignmentType?: number | null;
    type?: number | null;
    Type?: number | null;
    leadAssignmentState?: number | null;
    LeadAssignmentState?: number | null;
    state?: number | null;
    State?: number | null;
    status?: number | null;
    Status?: number | null;
  }>,
  resolveType: (lead: (typeof leads)[number]) => number | null,
  resolveState: (lead: (typeof leads)[number]) => number | null,
): number {
  return leads.reduce((count, lead) => {
    if (isOfflineLeadBlockingOnline(resolveType(lead), resolveState(lead))) {
      return count + 1;
    }
    return count;
  }, 0);
}
