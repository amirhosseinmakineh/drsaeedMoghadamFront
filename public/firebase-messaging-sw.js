/* global importScripts, firebase, self, clients */
importScripts("/firebase-config.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

const firebaseConfig = self.__FIREBASE_CONFIG__ || {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId,
);

if (hasFirebaseConfig && firebase?.apps?.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

if (hasFirebaseConfig && firebase?.messaging) {
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const data = payload.data || {};
    const title = payload.notification?.title || notificationTitle(data);
    const options = {
      body: payload.notification?.body || notificationBody(data),
      data,
      icon: "/1.png",
      badge: "/1.png",
      tag: notificationTag(data),
      renotify: true,
    };

    self.registration.showNotification(title, options);
  });
}

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
  if (data.type === "realtime_lead" && data.leadAssignmentId) {
    return `realtime-lead-${data.leadAssignmentId}`;
  }
  if (data.type === "offline_leads") return "offline-leads";
  return "consultant-notification";
}

function notificationTitle(data) {
  if (data.type === "offline_leads") return "لیدهای آفلاین";
  if (data.type === "realtime_lead") return "لید لحظه‌ای جدید";
  return "اعلان جدید";
}

function notificationBody(data) {
  if (data.type === "offline_leads") {
    return `شما ${data.count || "چند"} لید آفلاین دارید.`;
  }
  if (data.type === "realtime_lead") {
    return "شما یک لید جدید دارید و ۳ دقیقه زمان دارید برای تماس.";
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
  return "/dashboard/consultant";
}
