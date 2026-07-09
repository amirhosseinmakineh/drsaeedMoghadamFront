/* global self, clients */

const SW_VERSION = "2026-07-09-offline-push";
const OFFLINE_LEAD_PUSH_TITLE = "لید آفلاین جدید!";
const OFFLINE_LEAD_ALERT_SOUND_URL = "/sounds/offline-lead-alert.mp3";
const OFFLINE_LEAD_VIBRATE_PATTERN = [400, 120, 400, 120, 400, 120, 400, 120, 400];

function formatOfflineLeadPushBody(count) {
  const leadCount = count || "چند";
  return `${leadCount} لید آفلاین داری، بیا اینارو تعیین تکلیف کن`;
}

self.addEventListener("push", (event) => {
  let payload = { title: "اعلان جدید", body: "", data: {} };

  try {
    payload = event.data?.json() ?? payload;
  } catch {
    payload.body = event.data?.text() ?? "";
  }

  const data = payload.data || {};
  if (data.type && data.type !== "offline_leads" && data.type !== "test_push") {
    return;
  }

  const isOfflineLead = data.type === "offline_leads";
  const title = isOfflineLead
    ? OFFLINE_LEAD_PUSH_TITLE
    : payload.title || notificationTitle(data);
  const options = {
    body: isOfflineLead
      ? formatOfflineLeadPushBody(data.count)
      : payload.body || notificationBody(data),
    data,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    tag: notificationTag(data),
    renotify: true,
    vibrate: isOfflineLead ? OFFLINE_LEAD_VIBRATE_PATTERN : [200, 100, 200],
    requireInteraction: isOfflineLead,
    silent: false,
    sound: isOfflineLead ? OFFLINE_LEAD_ALERT_SOUND_URL : undefined,
  };

  event.waitUntil(
    (async () => {
      const windowClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        client.postMessage({ type: "web-push-message", payload });
      }

      await self.registration.showNotification(title, options);
    })(),
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      const existing = await self.registration.pushManager.getSubscription();
      if (existing) return;

      const clientsList = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of clientsList) {
        client.postMessage({ type: "web-push-subscription-lost" });
      }
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification?.data || {};
  const url = notificationUrl(data);

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate?.(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    }),
  );
});

function notificationTag(data) {
  if (data.type === "offline_leads") return "offline-leads";
  if (data.type === "test_push") return "test-push";
  return "consultant-notification";
}

function notificationTitle(data) {
  if (data.type === "offline_leads") return OFFLINE_LEAD_PUSH_TITLE;
  if (data.type === "test_push") return "تست نوتیفیکیشن";
  return "اعلان جدید";
}

function notificationBody(data) {
  if (data.type === "offline_leads") {
    return formatOfflineLeadPushBody(data.count);
  }
  if (data.type === "test_push") {
    return "اگر این پیام را می‌بینید، Web Push روی PWA شما فعال است.";
  }
  return "برای مشاهده جزئیات وارد داشبورد شوید.";
}

function notificationUrl(data) {
  if (data.type === "offline_leads") {
    return "/dashboard/consultant?section=leads&type=offline";
  }
  if (data.type === "test_push") return "/dashboard/consultant";
  return "/dashboard/consultant";
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
