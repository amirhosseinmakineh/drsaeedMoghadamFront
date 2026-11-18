export interface ServiceRewardRule {
  id: number;
  serviceId: number;
  basis: "Unit" | "Block" | "Jaw";
  unitsPerReward: number;
  remainderMode: "FullBlocks" | "Proportional";
  amount: number;
  isActive: boolean;
  createdAtUtc: string;
}
export interface ServiceRewardLine {
  serviceId: number; serviceName: string; teeth: number[]; ruleId: number | null;
  basis: string; unitsPerReward: number; remainderMode: string; rate: number;
  previousUnits: number; newUnits: number; amount: number;
}
export interface ServiceRewardContext {
  consultants: { id: number; name: string }[];
  linkedConsultantProfileId: number | null;
  canChooseConsultant: boolean;
  options: { serviceId: number; serviceName: string; toothId: number; toothLabel: string }[];
  rules: ServiceRewardRule[];
}
export interface ServiceRewardQuote {
  hash: string;
  snapshot: { consultantProfileId: number; total: number; lines: ServiceRewardLine[] };
}
export interface ServiceRewardRuleRow { serviceId: number; serviceName: string; rule: ServiceRewardRule | null; }
export interface SaveServiceRewardRule {
  serviceId: number; basis: ServiceRewardRule["basis"]; unitsPerReward: number;
  remainderMode: ServiceRewardRule["remainderMode"]; amount: number; isActive: boolean; expectedVersionId: number | null;
}

/** Calculation JSON is an immutable server snapshot, stored with PascalCase field names. */
export function readRewardLines(json?: string | null): ServiceRewardLine[] {
  if (!json) return [];
  try {
    const snapshot = JSON.parse(json) as { Lines?: { [K in keyof ServiceRewardLine as Capitalize<K>]: ServiceRewardLine[K] }[] };
    if (!Array.isArray(snapshot.Lines)) return [];
    return snapshot.Lines.map((x) => ({
      serviceId: x['ServiceId'], serviceName: x['ServiceName'], teeth: x['Teeth'], ruleId: x['RuleId'],
      basis: x['Basis'], unitsPerReward: x['UnitsPerReward'], remainderMode: x['RemainderMode'], rate: x['Rate'],
      previousUnits: x['PreviousUnits'], newUnits: x['NewUnits'], amount: x['Amount'],
    }));
  } catch { return []; }
}
