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

export function getPushEnvironmentIssue(): string | null {
  if (!hasBasicNotificationApis()) {
    return "مرورگر شما از نوتیفیکیشن PWA پشتیبانی نمی‌کند.";
  }

  if (isIosDevice() && !isStandalonePwa()) {
    return (
      "روی iPhone/iPad باید سایت را با Share → Add to Home Screen نصب کنید " +
      "و از آیکن روی صفحه اصلی باز کنید. باز کردن از داخل Safari نوتیف نمی‌دهد."
    );
  }

  if (isMobileDevice() && !isStandalonePwa()) {
    return (
      "برای نوتیفیکیشن، PWA را نصب کنید: در Chrome منو → Install app " +
      "یا Add to Home screen، سپس از آیکن نصب‌شده باز کنید."
    );
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
      "Push روی این گوشی فعال نیست. PWA را از آیکن نصب‌شده باز کنید " +
      "و اجازه Notification را در تنظیمات مرورگر/اپ فعال کنید."
    );
  }

  return (
    "Push Manager روی این دستگاه در دسترس نیست. PWA را نصب کنید " +
    "و از مرورگر Chrome یا Safari به‌روز استفاده کنید."
  );
}
