export interface LeadConsultation {
  sourceType?: number;
  consultationDescription?: string | null;
  requestedServices?: { id: number; title: string }[];
}
export function leadOriginLabel(lead: LeadConsultation): string {
  return ({ 1: 'یکتانت', 2: 'کلینیک', 3: 'شیت ادمین', 4: 'وب‌سایت' } as Record<number, string>)[lead.sourceType ?? 0] ?? 'نامشخص';
}
export function requestedServicesLabel(lead: LeadConsultation): string {
  return lead.requestedServices?.map(service => service.title).join('، ') || '—';
}
