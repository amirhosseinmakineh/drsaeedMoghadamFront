import { environment } from "../../../environments/environment";

declare global {
  interface Window {
    __WEB_PUSH_VAPID_PUBLIC_KEY__?: string;
  }
}

/** Must match backend `WebPush:VapidPublicKey` (public keys are not secret). */
export const DEFAULT_WEB_PUSH_VAPID_PUBLIC_KEY =
  "BHrRTag6eomjzkRjtPB4PUKv7RWx08MpTtBslDRei-oev6Ka3ivekjg3Y8GcEf3VZYNxCFW1dYoiewFU5huPiAA";

function readWindowVapidKey(): string {
  if (typeof window === "undefined") return "";
  return window.__WEB_PUSH_VAPID_PUBLIC_KEY__?.trim() ?? "";
}

export function getWebPushVapidPublicKey(): string {
  return (
    readWindowVapidKey() ||
    environment.webPushVapidPublicKey?.trim() ||
    DEFAULT_WEB_PUSH_VAPID_PUBLIC_KEY
  );
}

export function hasWebPushClientConfig(): boolean {
  return Boolean(getWebPushVapidPublicKey());
}
