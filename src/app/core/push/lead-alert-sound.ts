import { REALTIME_LEAD_VIBRATE_PATTERN } from "./lead-alert.constants";

let audioContext: AudioContext | null = null;

/** Call after a user gesture so iOS/Android allow loud alert audio later. */
export function primeRealtimeLeadAlertAudio(): void {
  if (typeof window === "undefined") return;

  try {
    const context = getOrCreateAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
      void context.resume();
    }
  } catch {
    // Audio priming is optional.
  }
}

export function playRealtimeLeadAlertSound(): void {
  if (typeof window === "undefined") return;

  playAttentionChime();
  vibrateRealtimeLeadAlert();
}

function getOrCreateAudioContext(): AudioContext | null {
  const AudioContextCtor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextCtor) return null;

  if (!audioContext || audioContext.state === "closed") {
    audioContext = new AudioContextCtor();
  }

  return audioContext;
}

function playAttentionChime(): void {
  try {
    const context = getOrCreateAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
      void context.resume();
    }

    const masterGain = context.createGain();
    masterGain.gain.value = 0.72;
    masterGain.connect(context.destination);

    const melody = [
      { frequency: 659.25, start: 0, duration: 0.42 },
      { frequency: 783.99, start: 0.14, duration: 0.42 },
      { frequency: 987.77, start: 0.28, duration: 0.46 },
      { frequency: 1318.51, start: 0.44, duration: 0.62 },
      { frequency: 987.77, start: 0.72, duration: 0.38 },
      { frequency: 1318.51, start: 0.86, duration: 0.58 },
    ];

    melody.forEach(({ frequency, start, duration }) => {
      playChimeNote(context, masterGain, frequency, start, duration);
    });

    window.setTimeout(() => {
      if (audioContext === context && context.state !== "closed") {
        void context.close();
        audioContext = null;
      }
    }, 1600);
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
  noteGain.gain.exponentialRampToValueAtTime(0.58, startTime + 0.01);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  const fundamental = context.createOscillator();
  fundamental.type = "square";
  fundamental.frequency.value = frequency;
  fundamental.connect(noteGain);

  const harmonic = context.createOscillator();
  harmonic.type = "sawtooth";
  harmonic.frequency.value = frequency * 1.5;
  const harmonicGain = context.createGain();
  harmonicGain.gain.value = 0.22;
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
  navigatorWithVibration.vibrate?.([...REALTIME_LEAD_VIBRATE_PATTERN]);
}
