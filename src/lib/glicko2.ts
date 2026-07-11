// ═══════════════════════════════════════════════════════════════════════
// Glicko-2 Rating System — Full Implementation
// Based on Mark Glickman's "Example of the Glicko-2 system"
// Option A: Each game is treated as its own rating period.
// ═══════════════════════════════════════════════════════════════════════

// ─── Types ───────────────────────────────────────────────────────────────

export interface Glicko2Player {
  rating: number;       // Display-scale rating (e.g. 1500)
  rd: number;           // Rating Deviation — uncertainty (display scale)
  volatility: number;   // σ — how erratically results swing
  lastGameTimestamp: number; // Unix ms of last completed game
}

// ─── Constants ───────────────────────────────────────────────────────────

/** Converts between display scale and Glicko-2 internal scale */
const SCALE_FACTOR = 173.7178;

/** System constant τ — controls how much volatility can change per period.
 *  Lower = more conservative. Glickman suggests 0.3–1.2; 0.5 is a solid default. */
const TAU = 0.5;

/** Convergence tolerance for the iterative volatility solver */
const EPSILON = 0.000001;

/** Default values for brand-new players */
export const DEFAULT_RATING = 1500;
export const DEFAULT_RD = 350;
export const DEFAULT_VOLATILITY = 0.06;

/** RD ceiling — also the initial value; RD can never exceed this */
const MAX_RD = 350;

/** Players with RD above this are shown as "provisional" */
export const PROVISIONAL_THRESHOLD = 150;

/** How many milliseconds of inactivity before RD starts decaying (1 day) */
const INACTIVITY_PERIOD_MS = 24 * 60 * 60 * 1000;

// ─── Internal scale conversions ──────────────────────────────────────────

function toInternalRating(rating: number): number {
  return (rating - 1500) / SCALE_FACTOR;
}

function toInternalRD(rd: number): number {
  return rd / SCALE_FACTOR;
}

function toDisplayRating(mu: number): number {
  return SCALE_FACTOR * mu + 1500;
}

function toDisplayRD(phi: number): number {
  return SCALE_FACTOR * phi;
}

// ─── Core Glicko-2 functions ─────────────────────────────────────────────

/** Step 1 — g(φ): down-weights impact of high-uncertainty opponents */
function g(phi: number): number {
  return 1 / Math.sqrt(1 + 3 * phi * phi / (Math.PI * Math.PI));
}

/** Step 2 — E: expected score (win probability) against an opponent */
function E(mu: number, mu_j: number, phi_j: number): number {
  return 1 / (1 + Math.exp(-g(phi_j) * (mu - mu_j)));
}

/** Step 3 — Estimated variance v of the rating based on game outcomes */
function computeVariance(
  mu: number,
  opponents: Array<{ mu: number; phi: number }>
): number {
  let sum = 0;
  for (const opp of opponents) {
    const gVal = g(opp.phi);
    const eVal = E(mu, opp.mu, opp.phi);
    sum += gVal * gVal * eVal * (1 - eVal);
  }
  return 1 / sum;
}

/** Step 4 — Improvement estimate Δ */
function computeDelta(
  mu: number,
  opponents: Array<{ mu: number; phi: number }>,
  scores: number[],
  v: number
): number {
  let sum = 0;
  for (let i = 0; i < opponents.length; i++) {
    const opp = opponents[i];
    sum += g(opp.phi) * (scores[i] - E(mu, opp.mu, opp.phi));
  }
  return v * sum;
}

/** Step 5 — Compute new volatility σ' via Illinois algorithm (regula falsi variant) */
function computeNewVolatility(
  sigma: number,
  phi: number,
  v: number,
  delta: number
): number {
  const a = Math.log(sigma * sigma);
  const tau2 = TAU * TAU;
  const phi2 = phi * phi;
  const delta2 = delta * delta;

  // f(x) function as defined in Glickman's paper
  function f(x: number): number {
    const ex = Math.exp(x);
    const denom = phi2 + v + ex;
    const left = (ex * (delta2 - phi2 - v - ex)) / (2 * denom * denom);
    const right = (x - a) / tau2;
    return left - right;
  }

  // Initial bounds
  let A = a;
  let B: number;

  if (delta2 > phi2 + v) {
    B = Math.log(delta2 - phi2 - v);
  } else {
    let k = 1;
    while (f(a - k * TAU) < 0) {
      k++;
    }
    B = a - k * TAU;
  }

  // Illinois algorithm iteration
  let fA = f(A);
  let fB = f(B);

  while (Math.abs(B - A) > EPSILON) {
    const C = A + (A - B) * fA / (fB - fA);
    const fC = f(C);

    if (fC * fB <= 0) {
      A = B;
      fA = fB;
    } else {
      fA = fA / 2;
    }

    B = C;
    fB = fC;
  }

  return Math.exp(A / 2);
}

// ─── Main update function ────────────────────────────────────────────────

/**
 * Updates a player's Glicko-2 rating after a single game.
 * 
 * @param player - The player whose rating to update
 * @param opponent - The opponent's rating data
 * @param score - Game result: 1 = win, 0.5 = draw, 0 = loss
 * @returns A new Glicko2Player with updated values
 */
export function updateRating(
  player: Glicko2Player,
  opponent: Glicko2Player,
  score: number
): Glicko2Player {
  // Convert to internal scale
  const mu = toInternalRating(player.rating);
  const phi = toInternalRD(player.rd);
  const sigma = player.volatility;

  const mu_j = toInternalRating(opponent.rating);
  const phi_j = toInternalRD(opponent.rd);

  const opponents = [{ mu: mu_j, phi: phi_j }];
  const scores = [score];

  // Step 3: Estimated variance
  const v = computeVariance(mu, opponents);

  // Step 4: Improvement estimate
  const delta = computeDelta(mu, opponents, scores, v);

  // Step 5: New volatility
  const newSigma = computeNewVolatility(sigma, phi, v, delta);

  // Step 6: Pre-rating-period RD (inflate by volatility)
  const phiStar = Math.sqrt(phi * phi + newSigma * newSigma);

  // Step 7: New RD and rating
  const newPhi = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
  const newMu = mu + newPhi * newPhi * g(phi_j) * (score - E(mu, mu_j, phi_j));

  // Step 8: Convert back to display scale
  const newRating = toDisplayRating(newMu);
  const newRD = Math.min(toDisplayRD(newPhi), MAX_RD);

  return {
    rating: newRating,
    rd: newRD,
    volatility: newSigma,
    lastGameTimestamp: Date.now(),
  };
}

/**
 * Applies inactivity decay: inflates RD based on time since last game.
 * Called when loading a player who hasn't played recently.
 * Only RD changes; rating and volatility stay fixed.
 */
export function applyInactivityDecay(player: Glicko2Player): Glicko2Player {
  const now = Date.now();
  const elapsed = now - player.lastGameTimestamp;

  if (elapsed < INACTIVITY_PERIOD_MS || player.lastGameTimestamp === 0) {
    return player;
  }

  // Number of "periods" of inactivity
  const periods = Math.floor(elapsed / INACTIVITY_PERIOD_MS);
  const phi = toInternalRD(player.rd);
  const sigma = player.volatility;

  // Each period: φ' = sqrt(φ² + σ²)
  let newPhi = phi;
  for (let i = 0; i < periods; i++) {
    newPhi = Math.sqrt(newPhi * newPhi + sigma * sigma);
  }

  const newRD = Math.min(toDisplayRD(newPhi), MAX_RD);

  return {
    ...player,
    rd: newRD,
  };
}

// ─── Persistence helpers ─────────────────────────────────────────────────

const LS_KEY_RATING = 'glicko2_rating';
const LS_KEY_RD = 'glicko2_rd';
const LS_KEY_VOLATILITY = 'glicko2_volatility';
const LS_KEY_LAST_GAME = 'glicko2_last_game_ts';
const LS_KEY_OLD_ELO = 'chess_user_elo';

/**
 * Loads the player's Glicko-2 data from localStorage.
 * If only old Elo data exists, migrates it (preserving rating, setting high RD).
 * If nothing exists, returns fresh defaults.
 */
export function loadPlayer(): Glicko2Player {
  const storedRating = localStorage.getItem(LS_KEY_RATING);

  if (storedRating !== null) {
    // Full Glicko-2 data exists
    const player: Glicko2Player = {
      rating: parseFloat(storedRating),
      rd: parseFloat(localStorage.getItem(LS_KEY_RD) || String(DEFAULT_RD)),
      volatility: parseFloat(localStorage.getItem(LS_KEY_VOLATILITY) || String(DEFAULT_VOLATILITY)),
      lastGameTimestamp: parseInt(localStorage.getItem(LS_KEY_LAST_GAME) || '0', 10),
    };
    // Apply inactivity decay if needed
    return applyInactivityDecay(player);
  }

  // Check for old Elo migration
  const oldElo = localStorage.getItem(LS_KEY_OLD_ELO);
  if (oldElo !== null) {
    const migratedRating = parseInt(oldElo, 10);
    const player: Glicko2Player = {
      rating: isNaN(migratedRating) ? DEFAULT_RATING : migratedRating,
      rd: DEFAULT_RD, // High uncertainty — let them recalibrate
      volatility: DEFAULT_VOLATILITY,
      lastGameTimestamp: 0,
    };
    // Persist the migration immediately
    savePlayer(player);
    // Clean up old key
    localStorage.removeItem(LS_KEY_OLD_ELO);
    return player;
  }

  // Brand new player
  return {
    rating: DEFAULT_RATING,
    rd: DEFAULT_RD,
    volatility: DEFAULT_VOLATILITY,
    lastGameTimestamp: 0,
  };
}

/** Persists Glicko-2 data to localStorage */
export function savePlayer(player: Glicko2Player): void {
  localStorage.setItem(LS_KEY_RATING, player.rating.toString());
  localStorage.setItem(LS_KEY_RD, player.rd.toString());
  localStorage.setItem(LS_KEY_VOLATILITY, player.volatility.toString());
  localStorage.setItem(LS_KEY_LAST_GAME, player.lastGameTimestamp.toString());
}

// ─── Display helpers ─────────────────────────────────────────────────────

/** Returns true if the player's rating is still "provisional" (high uncertainty) */
export function isProvisional(player: Glicko2Player): boolean {
  return player.rd > PROVISIONAL_THRESHOLD;
}

/**
 * Returns a fixed Glicko2Player representing a bot at the given level.
 * Bots have deterministic strength, so their RD is low (50).
 */
export function getBotPlayer(level: number): Glicko2Player {
  return {
    rating: 600 + level * 250,
    rd: 50,
    volatility: DEFAULT_VOLATILITY,
    lastGameTimestamp: Date.now(),
  };
}

/**
 * Formats the player's rating for display.
 * Provisional players show "~RATING?" to indicate uncertainty.
 */
export function formatRating(player: Glicko2Player): string {
  const rounded = Math.round(player.rating);
  if (isProvisional(player)) {
    return `~${rounded}?`;
  }
  return String(rounded);
}
