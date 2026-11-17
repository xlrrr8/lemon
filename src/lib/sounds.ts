// ═══════════════════════════════════════════════════════════════════════
// Chess Sound Effects — Ultra-Low Latency Audio System
// ═══════════════════════════════════════════════════════════════════════

let audioCtx: AudioContext | null = null;
const bufferCache: Map<string, AudioBuffer> = new Map();
let isAudioMuted: boolean = typeof window !== 'undefined' ? localStorage.getItem('chess_audio_muted') === 'true' : false;

export function isSoundMuted(): boolean {
  return isAudioMuted;
}

export function setSoundMuted(muted: boolean): void {
  isAudioMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('chess_audio_muted', String(muted));
  }
}

export function toggleSoundMuted(): boolean {
  setSoundMuted(!isAudioMuted);
  return isAudioMuted;
}

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        // Set latency hint to 'interactive' for fastest response
        latencyHint: 'interactive'
    });
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Loads and decodes an audio file. Returns the buffer once if already loaded.
 */
async function loadBuffer(url: string): Promise<AudioBuffer> {
  if (bufferCache.has(url)) return bufferCache.get(url)!;

  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const ctx = getAudioContext();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  
  bufferCache.set(url, audioBuffer);
  return audioBuffer;
}

/**
 * Plays an AudioBuffer synchronously to avoid promise microtask delays.
 */
function playBufferImmediate(buffer: AudioBuffer, volume: number = 1.0) {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  
  if (volume !== 1.0) {
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
  } else {
    source.connect(ctx.destination);
  }
  
  // Using 0 ensures it starts as fast as the hardware allows
  source.start(0);
}

// ─── External mp3 — regular moves ────────────────────────────────────
export function playMoveSound() {
  playCaptureSound();
}

// ─── External mp3 — error moves ────────────────────────────────────
export function playErrorSound() {
  const buffer = bufferCache.get('/sounds/error.mp3');
  if (buffer) {
    playBufferImmediate(buffer);
  } else {
    loadBuffer('/sounds/error.mp3').then(playBufferImmediate).catch(() => {});
  }
}

// ─── External mp3 — capture moves ────────────────────────────────────
export function playCaptureSound() {
  const buffer = bufferCache.get('/sounds/capture.wav');
  if (buffer) {
    playBufferImmediate(buffer, 3.0);
  } else {
    loadBuffer('/sounds/capture.wav').then(b => playBufferImmediate(b, 3.0)).catch(() => {});
  }
}

// ─── Checkmate sound ─────────────────────────────────────────────────
export function playCheckmateSound() {
  const buffer = bufferCache.get('/sounds/checkmate.mp3');
  if (buffer) {
    playBufferImmediate(buffer, 3.0);
  } else {
    loadBuffer('/sounds/checkmate.mp3').then(b => playBufferImmediate(b, 3.0)).catch(() => {});
  }
}

// ─── Castle sound ────────────────────────────────────────────────────
export function playCastleSound() {
  const buffer = bufferCache.get('/sounds/castle.mp3');
  if (buffer) {
    playBufferImmediate(buffer, 3.0);
  } else {
    loadBuffer('/sounds/castle.mp3').then(b => playBufferImmediate(b, 3.0)).catch(() => {});
  }
}

// ─── Helper: determine which sound to play after a move ──────────────
export type ChessSoundType = 'move' | 'capture' | 'check' | 'checkmate' | 'error' | 'castle';

export function playChessSound(type: ChessSoundType) {
  switch (type) {
    case 'error':
      playErrorSound();
      break;
    case 'checkmate':
      playCheckmateSound();
      break;
    case 'check':
      playMoveSound();
      break;
    case 'capture':
      playCaptureSound();
      break;
    case 'castle':
      playCastleSound();
      break;
    case 'move':
    default:
      playMoveSound();
      break;
  }
}

// FORCE PRE-LOAD ON STARTUP
if (typeof window !== 'undefined') {
  // Pre-load immediately
  loadBuffer('/sounds/move.mp3').catch(() => {});
  loadBuffer('/sounds/capture.wav').catch(() => {});
  loadBuffer('/sounds/error.mp3').catch(() => {});
  loadBuffer('/sounds/checkmate.mp3').catch(() => {});
  loadBuffer('/sounds/castle.mp3').catch(() => {});

  // Extra insurance: reload on first click to handle browser autoplay policies
  window.addEventListener('mousedown', () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    loadBuffer('/sounds/move.mp3').catch(() => {});
    loadBuffer('/sounds/capture.wav').catch(() => {});
    loadBuffer('/sounds/error.mp3').catch(() => {});
    loadBuffer('/sounds/checkmate.mp3').catch(() => {});
    loadBuffer('/sounds/castle.mp3').catch(() => {});
  }, { once: true });
}
