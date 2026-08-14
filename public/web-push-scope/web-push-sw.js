/* global self, clients */

const SW_VERSION = "2026-08-14-realtime-burnt-lead-notification";
const REALTIME_LEAD_TAG_PREFIX = "realtime-lead-";
const REALTIME_LEAD_VIBRATE_PATTERN = [400, 120, 400, 120, 400, 120, 500, 120, 500];

function notificationAsset(path) {
  return new URL(path, self.location.origin).href;
}

async function showRealtimeLeadNotification(title, body, baseOptions) {
  try {
    await self.registration.showNotification(title, {
      ...baseOptions,
      body,
      actions: [
        { action: "pickup", title: "ببین" },
        { action: "dismiss", title: "بستن" },
      ],
    });
  } catch (error) {
    console.warn(
      "[RealtimeLead Push] notification actions are unavailable",
      error,
    );
    await self.registration.showNotification(title, { ...baseOptions, body });
  }
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
  } catch (error) {
    console.error("[RealtimeLead Push Error] Invalid JSON payload", error);
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
  console.log("[SW PUSH]", payload);
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
    const leadId = Number(data.leadId);
    if (!Number.isFinite(leadId) || leadId <= 0) {
      console.error(
        "[RealtimeLead Push Error] Invalid leadId in push payload",
        payload,
      );
      return;
    }
    const leadLimitType =
      data.leadLimitType === "Burnt" ? "Burnt" : "Realtime";
    const tag = `${REALTIME_LEAD_TAG_PREFIX}${leadId}`;
    const userName = (data.userName || data.UserName || "").trim();
    const phoneNumber = (data.phoneNumber || data.PhoneNumber || "").trim();
    const title = "شماره جدید دارید";
    const body = "برای مشاهده، اعلان را باز کنید.";
    const baseOptions = {
      body,
      tag,
      renotify: true,
      requireInteraction: true,
      silent: false,
      vibrate: REALTIME_LEAD_VIBRATE_PATTERN,
      icon: notificationAsset("/icons/icon-192x192.png"),
      badge: notificationAsset("/icons/icon-96x96.png"),
      data: {
        ...data,
        leadId: String(leadId),
        leadLimitType,
        userName,
        phoneNumber,
      },
    };

    event.waitUntil(
      (async () => {
        const windowClients = await clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });

        await showRealtimeLeadNotification(
          payload.title || title,
          payload.body || body,
          baseOptions,
        );

        for (const client of windowClients) {
          client.postMessage({
            type: "RealtimeLead",
            payload: {
              title: payload.title || title,
              body: payload.body || body,
              data: baseOptions.data,
            },
          });
        }
      })().catch((error) => {
        console.error("[RealtimeLead Push Error]", error);
        throw error;
      }),
    );
    return;
  }

  if (type === "test_push") {
    const title = payload.title || notificationTitle(data);
    const options = {
      body: payload.body || notificationBody(data),
      data,
      icon: notificationAsset("/icons/icon-192x192.png"),
      badge: notificationAsset("/icons/icon-96x96.png"),
      tag: notificationTag(data),
      renotify: true,
      vibrate: REALTIME_LEAD_VIBRATE_PATTERN,
      requireInteraction: false,
      silent: false,
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
        icon: notificationAsset("/icons/icon-192x192.png"),
        badge: notificationAsset("/icons/icon-96x96.png"),
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

  if (action === "dismiss") return;

  if (type === "RealtimeLead") {
    const leadId = Number(data.leadId);
    if (!Number.isFinite(leadId) || leadId <= 0) {
      console.error(
        "[RealtimeLead Push Error] Invalid leadId on notification click",
        data,
      );
      return;
    }
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
  if (data.type === "test_push") return "test-push";
  if (data.type === "ConsultantLeadWorkloadBlocked") return "consultant-workload-blocked";
  return "consultant-notification";
}

function notificationTitle(data) {
  if (data.type === "test_push") return "تست نوتیفیکیشن";
  if (data.type === "ConsultantLeadWorkloadBlocked") {
    return "تعیین تکلیف شماره‌های قبلی";
  }
  return "اعلان جدید";
}

function notificationBody(data) {
  if (data.type === "test_push") {
    return "اگر این پیام را می‌بینید، Web Push روی PWA شما فعال است.";
  }
  return "برای مشاهده جزئیات وارد داشبورد شوید.";
}

function notificationUrl(data) {
  if (data.type === "test_push") return "/dashboard/consultant";
  if (data.type === "ConsultantLeadWorkloadBlocked") {
    return data.route || "/consultant/leads";
  }
  return "/dashboard/consultant";
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
