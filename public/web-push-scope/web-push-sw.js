/* global self, clients */

const OFFLINE_LEAD_PUSH_TITLE = "لید جدید دارید";
const OFFLINE_LEAD_PUSH_BODY =
  "تعداد لیدهای آفلاین جدید برای شما اختصاص داده شد.";

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

  const title = payload.title || notificationTitle(data);
  const options = {
    body: payload.body || notificationBody(data),
    data,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    tag: notificationTag(data),
    renotify: true,
    vibrate: [200, 100, 200],
    requireInteraction: false,
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
    if (data.count) {
      return `شما ${data.count} لید آفلاین دارید.`;
    }
    return OFFLINE_LEAD_PUSH_BODY;
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
