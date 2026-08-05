/**
 * Local history of played guess-game rounds, per pairing. Independent from
 * PairRecord (lib/pairs.ts) because a PairRecord may not exist yet at the
 * moment a round's correctness becomes knowable — a first-time recipient
 * completes their own quiz only *after* viewing InviteReveal, so this store
 * is keyed directly by pairingId instead of hanging off pairing identity.
 *
 * Same per-browser-only limitation as lib/pairs.ts: this only ever captures
 * rounds where *this* device was the recipient (the only side that ever has
 * both the guesses and the real answers at once).
 */
import type { GuessRoundResult } from "./engine";

export interface RoundHistoryEntry extends GuessRoundResult {
  senderName: string;
  recordedAt: number;
}

const STORAGE_KEY = "ignite-round-history";

function readStore(): Record<string, RoundHistoryEntry[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, RoundHistoryEntry[]>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // storage full/unavailable — ignore, history just won't persist
  }
}

export function loadRoundHistory(pairingId: string): RoundHistoryEntry[] {
  return readStore()[pairingId] ?? [];
}

/** Upserts by round (idempotent against re-firing on the same round), sorted ascending. */
export function appendRoundHistory(pairingId: string, entry: RoundHistoryEntry): void {
  const store = readStore();
  const existing = (store[pairingId] ?? []).filter((e) => e.round !== entry.round);
  store[pairingId] = [...existing, entry].sort((a, b) => a.round - b.round);
  writeStore(store);
}

/** Wipes all round history on this device — used when the user explicitly restarts/starts over. */
export function clearRoundHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable — ignore
  }
}
