/* global self, clients, importScripts */

self.addEventListener("push", (event) => {
  let payload = { title: "اعلان جدید", body: "", data: {} };

  try {
    payload = event.data?.json() ?? payload;
  } catch {
    payload.body = event.data?.text() ?? "";
  }

  const data = payload.data || {};
  const title = payload.title || notificationTitle(data);
  const options = {
    body: payload.body || notificationBody(data),
    data,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    tag: notificationTag(data),
    renotify: true,
    vibrate: [200, 100, 200],
    requireInteraction: data.type === "realtime_lead",
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

  event.stopImmediatePropagation();
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

  event.stopImmediatePropagation();
});

importScripts("./ngsw-worker.js");

function notificationTag(data) {
  if (data.type === "realtime_lead" && data.leadAssignmentId) {
    return `realtime-lead-${data.leadAssignmentId}`;
  }
  if (data.type === "offline_leads") return "offline-leads";
  if (data.type === "password_changed") return "password-changed";
  if (data.type === "test_push") return "test-push";
  return "consultant-notification";
}

function notificationTitle(data) {
  if (data.type === "offline_leads") return "لیدهای آفلاین";
  if (data.type === "realtime_lead") return "لید جدید";
  if (data.type === "password_changed") return "تغییر رمز عبور";
  if (data.type === "test_push") return "تست نوتیفیکیشن";
  return "اعلان جدید";
}

function notificationBody(data) {
  if (data.type === "offline_leads") {
    return `شما ${data.count || "چند"} لید آفلاین دارید.`;
  }
  if (data.type === "realtime_lead") {
    return "لید جدید داری — ۳ دقیقه وقت داری برای تماس.";
  }
  if (data.type === "password_changed") {
    return "کلمه عبور شما با موفقیت تغییر کرد.";
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
  if (data.type === "realtime_lead") {
    const leadAssignmentId = data.leadAssignmentId
      ? `&leadAssignmentId=${encodeURIComponent(data.leadAssignmentId)}`
      : "";
    return `/dashboard/consultant?section=leads&type=realtime${leadAssignmentId}`;
  }
  if (data.type === "password_changed") return "/";
  if (data.type === "test_push") return "/dashboard/consultant";
  return "/dashboard/consultant";
}
