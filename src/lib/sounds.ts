// Chess sound effects — gentle table-tap style using Web Audio API.
// Move/capture sounds mimic the soft "tok" of placing a piece on wood.

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

/* ───── core helpers ───── */

/**
 * A gentle "table tap" — short percussive thud like placing a piece on wood.
 * Uses a low sine that decays very quickly + a tiny filtered noise layer
 * for the wooden surface texture.
 */
function tableTap(volume = 0.25, pitch = 100) {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // 1) Low-frequency "body" of the tap
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    // Pitch drops quickly — characteristic of a tap
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, now + 0.06);

    oscGain.gain.setValueAtTime(volume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);

    // 2) Tiny burst of filtered noise for the "surface" texture
    const bufferSize = Math.floor(ctx.sampleRate * 0.04);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        // Decaying noise
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 4);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    // Bandpass filter to make it sound woody, not hissy
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(1.5, now);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
}

/** A soft tone with smooth envelope — used for musical cues (check, checkmate, etc.) */
function softTone(
    frequency: number,
    duration: number,
    volume = 0.06,
    startDelay = 0,
) {
    const ctx = getCtx();
    const now = ctx.currentTime + startDelay;
    const attack = 0.012;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);
}

/* ───── audio elements ───── */
const moveAudio = new Audio('/sounds/move.mp3');
const captureAudio = new Audio('/sounds/capture.mp3');
const checkAudio = new Audio('/sounds/check.mp3');

function playRealSound(audioNode: HTMLAudioElement, vol = 0.7) {
    try {
        const clone = audioNode.cloneNode() as HTMLAudioElement;
        clone.volume = vol;
        clone.play().catch(e => console.error("Audio playback blocked", e));
    } catch (e) {
        // Fallback for strict environments
        console.error("Audio playback failed", e);
    }
}

/* ───── public API ───── */

/** Authentic tap — placing a piece down */
export function playMove() {
    playRealSound(moveAudio, 0.8);
}

/** Standard capture sound */
export function playCapture() {
    playRealSound(captureAudio, 0.9);
}

/** Warm rising hint for check */
export function playCheck() {
    playRealSound(checkAudio, 0.6);
    // Add original soft tone
    softTone(350, 0.2, 0.05);
    softTone(470, 0.15, 0.04, 0.1);
}

/** Resolving chord for checkmate */
export function playCheckmate() {
    // A satisfying climax of soft wooden taps ending in a solid thud
    tableTap(0.4, 150);
    setTimeout(() => tableTap(0.5, 120), 80);
    setTimeout(() => tableTap(0.6, 90), 160);
    setTimeout(() => {
        playRealSound(captureAudio, 1.0);
        tableTap(0.8, 60);
    }, 280);
}

/** Gentle descending tones for draw */
export function playDraw() {
    softTone(392, 0.3, 0.05);          // G4
    softTone(349, 0.3, 0.04, 0.18);    // F4
    softTone(330, 0.45, 0.04, 0.36);   // E4
}

/** Castling sound */
export function playCastle() {
    // Castle sounds like a move and a quick slide usually, we'll double tap move
    playRealSound(moveAudio, 0.8);
    setTimeout(() => playRealSound(moveAudio, 0.6), 120);
}

/** Tap + ascending shimmer for promotion */
export function playPromotion() {
    playRealSound(moveAudio, 0.9);
    softTone(524, 0.15, 0.04, 0.05);
    softTone(660, 0.15, 0.04, 0.12);
    softTone(784, 0.15, 0.04, 0.19);
    softTone(1048, 0.2, 0.05, 0.26);
}

/** Soft double-tap for new game */
export function playNewGame() {
    playRealSound(moveAudio, 0.5);
    setTimeout(() => playRealSound(moveAudio, 0.3), 150);
}
