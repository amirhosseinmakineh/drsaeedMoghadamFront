import { OFFLINE_LEAD_ALERT_SOUND_URL } from "./offline-lead-push-message";

let sharedAlertAudio: HTMLAudioElement | null = null;

export function preloadOfflineLeadAlertSound(): void {
  if (typeof window === "undefined") return;

  try {
    if (!sharedAlertAudio) {
      sharedAlertAudio = new Audio(OFFLINE_LEAD_ALERT_SOUND_URL);
      sharedAlertAudio.preload = "auto";
    }
    sharedAlertAudio.load();
  } catch {
    // Optional preload.
  }
}

export function playOfflineLeadAlertSound(): void {
  if (typeof window === "undefined") return;

  playAlertAudioFile();
  playAttentionBeeps();
  vibrateOfflineLeadAlert();
}

function playAlertAudioFile(): void {
  try {
    if (!sharedAlertAudio) {
      sharedAlertAudio = new Audio(OFFLINE_LEAD_ALERT_SOUND_URL);
      sharedAlertAudio.preload = "auto";
    }

    sharedAlertAudio.currentTime = 0;
    sharedAlertAudio.volume = 1;
    void sharedAlertAudio.play().catch(() => {
      // Fall back to synthesized beeps below.
    });
  } catch {
    // Ignore and rely on synthesized beeps.
  }
}

function playAttentionBeeps(): void {
  try {
    const AudioContextCtor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextCtor) return;

    const context = new AudioContextCtor();
    const gain = context.createGain();
    gain.gain.value = 0.28;
    gain.connect(context.destination);

    const pattern = [
      { frequency: 980, start: 0, duration: 0.16 },
      { frequency: 1180, start: 0.24, duration: 0.16 },
      { frequency: 1380, start: 0.48, duration: 0.22 },
      { frequency: 1180, start: 0.8, duration: 0.16 },
      { frequency: 980, start: 1.04, duration: 0.2 },
    ];

    pattern.forEach(({ frequency, start, duration }) => {
      const oscillator = context.createOscillator();
      oscillator.type = "square";
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start(context.currentTime + start);
      oscillator.stop(context.currentTime + start + duration);
    });

    window.setTimeout(() => void context.close(), 1400);
  } catch {
    // Audio is optional.
  }
}

function vibrateOfflineLeadAlert(): void {
  const navigatorWithVibration = navigator as Navigator & {
    vibrate?: (pattern: number | number[]) => boolean;
  };
  navigatorWithVibration.vibrate?.([400, 120, 400, 120, 400, 120, 400, 120, 400]);
}
