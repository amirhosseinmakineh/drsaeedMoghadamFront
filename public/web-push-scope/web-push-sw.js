/* global self, clients */

const SW_VERSION = "2026-07-09-realtime-offline-push";
const REALTIME_LEAD_TAG_PREFIX = "realtime-lead-";
const OFFLINE_LEAD_PUSH_TITLE = "لید آفلاین جدید!";
const OFFLINE_LEAD_ALERT_SOUND_URL = "/sounds/offline-lead-alert.mp3";
const OFFLINE_LEAD_VIBRATE_PATTERN = [400, 120, 400, 120, 400, 120, 400, 120, 400];

function formatOfflineLeadPushBody(count) {
  const leadCount = count || "چند";
  return `${leadCount} لید آفلاین داری، بیا اینارو تعیین تکلیف کن`;
}

function parsePushPayload(event) {
  if (!event.data) {
    return { title: "", body: "", data: {} };
  }

  try {
    const payload = event.data.json();
    return {
      title: payload.title ?? "",
      body: payload.body ?? "",
      data: payload.data ?? {},
    };
  } catch {
    return {
      title: "اعلان",
      body: event.data.text() ?? "",
      data: {},
    };
  }
}

function notifyClients(message) {
  return clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clientList) => {
      clientList.forEach((client) => client.postMessage(message));
    });
}

function closeRealtimeLeadNotifications(leadId) {
  const tag = `${REALTIME_LEAD_TAG_PREFIX}${leadId}`;
  return self.registration.getNotifications({ tag }).then((notifications) => {
    notifications.forEach((notification) => notification.close());
  });
}

self.addEventListener("push", (event) => {
  const payload = parsePushPayload(event);
  const data = payload.data ?? {};
  const type = data.type ?? "";

  if (type === "RealtimeLeadTaken") {
    const leadId = data.leadId;
    event.waitUntil(
      closeRealtimeLeadNotifications(leadId).then(() =>
        notifyClients({
          type: "RealtimeLeadTaken",
          leadId: Number(leadId),
        }),
      ),
    );
    return;
  }

  if (type === "RealtimeLead") {
    const leadId = data.leadId;
    const tag = `${REALTIME_LEAD_TAG_PREFIX}${leadId}`;
    const title = payload.title || "لید جدید!";
    const body =
      payload.body || "یک لید لحظه‌ای آماده دریافت است. سریع برداریدش!";
    const baseOptions = {
      body,
      tag,
      renotify: true,
      requireInteraction: true,
      silent: false,
      vibrate: [300, 120, 300, 120, 300],
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
      data,
    };

    event.waitUntil(
      (async () => {
        await notifyClients({
          type: "RealtimeLead",
          leadId: Number(leadId),
          title,
          body,
        });
        await notifyClients({
          type: "web-push-message",
          payload: { title, body, data },
        });

        try {
          await self.registration.showNotification(title, {
            ...baseOptions,
            actions: [
              { action: "pickup", title: "برداریدش!" },
              { action: "dismiss", title: "بستن" },
            ],
          });
        } catch {
          await self.registration.showNotification(title, baseOptions);
        }
      })(),
    );
    return;
  }

  if (type === "offline_leads" || type === "test_push") {
    const isOfflineLead = type === "offline_leads";
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
    return;
  }

  if (payload.title || payload.body) {
    event.waitUntil(
      self.registration.showNotification(payload.title || "اعلان", {
        body: payload.body,
        data,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-96x96.png",
      }),
    );
  }
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
  const type = data.type ?? "";
  const action = event.action;

  if (type === "RealtimeLead") {
    const leadId = Number(data.leadId);
    const message =
      action === "pickup"
        ? { type: "RealtimeLeadPickup", leadId }
        : { type: "RealtimeLeadOpen", leadId };

    event.waitUntil(
      notifyClients(message).then(() => {
        const url = `/dashboard/consultant?section=leads&type=realtime&leadAssignmentId=${encodeURIComponent(data.leadId)}`;
        return clients
          .matchAll({ type: "window", includeUncontrolled: true })
          .then((clientList) => {
            for (const client of clientList) {
              if ("focus" in client) {
                client.navigate?.(url);
                return client.focus();
              }
            }
            return clients.openWindow(url);
          });
      }),
    );
    return;
  }

  const url = notificationUrl(data);
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
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

self.addEventListener("message", (event) => {
  const data = event.data ?? {};

  if (data.type === "CloseRealtimeLeadNotification" && data.leadId) {
    event.waitUntil(closeRealtimeLeadNotifications(data.leadId));
  }
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
