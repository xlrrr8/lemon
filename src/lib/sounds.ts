// ═══════════════════════════════════════════════════════════════════════
// Chess Sound Effects — Web Audio API synthesis (no external files)
// ═══════════════════════════════════════════════════════════════════════

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // Resume if suspended (browsers require user gesture)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// ─── Wooden table tap — regular moves ────────────────────────────────
// A short, warm knock sound: filtered noise burst + low thump
export function playMoveSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // 1) Low-frequency "thump" — the wood body resonance
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);
  oscGain.gain.setValueAtTime(0.35, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  osc.connect(oscGain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.12);

  // 2) Noise burst — the "click" transient of wood
  const bufferSize = ctx.sampleRate * 0.04; // 40ms of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Bandpass filter to make noise sound "woody"
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 1.2;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.25, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  noise.connect(filter).connect(noiseGain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.06);
}

// ─── Capture sound — deeper, heavier tap ─────────────────────────────
// Like slamming a piece down harder on wood
export function playCaptureSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Deeper thump
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(90, now);
  osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
  oscGain.gain.setValueAtTime(0.45, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc.connect(oscGain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.18);

  // Sharper, louder noise transient
  const bufferSize = ctx.sampleRate * 0.05;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2.5);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 600;
  filter.Q.value = 0.8;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.35, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  noise.connect(filter).connect(noiseGain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.08);

  // Second knock (double-tap feel for captures)
  const osc2 = ctx.createOscillator();
  const osc2Gain = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(70, now + 0.05);
  osc2.frequency.exponentialRampToValueAtTime(30, now + 0.15);
  osc2Gain.gain.setValueAtTime(0.2, now + 0.05);
  osc2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  osc2.connect(osc2Gain).connect(ctx.destination);
  osc2.start(now + 0.05);
  osc2.stop(now + 0.2);
}

// ─── Check sound — soft alert tone ───────────────────────────────────
// A gentle two-note chime that says "watch out"
export function playCheckSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // First tone
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.frequency.value = 520;
  gain1.gain.setValueAtTime(0, now);
  gain1.gain.linearRampToValueAtTime(0.18, now + 0.02);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc1.connect(gain1).connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.22);

  // Second tone (slightly higher, delayed)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.value = 660;
  gain2.gain.setValueAtTime(0, now + 0.1);
  gain2.gain.linearRampToValueAtTime(0.15, now + 0.12);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(now + 0.1);
  osc2.stop(now + 0.38);
}

// ─── Checkmate sound — satisfying resolution ─────────────────────────
// A soft 3-note descending chime (game over, decisive)
export function playCheckmateSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const notes = [660, 520, 392]; // E5, C5, G4 — a resolving triad
  const delays = [0, 0.15, 0.3];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const t = now + delays[i];
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.03);
    gain.gain.setValueAtTime(0.2, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.55);
  });
}

// ─── Helper: determine which sound to play after a move ──────────────
export type ChessSoundType = 'move' | 'capture' | 'check' | 'checkmate';

export function playChessSound(type: ChessSoundType) {
  switch (type) {
    case 'checkmate':
      playCheckmateSound();
      break;
    case 'check':
      playCheckSound();
      break;
    case 'capture':
      playCaptureSound();
      break;
    case 'move':
    default:
      playMoveSound();
      break;
  }
}
