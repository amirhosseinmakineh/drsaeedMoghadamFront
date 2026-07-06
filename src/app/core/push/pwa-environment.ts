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

export function hasBasicNotificationApis(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator
  );
}

export function hasBrowserNotificationSupport(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getBrowserNotificationIssue(): string | null {
  if (!hasBrowserNotificationSupport()) {
    return "مرورگر شما اعلان مرورگر را پشتیبانی نمی‌کند.";
  }

  if (isIosDevice() && !isStandalonePwa()) {
    return (
      "روی iPhone/iPad برای دریافت اعلان، سایت را با Share → Add to Home Screen نصب کنید " +
      "و از آیکن صفحه اصلی باز کنید."
    );
  }

  return null;
}

export function getPushEnvironmentIssue(): string | null {
  if (!hasBasicNotificationApis()) {
    return "مرورگر شما از نوتیفیکیشن پشتیبانی نمی‌کند. از Chrome یا Safari به‌روز استفاده کنید.";
  }

  if (isIosDevice() && !isStandalonePwa()) {
    return (
      "روی iPhone/iPad برای اعلان پس‌زمینه، اپ را با Share → Add to Home Screen نصب کنید " +
      "و از آیکن صفحه اصلی باز کنید."
    );
  }

  return null;
}

export function getPushAdvisoryHint(): string | null {
  if (getPushEnvironmentIssue()) return null;

  if (isAndroidDevice() && !isStandalonePwa()) {
    return (
      "روی اندروید می‌توانید همین‌جا در مرورگر اعلان را فعال کنید. " +
      "برای تجربه بهتر، PWA را هم نصب کنید."
    );
  }

  if (!isMobileDevice() && !isStandalonePwa()) {
    return "برای دریافت اعلان وقتی تب بسته است، PWA را نصب کنید.";
  }

  return null;
}

export function getPushManagerUnavailableMessage(): string {
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
    "Push Manager روی این دستگاه در دسترس نیست. از مرورگر Chrome یا Safari به‌روز استفاده کنید."
  );
}
