export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;

  return (
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export function isMobileDevice(): boolean {
  return isIosDevice() || isAndroidDevice();
}

export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;

  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };

  if (navigatorWithStandalone.standalone === true) return true;

  return ["standalone", "fullscreen", "minimal-ui"].some((mode) =>
    window.matchMedia(`(display-mode: ${mode})`).matches,
  );
}

export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;
  return (
    /FBAN|FBAV|Instagram|Line\/|Twitter|Telegram|WhatsApp|Snapchat|TikTok|LinkedInApp/i.test(
      ua,
    ) ||
    (/wv\)/i.test(ua) && isAndroidDevice()) ||
    (/iPhone|iPad|iPod/i.test(ua) && !/Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua))
  );
}

export function hasBasicNotificationApis(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator
  );
}

/**
 * True when the app may attempt Web Push registration (not blocked upfront).
 * Android Chrome/Firefox/Samsung support push in browser tabs — no PWA install required.
 * iOS only supports push from an installed home-screen PWA (16.4+).
 */
export function canAttemptPushNotifications(): boolean {
  if (!hasBasicNotificationApis()) return false;
  if (isInAppBrowser()) return false;
  if (isIosDevice() && !isStandalonePwa()) return false;
  return true;
}

/** Hard block — push cannot work in this environment. */
export function getPushEnvironmentIssue(): string | null {
  if (isInAppBrowser()) {
    return (
      "مرورگر داخل اپ (مثل اینستاگرام یا تلگرام) از نوتیف پشتیبانی نمی‌کند. " +
      "لینک را در Chrome (اندروید) یا Safari (آیفون) باز کنید."
    );
  }

  if (!hasBasicNotificationApis()) {
    return (
      "مرورگر شما از نوتیفیکیشن پشتیبانی نمی‌کند. " +
      "از Chrome یا Safari به‌روز استفاده کنید و سایت را با HTTPS باز کنید."
    );
  }

  if (isIosDevice() && !isStandalonePwa()) {
    return (
      "روی iPhone/iPad برای دریافت نوتیف لحظه‌ای، سایت را نصب کنید: " +
      "Share → Add to Home Screen، سپس فقط از آیکن صفحه اصلی باز کنید."
    );
  }

  return null;
}

/** Soft hint — push may work, but install improves background delivery. */
export function getPushEnvironmentWarning(): string | null {
  if (getPushEnvironmentIssue()) return null;

  if (isAndroidDevice() && !isStandalonePwa()) {
    return (
      "نوتیف در Chrome اندروید فعال می‌شود. برای دریافت بهتر وقتی اپ بسته است، " +
      "از منوی Chrome گزینه Install app یا Add to Home screen را بزنید."
    );
  }

  return null;
}

export function getPushEnvironmentHint(): string | null {
  return getPushEnvironmentIssue() ?? getPushEnvironmentWarning();
}

export function getPushManagerUnavailableMessage(): string {
  if (isInAppBrowser()) {
    return (
      "این مرورگر داخلی از Push پشتیبانی نمی‌کند. " +
      "صفحه را در Chrome یا Safari باز کنید."
    );
  }

  if (isIosDevice()) {
    return (
      "Push روی این iPhone فعال نیست. iOS باید ۱۶.۴ یا بالاتر باشد، " +
      "PWA را از آیکن صفحه اصلی باز کنید، و اگر قبلاً نصب کرده‌اید یک‌بار حذف و دوباره Add to Home Screen کنید."
    );
  }

  if (isAndroidDevice()) {
    return (
      "Push روی این گوشی فعال نیست. از Chrome به‌روز استفاده کنید " +
      "و اجازه Notification را در تنظیمات مرورگر فعال کنید."
    );
  }

  return (
    "Push Manager روی این دستگاه در دسترس نیست. " +
    "از مرورگر Chrome یا Safari به‌روز استفاده کنید."
  );
}
