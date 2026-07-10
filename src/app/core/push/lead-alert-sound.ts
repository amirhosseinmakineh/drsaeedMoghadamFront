export function playRealtimeLeadAlertSound(): void {
  if (typeof window === "undefined") return;

  playGentleLeadChime();
  vibrateRealtimeLeadAlert();
}

function playGentleLeadChime(): void {
  try {
    const AudioContextCtor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextCtor) return;

    const context = new AudioContextCtor();
    const masterGain = context.createGain();
    masterGain.gain.value = 0.0001;
    masterGain.connect(context.destination);

    const notes = [
      { frequency: 784, start: 0, duration: 0.22, peak: 0.34 },
      { frequency: 988, start: 0.18, duration: 0.28, peak: 0.3 },
      { frequency: 1175, start: 0.42, duration: 0.34, peak: 0.24 },
    ];

    notes.forEach(({ frequency, start, duration, peak }) => {
      const oscillator = context.createOscillator();
      const noteGain = context.createGain();
      const startAt = context.currentTime + start;
      const endAt = startAt + duration;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startAt);
      oscillator.connect(noteGain);
      noteGain.connect(masterGain);

      noteGain.gain.setValueAtTime(0.0001, startAt);
      noteGain.gain.exponentialRampToValueAtTime(peak, startAt + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, endAt);

      oscillator.start(startAt);
      oscillator.stop(endAt + 0.02);
    });

    masterGain.gain.exponentialRampToValueAtTime(0.22, context.currentTime + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.95);

    window.setTimeout(() => void context.close(), 1100);
  } catch {
    // Audio is optional.
  }
}

function vibrateRealtimeLeadAlert(): void {
  const navigatorWithVibration = navigator as Navigator & {
    vibrate?: (pattern: number | number[]) => boolean;
  };
  navigatorWithVibration.vibrate?.([220, 90, 220, 90, 280]);
}
