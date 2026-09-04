export interface BaseOption<T extends string | number = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface BaseTableColumn<T extends object> {
  key: keyof T;
  label: string;
  mobileLabel?: string;
  primaryOnMobile?: boolean;
}

export type BaseCardVariant = "default" |  "elevated" | "interactive" | "flat";
export type BaseBadgeVariant =
  | "success"
  | "danger" 
  | "warning"
  | "info"
  | "neutral";
export type BaseButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "success";
