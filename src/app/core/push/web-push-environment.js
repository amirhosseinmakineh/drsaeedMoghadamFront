 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { environment } from "../../../environments/environment";







/** Must match backend `WebPush:VapidPublicKey` (public keys are not secret). */
export const DEFAULT_WEB_PUSH_VAPID_PUBLIC_KEY =
  "BHrRTag6eomjzkRjtPB4PUKv7RWx08MpTtBslDRei-oev6Ka3ivekjg3Y8GcEf3VZYNxCFW1dYoiewFU5huPiAA";

function readWindowVapidKey() {
  if (typeof window === "undefined") return "";
  return _nullishCoalesce(_optionalChain([window, 'access', _ => _.__WEB_PUSH_VAPID_PUBLIC_KEY__, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]), () => ( ""));
}

export function getWebPushVapidPublicKey() {
  return (
    readWindowVapidKey() ||
    _optionalChain([environment, 'access', _4 => _4.webPushVapidPublicKey, 'optionalAccess', _5 => _5.trim, 'call', _6 => _6()]) ||
    DEFAULT_WEB_PUSH_VAPID_PUBLIC_KEY
  );
}

export function hasWebPushClientConfig() {
  return Boolean(getWebPushVapidPublicKey());
}
