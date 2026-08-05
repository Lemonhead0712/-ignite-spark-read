import { describe, expect, it } from "vitest";
import {
  ATT_BLEND,
  CON_BLEND,
  GUESS_QS,
  GUESS_ROUND_SIZE,
  QUESTIONS,
  QUICK_QUESTION_INDICES,
  SIGNS,
  buildInviteMessage,
  buildShareText,
  computeRoundResult,
  computeScore,
  decodeInvitePayload,
  computeSoloResult,
  createEmptyScoreState,
  getGuessRoundQuestions,
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
          expect(result.sectionA.paragraphs[0]).not.toMatch(/\ba (Aries|Aquarius)\b/);

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

  it("builds non-empty share text referencing both signs, the score, and the about-you narrative", () => {
    const text = buildShareText(
      userSign,
      partnerSign,
      {
        score: 72,
        scoreTease: "Real potential, real friction.",
        chips: ["Steady flame", "Words first", "Direct in conflict"],
        sectionA: {
          paragraphs: [
            "<strong>Steady flame.</strong> You love hard without gripping hard. And you're a bold opener.",
            "second paragraph",
            "third paragraph",
          ],
          kicker: "kicker",
        },
      },
      "https://sparkread.netlify.app"
    );
    expect(text).toContain("Aries");
    expect(text).toContain("Scorpio");
    expect(text).toContain("72");
    expect(text).toContain("Steady flame");
    expect(text).toContain("You love hard without gripping hard. And you're a bold opener.");
    expect(text).not.toContain("<strong>");
    expect(text).toContain("https://sparkread.netlify.app");
  });

  it("builds an invite message carrying a base64 payload link", () => {
    const { message, link } = buildInviteMessage(userSign, partnerSign, [0, 1, 2], 72, 1, "pair-abc", "http://localhost:3000");
    expect(message).toContain(link);
    expect(link).toContain("http://localhost:3000/read?invite=");
  });

  it("uses round-0 framing for the first invite and round-N framing after", () => {
    const first = buildInviteMessage(userSign, partnerSign, [0, 1, 2], 72, 0, "pair-abc", "http://localhost:3000");
    expect(first.message).toContain("I took a Spark Read on us");

    const later = buildInviteMessage(userSign, partnerSign, [0, 1, 2], 72, 2, "pair-abc", "http://localhost:3000");
    expect(later.message).toContain("Round 3!");
    expect(later.message).not.toContain("I took a Spark Read on us");
  });

  it("round-trips the invite payload (including round and pairing id) through decodeInvitePayload", () => {
    const { link } = buildInviteMessage(userSign, partnerSign, [0, 1, 2], 72, 1, "pair-abc", "http://localhost:3000");
    const raw = new URL(link).searchParams.get("invite")!;
    const decoded = decodeInvitePayload(raw);
    expect(decoded).toEqual({ u: "Aries", p: "Scorpio", g: [0, 1, 2], s: 72, r: 1, pid: "pair-abc" });
  });

  it("defaults round to 0 and pairing id to null for older invite payloads that predate those fields", () => {
    const legacyPayload = btoa(JSON.stringify({ u: "Aries", p: "Scorpio", g: [0, 1, 2], s: 72 }));
    expect(decodeInvitePayload(legacyPayload)).toEqual({ u: "Aries", p: "Scorpio", g: [0, 1, 2], s: 72, r: 0, pid: null });
  });

  it("returns null for an invalid invite payload", () => {
    expect(decodeInvitePayload("not-valid-base64!!")).toBeNull();
  });
});

describe("GUESS_QS", () => {
  it("has exactly 10 rounds of 3 questions, each with 4 options", () => {
    expect(GUESS_QS).toHaveLength(30);
    expect(GUESS_QS.length % GUESS_ROUND_SIZE).toBe(0);
    GUESS_QS.forEach((q) => expect(q.o).toHaveLength(4));
  });

  it("keeps round 0 (the original 3 questions) exactly unchanged for backward compatibility", () => {
    expect(GUESS_QS.slice(0, 3)).toEqual([
      { q: "After a long week, they'd rather…", o: ["Go out and be around energy", "Stay in, just the two of you", "Have space to themselves first", "Talk through the whole week"] },
      { q: "If you two disagreed tonight, they would…", o: ["Say it straight, right away", "Cool off first, talk later", "Smooth it over quickly", "Turn it into a long conversation"] },
      { q: "Their idea of feeling loved is mostly…", o: ["Hearing it in words", "Your undivided time", "Things you do for them", "Physical closeness"] },
    ]);
  });

  it("has no duplicate question text across rounds", () => {
    const texts = GUESS_QS.map((q) => q.q);
    expect(new Set(texts).size).toBe(texts.length);
  });
});

describe("getGuessRoundQuestions", () => {
  it("returns round 0's questions for round 0", () => {
    expect(getGuessRoundQuestions(0)).toEqual(GUESS_QS.slice(0, 3));
  });

  it("returns a different 3 questions for each of the 10 rounds", () => {
    const rounds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => getGuessRoundQuestions(r));
    const allTexts = rounds.flatMap((r) => r.map((q) => q.q));
    expect(new Set(allTexts).size).toBe(30);
  });

  it("does NOT repeat round 0's exact questions once a pairing plays past round 9 — a literal repeat kills the surprise", () => {
    const round0 = getGuessRoundQuestions(0).map((q) => q.q);
    const round10 = getGuessRoundQuestions(10).map((q) => q.q);
    expect(round10).not.toEqual(round0);
  });

  it("keeps producing fresh groupings on later laps too, not just the second one", () => {
    const round10 = getGuessRoundQuestions(10).map((q) => q.q);
    const round20 = getGuessRoundQuestions(20).map((q) => q.q);
    expect(round20).not.toEqual(round10);
  });

  it("is still deterministic — the same round always returns the same questions", () => {
    expect(getGuessRoundQuestions(10)).toEqual(getGuessRoundQuestions(10));
    expect(getGuessRoundQuestions(24)).toEqual(getGuessRoundQuestions(24));
  });

  it("still only ever draws from the 30 authored questions, even past round 9", () => {
    const allQuestionTexts = new Set(GUESS_QS.map((q) => q.q));
    for (const r of [10, 11, 15, 19, 20, 23, 45]) {
      for (const q of getGuessRoundQuestions(r)) {
        expect(allQuestionTexts.has(q.q)).toBe(true);
      }
    }
  });

  it("never throws or goes out of bounds for large or negative round numbers", () => {
    expect(getGuessRoundQuestions(-3)).toHaveLength(3);
    expect(getGuessRoundQuestions(1000)).toHaveLength(3);
  });
});

describe("computeRoundResult", () => {
  it("marks every question correct when guesses match answers exactly", () => {
    const result = computeRoundResult(0, [0, 0, 0], [0, 0, 0]);
    expect(result.correctCount).toBe(3);
    expect(result.totalCount).toBe(3);
    result.questions.forEach((q) => {
      expect(q.correct).toBe(true);
      expect(q.guessLabel).toBe(q.answerLabel);
    });
  });

  it("marks every question wrong when no guess matches its answer", () => {
    const result = computeRoundResult(0, [0, 0, 0], [1, 1, 1]);
    expect(result.correctCount).toBe(0);
    result.questions.forEach((q) => expect(q.correct).toBe(false));
  });

  it("counts a mixed round correctly, question by question", () => {
    const result = computeRoundResult(0, [0, 1, 2], [0, 2, 3]);
    expect(result.correctCount).toBe(1);
    expect(result.questions[0].correct).toBe(true);
    expect(result.questions[1].correct).toBe(false);
    expect(result.questions[2].correct).toBe(false);
  });

  it("treats an unanswered (null) question as incorrect without throwing", () => {
    const result = computeRoundResult(0, [0, 0, 0], [null, 0, 0]);
    expect(result.questions[0].correct).toBe(false);
    expect(result.questions[0].answerLabel).toBeNull();
    expect(result.correctCount).toBe(2);
  });

  it("resolves question/guess/answer text that exactly matches GUESS_QS for a known round", () => {
    const result = computeRoundResult(0, [1, 2, 3], [2, 3, 0]);
    const round0 = GUESS_QS.slice(0, 3);
    result.questions.forEach((q, i) => {
      expect(q.question).toBe(round0[i].q);
      expect(q.guessLabel).toBe(round0[i].o[[1, 2, 3][i]]);
      expect(q.answerLabel).toBe(round0[i].o[[2, 3, 0][i]]);
    });
  });

  it("resolves cleanly for a cycle>0 (reshuffled) round without throwing", () => {
    const result = computeRoundResult(12, [0, 1, 2], [0, 1, 2]);
    expect(result.questions).toHaveLength(getGuessRoundQuestions(12).length);
    expect(result.round).toBe(12);
  });
});

describe("QUICK_QUESTION_INDICES", () => {
  it("references exactly 5 valid, unique indices into QUESTIONS", () => {
    expect(QUICK_QUESTION_INDICES).toHaveLength(5);
    expect(new Set(QUICK_QUESTION_INDICES).size).toBe(5);
    QUICK_QUESTION_INDICES.forEach((i) => expect(QUESTIONS[i]).toBeDefined());
  });
});
