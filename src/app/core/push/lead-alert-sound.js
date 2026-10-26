 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { REALTIME_LEAD_VIBRATE_PATTERN } from "./lead-alert.constants";

const REMINDER_SOUND_INTERVAL_MS = 6000;
const CHIME_ONE_SHOT_CLOSE_MS = 2800;

let audioContext = null;
const loopingLeadIds = new Set();
const leadSoundTimers = new Map();
let closeContextTimer = null;
let activeOscillators = [];

/** Call after a user gesture so iOS/Android allow loud alert audio later. */
export function primeRealtimeLeadAlertAudio() {
  if (typeof window === "undefined") return;

  try {
    const context = getOrCreateAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
      void context.resume();
    }
  } catch (e) {
    // Audio priming is optional.
  }
}

/** One-shot alert (e.g. test notifications). */
export function playRealtimeLeadAlertSound() {
  if (typeof window === "undefined") return;

  playAttentionChime({ closeContextAfterPlayback: true });
  vibrateRealtimeLeadAlert();
}

/** Remind every 6 seconds until this lead is picked up by someone. */
export function startRealtimeLeadAlertSoundLoop(leadId) {
  if (typeof window === "undefined" || !leadId) return;
  if (leadSoundTimers.has(leadId)) return;

  const playReminder = () => {
    if (!loopingLeadIds.has(leadId)) return;
    playAttentionChime({ closeContextAfterPlayback: false });
    vibrateRealtimeLeadAlert();
  };

  loopingLeadIds.add(leadId);
  playReminder();
  leadSoundTimers.set(
    leadId,
    window.setInterval(playReminder, REMINDER_SOUND_INTERVAL_MS),
  );
}

export function stopRealtimeLeadAlertSoundLoop(leadId) {
  if (!leadId) return;

  loopingLeadIds.delete(leadId);

  const timer = leadSoundTimers.get(leadId);
  if (timer) {
    clearInterval(timer);
    leadSoundTimers.delete(leadId);
  }

  if (loopingLeadIds.size === 0) {
    stopSoundLoop();
  }
}

function stopSoundLoop() {
  for (const timer of leadSoundTimers.values()) {
    clearInterval(timer);
  }
  leadSoundTimers.clear();

  if (closeContextTimer) {
    clearTimeout(closeContextTimer);
    closeContextTimer = null;
  }

  stopActiveOscillators();

  if (audioContext && audioContext.state !== "closed") {
    void audioContext.close();
    audioContext = null;
  }
}

function getOrCreateAudioContext() {
  const AudioContextCtor =
    window.AudioContext ||
    (window )
      .webkitAudioContext;
  if (!AudioContextCtor) return null;

  if (!audioContext || audioContext.state === "closed") {
    audioContext = new AudioContextCtor();
  }

  return audioContext;
}

function playAttentionChime(options

) {
  try {
    const context = getOrCreateAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
      void context.resume();
    }

    stopActiveOscillators();

    const masterGain = context.createGain();
    masterGain.gain.value = 1;
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

    if (!options.closeContextAfterPlayback) return;

    if (closeContextTimer) {
      clearTimeout(closeContextTimer);
    }

    closeContextTimer = window.setTimeout(() => {
      closeContextTimer = null;
      if (loopingLeadIds.size > 0) return;

      stopActiveOscillators();
      if (audioContext === context && context.state !== "closed") {
        void context.close();
        audioContext = null;
      }
    }, CHIME_ONE_SHOT_CLOSE_MS);
  } catch (e2) {
    // Audio is optional.
  }
}

function playChimeNote(
  context,
  destination,
  frequency,
  startOffset,
  duration,
) {
  const startTime = context.currentTime + startOffset;
  const noteGain = context.createGain();
  noteGain.connect(destination);

  noteGain.gain.setValueAtTime(0.0001, startTime);
  noteGain.gain.exponentialRampToValueAtTime(0.9, startTime + 0.01);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  const fundamental = context.createOscillator();
  fundamental.type = "square";
  fundamental.frequency.value = frequency;
  fundamental.connect(noteGain);

  const harmonic = context.createOscillator();
  harmonic.type = "sawtooth";
  harmonic.frequency.value = frequency * 1.5;
  const harmonicGain = context.createGain();
  harmonicGain.gain.value = 0.38;
  harmonic.connect(harmonicGain);
  harmonicGain.connect(noteGain);

  fundamental.start(startTime);
  harmonic.start(startTime);
  fundamental.stop(startTime + duration + 0.04);
  harmonic.stop(startTime + duration + 0.04);

  activeOscillators.push(fundamental, harmonic);
}

function stopActiveOscillators() {
  for (const oscillator of activeOscillators) {
    try {
      oscillator.stop();
      oscillator.disconnect();
    } catch (e3) {
      // Already stopped.
    }
  }
  activeOscillators = [];
}

function vibrateRealtimeLeadAlert() {
  const navigatorWithVibration = navigator 

;
  _optionalChain([navigatorWithVibration, 'access', _ => _.vibrate, 'optionalCall', _2 => _2([...REALTIME_LEAD_VIBRATE_PATTERN])]);
}
