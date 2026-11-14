export const DENTAL_SERVICE_IDS = ["composite", "laminate", "implant", "root", "filling", "crown", "extraction"] as const;
export type DentalServiceId = typeof DENTAL_SERVICE_IDS[number];

export interface ToothTreatment {
  services: DentalServiceId[];
  description: string;
  toothName: string;
  serviceNames: string[];
}

/** Read historical single-service entries as well as current multi-service data. */
export function toothServiceIds(value: unknown): DentalServiceId[] {
  if (!value || typeof value !== "object") return [];
  const entry = value as { services?: unknown; service?: unknown };
  const ids = Array.isArray(entry.services) ? entry.services : [entry.service];
  return [...new Set(ids.filter((id): id is DentalServiceId =>
    typeof id === "string" && (DENTAL_SERVICE_IDS as readonly string[]).includes(id)))];
}
