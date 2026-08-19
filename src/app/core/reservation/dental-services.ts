export enum DentalService {
  Composite = 1,
  Implant = 2,
  Laminate = 3,
}

export const DENTAL_SERVICE_OPTIONS = [
  { value: DentalService.Composite, label: "کامپوزیت" },
  { value: DentalService.Implant, label: "ایمپلنت" },
  { value: DentalService.Laminate, label: "لمینت" },
] as const;

export function dentalServicesOf(value: {
  dentalServices?: number[] | null;
  DentalServices?: number[] | null;
}): number[] {
  return value.dentalServices ?? value.DentalServices ?? [];
}

export function formatDentalServices(value: {
  dentalServices?: number[] | null;
  DentalServices?: number[] | null;
}): string {
  const selected = new Set(dentalServicesOf(value));
  const labels = DENTAL_SERVICE_OPTIONS
    .filter((option) => selected.has(option.value))
    .map((option) => option.label);
  return labels.length ? labels.join("، ") : "خدمت ثبت نشده";
}
