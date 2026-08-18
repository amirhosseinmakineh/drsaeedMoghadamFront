import { HttpErrorResponse } from "@angular/common/http";

export const transactionTypeLabel = (type: string): string => ({
  WalletDeposit: "شارژ کیف پول",
  WalletWithdrawal: "برداشت از کیف پول",
}[type] ?? type);

export const statusLabel = (status: string): string => ({
  Completed: "تکمیل شده",
  Cancelled: "لغو شده",
  Reversed: "برگشت داده شده",
}[status] ?? status);

export const roleLabel = (role = ""): string => ({
  admin: "مدیر", Admin: "مدیر", consultant: "مشاور", Consultant: "مشاور",
  secretary: "منشی", Secretary: "منشی", patient: "کاربر", Patient: "کاربر", User: "کاربر",
}[role] ?? role);

export function financialError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return error instanceof Error ? error.message : "خطایی رخ داد؛ دوباره تلاش کنید";
  if (error.status === 401 || error.status === 403) return "دسترسی ندارید";
  if (error.status === 404) return "کاربر یا کیف پول وجود ندارد";
  const message = error.error?.message ?? error.error?.title;
  if (error.status === 400 && /balance|fund|موجودی/i.test(message ?? "")) return "موجودی کافی نیست";
  return message || "خطایی رخ داد؛ دوباره تلاش کنید";
}
