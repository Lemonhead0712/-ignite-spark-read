import { describe, expect, it } from "vitest";
import {
  ATT_BLEND,
  CON_BLEND,
  GUESS_QS,
  SIGNS,
  buildInviteMessage,
  buildShareText,
  computeScore,
  decodeInvitePayload,
  computeSoloResult,
  createEmptyScoreState,
  type AttKey,
  type ConKey,
  type LoveKey,
  type ScoreState,
  type Sign,
  topTwo,
} from "./engine";

function scoreState(overrides: Partial<ScoreState>): ScoreState {
  const base = createEmptyScoreState();
  return { ...base, ...overrides };
}

const NEUTRAL = createEmptyScoreState();

const ATT_BLEND_FIXTURE: ScoreState = scoreState({ att: { secure: 5, anxious: 4, avoidant: 0 } });
const LOVE_BLEND_FIXTURE: ScoreState = scoreState({ love: { words: 5, time: 4, acts: 0, touch: 0, gifts: 0 } });
const CON_BLEND_FIXTURE: ScoreState = scoreState({ con: { direct: 5, collab: 4, avoidant: 0, accommodating: 0 } });
const SIGNATURE_ANSWERS = ["You bring it up right away — no marinating, no mystery."];

const FIXTURES: { name: string; state: ScoreState; sigAnswers: string[] }[] = [
  { name: "neutral", state: NEUTRAL, sigAnswers: [] },
  { name: "att-blend", state: ATT_BLEND_FIXTURE, sigAnswers: SIGNATURE_ANSWERS },
  { name: "love-blend", state: LOVE_BLEND_FIXTURE, sigAnswers: SIGNATURE_ANSWERS },
  { name: "con-blend", state: CON_BLEND_FIXTURE, sigAnswers: SIGNATURE_ANSWERS },
];

describe("computeSoloResult", () => {
  for (const userSign of SIGNS) {
    for (const partnerSign of SIGNS) {
      for (const fixture of FIXTURES) {
        it(`produces valid copy for ${userSign.n} x ${partnerSign.n} (${fixture.name})`, () => {
          const result = computeSoloResult(userSign, partnerSign, fixture.state, fixture.sigAnswers);

          expect(result.score).toBeGreaterThanOrEqual(38);
          expect(result.score).toBeLessThanOrEqual(97);
          expect(result.scoreTease.length).toBeGreaterThan(0);

          expect(result.chips).toHaveLength(3);
          result.chips.forEach((chip) => expect(chip.length).toBeGreaterThan(0));

          expect(result.sectionA.paragraphs).toHaveLength(3);
          result.sectionA.paragraphs.forEach((p) => expect(p.length).toBeGreaterThan(0));
          expect(result.sectionA.kicker.length).toBeGreaterThan(0);

          expect(result.sectionB.paragraphs).toHaveLength(5);
          result.sectionB.paragraphs.forEach((p) => expect(p.length).toBeGreaterThan(0));
          expect(result.sectionB.kicker.length).toBeGreaterThan(0);
        });
      }
    }
  }

  it("covers all 144 sign pairs", () => {
    const pairs = new Set<string>();
    for (const a of SIGNS) for (const b of SIGNS) pairs.add(`${a.n}-${b.n}`);
    expect(pairs.size).toBe(144);
  });
});

describe("computeScore clamping", () => {
  const ATT_KEYS: AttKey[] = ["secure", "anxious", "avoidant"];
  const CON_KEYS: ConKey[] = ["direct", "collab", "avoidant", "accommodating"];

  it("stays within [38, 97] for every sign pair and att/con combination", () => {
    for (const userSign of SIGNS) {
      for (const partnerSign of SIGNS) {
        for (const att of ATT_KEYS) {
          for (const con of CON_KEYS) {
            const score = computeScore(userSign, partnerSign, att, con);
            expect(score).toBeGreaterThanOrEqual(38);
            expect(score).toBeLessThanOrEqual(97);
          }
        }
      }
    }
  });

  it("is deterministic for the same inputs", () => {
    const a = SIGNS[0];
    const b = SIGNS[5];
    expect(computeScore(a, b, "secure", "collab")).toBe(computeScore(a, b, "secure", "collab"));
  });
});

describe("topTwo blend detection", () => {
  it("blends when margin <= 1 and second value > 0", () => {
    const r = topTwo<AttKey>({ secure: 5, anxious: 4, avoidant: 0 });
    expect(r.blended).toBe(true);
    expect(r.k1).toBe("secure");
    expect(r.k2).toBe("anxious");
  });

  it("does not blend when margin > 1", () => {
    const r = topTwo<AttKey>({ secure: 6, anxious: 4, avoidant: 0 });
    expect(r.blended).toBe(false);
  });

  it("does not blend when the runner-up is exactly 0", () => {
    const r = topTwo<AttKey>({ secure: 1, anxious: 0, avoidant: 0 });
    expect(r.blended).toBe(false);
  });

  it("does not blend on an all-zero state", () => {
    const r = topTwo<LoveKey>({ words: 0, time: 0, acts: 0, touch: 0, gifts: 0 });
    expect(r.blended).toBe(false);
  });

  it("every ATT_BLEND key pairs two distinct attachment styles", () => {
    for (const key of Object.keys(ATT_BLEND)) {
      const [k1, k2] = key.split("-");
      expect(["secure", "anxious", "avoidant"]).toContain(k1);
      expect(["secure", "anxious", "avoidant"]).toContain(k2);
      expect(k1).not.toBe(k2);
    }
  });

  it("every CON_BLEND key pairs two distinct conflict styles", () => {
    for (const key of Object.keys(CON_BLEND)) {
      const [k1, k2] = key.split("-");
      expect(["direct", "collab", "avoidant", "accommodating"]).toContain(k1);
      expect(["direct", "collab", "avoidant", "accommodating"]).toContain(k2);
      expect(k1).not.toBe(k2);
    }
  });
});

describe("share and invite text", () => {
  const userSign: Sign = SIGNS.find((s) => s.n === "Aries")!;
  const partnerSign: Sign = SIGNS.find((s) => s.n === "Scorpio")!;

  it("builds non-empty share text referencing both signs and the score", () => {
    const text = buildShareText(userSign, partnerSign, {
      score: 72,
      scoreTease: "Real potential, real friction.",
      chips: ["Steady flame", "Words first", "Direct in conflict"],
    });
    expect(text).toContain("Aries");
    expect(text).toContain("Scorpio");
    expect(text).toContain("72");
    expect(text).toContain("Steady flame");
  });

  it("builds an invite message carrying a base64 payload link", () => {
    const { message, link } = buildInviteMessage(userSign, partnerSign, [0, 1, 2], 72, "http://localhost:3000");
    expect(message).toContain(link);
    expect(link).toContain("http://localhost:3000/read?invite=");
  });

  it("round-trips the invite payload through decodeInvitePayload", () => {
    const { link } = buildInviteMessage(userSign, partnerSign, [0, 1, 2], 72, "http://localhost:3000");
    const raw = new URL(link).searchParams.get("invite")!;
    const decoded = decodeInvitePayload(raw);
    expect(decoded).toEqual({ u: "Aries", p: "Scorpio", g: [0, 1, 2], s: 72 });
  });

  it("returns null for an invalid invite payload", () => {
    expect(decodeInvitePayload("not-valid-base64!!")).toBeNull();
  });
});

describe("GUESS_QS", () => {
  it("has exactly 3 fixed questions with 4 options each", () => {
    expect(GUESS_QS).toHaveLength(3);
    GUESS_QS.forEach((q) => expect(q.o).toHaveLength(4));
  });
});
