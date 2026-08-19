export const environment = {
  production: false,
  // Keep browser requests same-origin. Angular's development proxy forwards
  // this path to the local API, so PATCH/Authorization never triggers CORS.
  apiBaseUrl: "/api",
  webPushVapidPublicKey:
    "BHrRTag6eomjzkRjtPB4PUKv7RWx08MpTtBslDRei-oev6Ka3ivekjg3Y8GcEf3VZYNxCFW1dYoiewFU5huPiAA"  ,
};
