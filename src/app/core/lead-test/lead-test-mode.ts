import { AuthUser } from "../auth/auth.service";

/** Temporary QA override — remove after lead broadcast testing. */
export const LEAD_TEST_MODE_USER_ID = "9d414291-d062-4b77-bbc7-0e9beabfa395";

const SESSION_STORAGE_KEY = "clinic-auth-session";

export interface LeadTestBroadcastLead {
  leadAssignmentId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  createdAt: string;
  broadcastStartedAt: string;
  leadAssignmentType: number;
}

export const LEAD_TEST_BROADCAST_LEADS: LeadTestBroadcastLead[] = [
  {
    leadAssignmentId: 143693,
    firstName: "تست",
    lastName: "",
    phoneNumber: "09373807236",
    createdAt: "2026-07-04T12:00:00.000Z",
    broadcastStartedAt: "2026-07-04T12:00:00.000Z",
    leadAssignmentType: 1,
  },
  {
    leadAssignmentId: 143692,
    firstName: "TEST",
    lastName: "",
    phoneNumber: "09390951971",
    createdAt: "2026-07-04T12:00:00.000Z",
    broadcastStartedAt: "2026-07-04T12:00:00.000Z",
    leadAssignmentType: 1,
  },
];

let consultantMarkedOnline = false;

export function isLeadTestModeUser(
  userId?: string | null,
  user?: AuthUser | null,
): boolean {
  const resolvedUserId =
    userId ?? user?.userId ?? readSessionUserId() ?? undefined;
  return resolvedUserId === LEAD_TEST_MODE_USER_ID;
}

export function setLeadTestConsultantOnline(online: boolean): void {
  consultantMarkedOnline = online;
}

export function isLeadTestConsultantOnline(): boolean {
  return consultantMarkedOnline;
}

export function findLeadTestBroadcastLead(
  leadAssignmentId: number,
): LeadTestBroadcastLead | undefined {
  return LEAD_TEST_BROADCAST_LEADS.find(
    (lead) => lead.leadAssignmentId === leadAssignmentId,
  );
}

function readSessionUserId(): string | null {
  if (typeof localStorage === "undefined") return null;

  try {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawSession) return null;

    const session = JSON.parse(rawSession) as {
      user?: { userId?: string };
    };
    return session.user?.userId ?? null;
  } catch {
    return null;
  }
}
