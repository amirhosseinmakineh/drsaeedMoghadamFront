import { environment } from "../../../environments/environment";

declare global {
  interface Window {
    __WEB_PUSH_VAPID_PUBLIC_KEY__?: string;
  }
}

function readWindowVapidKey(): string {
  if (typeof window === "undefined") return "";
  return window.__WEB_PUSH_VAPID_PUBLIC_KEY__?.trim() ?? "";
}

export function getWebPushVapidPublicKey(): string {
  return (
    readWindowVapidKey() || environment.webPushVapidPublicKey?.trim() || ""
  );
}

export function hasWebPushClientConfig(): boolean {
  return Boolean(getWebPushVapidPublicKey());
}
