/* global importScripts, firebase, self, clients */
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

const firebaseConfig = {
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

function notificationTitle(data) {
  if (data.type === "offline_leads") return "لیدهای آفلاین";
  if (data.type === "realtime_lead") return "لید جدید";
  return "اعلان جدید";
}

function notificationBody(data) {
  if (data.type === "offline_leads") {
    return `شما ${data.count || "چند"} لید آفلاین دارید.`;
  }
  if (data.type === "realtime_lead") {
    return "شما یک لید جدید دارید و 3 دقیقه زمان دارید برای تماس.";
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
