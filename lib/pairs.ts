/**
 * Local "known pairings" memory. There's no backend/accounts, so recognizing
 * a returning pairing can only ever be per-browser — this is a deliberate,
 * accepted limitation, not an oversight. Keyed by a random pairing id (not by
 * zodiac sign, which can't distinguish two different real people who happen
 * to share a sign) generated once by whoever originates the very first
 * invite in a pairing, then carried in every invite link for that pairing.
 */
import type { Sign, SoloResultData } from "./engine";

export interface PairRecord {
  pairingId: string;
  userSign: Sign;
  partnerSign: Sign;
  soloResult: SoloResultData;
  guessRound: number;
  updatedAt: number;
}

const STORAGE_KEY = "ignite-pairs";

function readStore(): Record<string, PairRecord> {
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

function writeStore(store: Record<string, PairRecord>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // storage full/unavailable — ignore, pairing memory just won't persist
  }
}

export function loadPair(pairingId: string): PairRecord | null {
  return readStore()[pairingId] ?? null;
}

export function savePair(record: Omit<PairRecord, "updatedAt">): void {
  const store = readStore();
  store[record.pairingId] = { ...record, updatedAt: Date.now() };
  writeStore(store);
}

export function loadMostRecentPair(): PairRecord | null {
  const store = readStore();
  const records = Object.values(store);
  if (records.length === 0) return null;
  return records.reduce((latest, r) => (r.updatedAt > latest.updatedAt ? r : latest));
}
