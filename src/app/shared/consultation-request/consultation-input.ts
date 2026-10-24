export function normalizeName(value: string): string {
  return value.normalize('NFC').replace(/\s+/gu, ' ').trim();
}
export function validName(value: string): boolean {
  const name = normalizeName(value);
  return name.length <= 100 && (name.match(/\p{L}/gu)?.length ?? 0) >= 3 && /^[\p{L}\p{M} '\-\u200c]+$/u.test(name);
}
export function normalizePhone(value: string): string {
  let phone = value.trim().replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632)).replace(/[\s()\-]/g, '');
  if (phone.startsWith('+98')) phone = '0' + phone.slice(3);
  else if (phone.startsWith('0098')) phone = '0' + phone.slice(4);
  else if (phone.startsWith('98') && phone.length === 12) phone = '0' + phone.slice(2);
  else if (phone.startsWith('9') && phone.length === 10) phone = '0' + phone;
  return phone;
}
export function validPhone(value: string): boolean { return /^09[0-9]{9}$/.test(normalizePhone(value)); }
