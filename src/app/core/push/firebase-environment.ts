import { environment } from "../../../environments/environment";

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

declare global {
  interface Window {
    __FIREBASE_CONFIG__?: Partial<FirebaseClientConfig>;
    __FIREBASE_VAPID_KEY__?: string;
  }
}

function readWindowFirebaseConfig(): Partial<FirebaseClientConfig> {
  if (typeof window === "undefined") return {};
  return window.__FIREBASE_CONFIG__ ?? {};
}

function readWindowVapidKey(): string {
  if (typeof window === "undefined") return "";
  return window.__FIREBASE_VAPID_KEY__?.trim() ?? "";
}

export function getFirebaseConfig(): FirebaseClientConfig {
  const fromWindow = readWindowFirebaseConfig();
  return {
    apiKey: fromWindow.apiKey?.trim() || environment.firebase.apiKey?.trim() || "",
    authDomain:
      fromWindow.authDomain?.trim() || environment.firebase.authDomain?.trim() || "",
    projectId:
      fromWindow.projectId?.trim() || environment.firebase.projectId?.trim() || "",
    storageBucket:
      fromWindow.storageBucket?.trim() ||
      environment.firebase.storageBucket?.trim() ||
      "",
    messagingSenderId:
      fromWindow.messagingSenderId?.trim() ||
      environment.firebase.messagingSenderId?.trim() ||
      "",
    appId: fromWindow.appId?.trim() || environment.firebase.appId?.trim() || "",
  };
}

export function getFirebaseVapidKey(): string {
  return readWindowVapidKey() || environment.firebaseVapidKey?.trim() || "";
}

export function hasFirebaseClientConfig(): boolean {
  const config = getFirebaseConfig();
  return Boolean(
    getFirebaseVapidKey() &&
      config.apiKey &&
      config.projectId &&
      config.messagingSenderId &&
      config.appId,
  );
}
