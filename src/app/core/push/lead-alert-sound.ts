export function playRealtimeLeadAlertSound(): void {
  if (typeof window === "undefined") return;

  playAttentionChime();
  vibrateRealtimeLeadAlert();
}

function playAttentionChime(): void {
  try {
    const AudioContextCtor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextCtor) return;

    const context = new AudioContextCtor();
    const masterGain = context.createGain();
    masterGain.gain.value = 0.42;
    masterGain.connect(context.destination);

    const melody = [
      { frequency: 659.25, start: 0, duration: 0.38 },
      { frequency: 783.99, start: 0.16, duration: 0.38 },
      { frequency: 987.77, start: 0.32, duration: 0.42 },
      { frequency: 1318.51, start: 0.5, duration: 0.58 },
    ];

    melody.forEach(({ frequency, start, duration }) => {
      playChimeNote(context, masterGain, frequency, start, duration);
    });

    window.setTimeout(() => void context.close(), 1250);
  } catch {
    // Audio is optional.
  }
}

function playChimeNote(
  context: AudioContext,
  destination: GainNode,
  frequency: number,
  startOffset: number,
  duration: number,
): void {
  const startTime = context.currentTime + startOffset;
  const noteGain = context.createGain();
  noteGain.connect(destination);

  noteGain.gain.setValueAtTime(0.0001, startTime);
  noteGain.gain.exponentialRampToValueAtTime(0.32, startTime + 0.012);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  const fundamental = context.createOscillator();
  fundamental.type = "sine";
  fundamental.frequency.value = frequency;
  fundamental.connect(noteGain);

  const harmonic = context.createOscillator();
  harmonic.type = "sine";
  harmonic.frequency.value = frequency * 2.76;
  const harmonicGain = context.createGain();
  harmonicGain.gain.value = 0.16;
  harmonic.connect(harmonicGain);
  harmonicGain.connect(noteGain);

  fundamental.start(startTime);
  harmonic.start(startTime);
  fundamental.stop(startTime + duration + 0.04);
  harmonic.stop(startTime + duration + 0.04);
}

function vibrateRealtimeLeadAlert(): void {
  const navigatorWithVibration = navigator as Navigator & {
    vibrate?: (pattern: number | number[]) => boolean;
  };
  navigatorWithVibration.vibrate?.([280, 100, 280, 100, 320]);
}
