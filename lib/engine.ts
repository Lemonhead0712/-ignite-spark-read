/**
 * Ignite "Spark Read" scoring engine.
 * Pure, framework-free port of the logic in ignite-prototype.html.
 * No DOM, no React — safe to reuse for the paired read (V2).
 *
 * Generated copy strings may contain `<strong>` markup (ported verbatim from the
 * prototype's innerHTML assembly) and are rendered via a trusted dangerouslySetInnerHTML
 * helper in the UI layer — none of the interpolated values are free-form user input.
 */

export type Element = "fire" | "earth" | "air" | "water";

export interface Sign {
  n: string;
  g: string;
  d: string;
  el: Element;
}

export type AttKey = "secure" | "anxious" | "avoidant";
export type LoveKey = "words" | "time" | "acts" | "touch" | "gifts";
export type ConKey = "direct" | "collab" | "avoidant" | "accommodating";

export interface ScoreState {
  att: Record<AttKey, number>;
  love: Record<LoveKey, number>;
  con: Record<ConKey, number>;
}

export function createEmptyScoreState(): ScoreState {
  return {
    att: { secure: 0, anxious: 0, avoidant: 0 },
    love: { words: 0, time: 0, acts: 0, touch: 0, gifts: 0 },
    con: { direct: 0, collab: 0, avoidant: 0, accommodating: 0 },
  };
}

interface WeightMap {
  att?: Partial<Record<AttKey, number>>;
  love?: Partial<Record<LoveKey, number>>;
  con?: Partial<Record<ConKey, number>>;
}

export interface QuestionOption {
  label: string;
  weights: WeightMap;
  cb: string | null;
}

export interface Question {
  q: string;
  o: QuestionOption[];
}

/* ================= SIGNS ================= */

// Trailing U+FE0E forces monochrome "text" presentation for these glyphs instead of
// platform-specific color emoji — without it, some platforms render a fixed-color
// emoji glyph that ignores our CSS `color` styling entirely (visible on Windows;
// reported as broken/inconsistent glyph colors on iOS too).
export const SIGNS: Sign[] = [
  { n: "Aries", g: "♈︎", d: "Mar 21–Apr 19", el: "fire" },
  { n: "Taurus", g: "♉︎", d: "Apr 20–May 20", el: "earth" },
  { n: "Gemini", g: "♊︎", d: "May 21–Jun 20", el: "air" },
  { n: "Cancer", g: "♋︎", d: "Jun 21–Jul 22", el: "water" },
  { n: "Leo", g: "♌︎", d: "Jul 23–Aug 22", el: "fire" },
  { n: "Virgo", g: "♍︎", d: "Aug 23–Sep 22", el: "earth" },
  { n: "Libra", g: "♎︎", d: "Sep 23–Oct 22", el: "air" },
  { n: "Scorpio", g: "♏︎", d: "Oct 23–Nov 21", el: "water" },
  { n: "Sagittarius", g: "♐︎", d: "Nov 22–Dec 21", el: "fire" },
  { n: "Capricorn", g: "♑︎", d: "Dec 22–Jan 19", el: "earth" },
  { n: "Aquarius", g: "♒︎", d: "Jan 20–Feb 18", el: "air" },
  { n: "Pisces", g: "♓︎", d: "Feb 19–Mar 20", el: "water" },
];

export const SIGN_DESC: Record<string, string> = {
  Aries: "First in line, first to fall, first to say it out loud. Aries doesn't do slow — they do NOW, with feeling.",
  Taurus: "Stubborn? Sure. But nobody loves more luxuriously — good food, soft blankets, and loyalty that doesn't blink.",
  Gemini: "Two moods, one heartbeat, endless conversation. Bore a Gemini and they're gone; fascinate them and they're yours.",
  Cancer: "The softest armor in the zodiac. Cancer remembers everything you said and exactly how you said it.",
  Leo: "Warm, radiant, and fully aware of it. Leo doesn't want your attention — they want your *devotion*. And they earn it.",
  Virgo: "Notices everything, says a fraction of it. Virgo's love language is fixing your life before you knew it was broken.",
  Libra: "Charm with a spine of steel. Libra will weigh every option — and still pick the beautiful one.",
  Scorpio: "Intense, private, all-or-nothing. Scorpio already knows your secrets. They're waiting to see if you'll tell them anyway.",
  Sagittarius: "Half philosopher, half flight risk. Catch a Sag's curiosity and the adventure never ends.",
  Capricorn: "Ambition in a tailored coat. Capricorn plays the long game in everything — including you.",
  Aquarius: "Loves humanity, confuses individuals. Crack an Aquarius open and you'll find the loyalist of the whole zodiac.",
  Pisces: "Feels your mood before you text it. Pisces doesn't fall in love — they dissolve into it.",
};

export const REACTS: Record<string, string> = {
  "fire-fire": "Two flames? Bold. Someone hide the matches.",
  "fire-air": "Oh, this pairing has *momentum*. Buckle up.",
  "fire-earth": "Fire and earth. Opposites? Sure. Boring? Never.",
  "fire-water": "Steam. Immediate steam. Interesting choice…",
  "earth-earth": "Two earth signs. Slow burn — the dangerous kind.",
  "earth-air": "Grounded meets restless. Okay, we're intrigued.",
  "earth-water": "Ooh — this combination has a *reputation*.",
  "air-air": "Two air signs? The conversation alone… whew.",
  "air-water": "Head meets heart. This is going to be good.",
  "water-water": "Two water signs. Say less. We already feel it.",
};

export const SIGN_TRAITS: Record<
  Element,
  { crave: string; conflict: string; love: string }
> = {
  fire: {
    crave: "momentum and open admiration — they want to feel like the main event, not the afterthought",
    conflict: "heat that burns fast and clears fast — let them flare, don't let it smolder",
    love: "bold, visible gestures. Subtlety is wasted on them, and honestly? They know it",
  },
  earth: {
    crave: "consistency they can set a clock by — flakiness is the fastest way to lose them",
    conflict: "room to cool down before the talk — push too soon and you'll meet the wall",
    love: "receipts. Showing up beats saying it, every single time",
  },
  air: {
    crave: "conversation that keeps surprising them — bore their mind and you've lost the rest",
    conflict: "talking it out, ideally tonight — your silence reads as a locked door",
    love: "words, wit, and the feeling of being mentally undressed",
  },
  water: {
    crave: "emotional safety before anything else — they're reading the room while you're still in the hallway",
    conflict: "reassurance first, resolution second — fix the feeling before the facts",
    love: "depth and privacy. The 2am confession means more than the public post",
  },
};

export const ELEMENT_PAIR: Record<string, string> = {
  "fire-fire": "two open flames — spectacular, a little dangerous, and neither of you brought a fire extinguisher",
  "fire-air": "air feeds fire — you escalate each other beautifully, in passion and in arguments. Choose wisely which",
  "fire-earth": "a steady hand meets an open flame — real friction, but when it balances, it *really* balances",
  "fire-water": "steam — undeniable chemistry with a standing risk that someone ends up doused",
  "earth-earth": "slow-built and stubborn in the best way — you two don't fall in love, you *construct* it",
  "earth-air": "grounded meets restless — magic when curiosity is shared, tension when the routines collide",
  "earth-water": "one of the most naturally nourishing pairings there is — water softens earth, earth holds water",
  "air-air": "endless conversation, shared freedom, and a genuinely open question about who ever lands the plane",
  "air-water": "logic meets feeling — the pairing that either grows you both up or wears you both out",
  "water-water": "deep, intuitive, practically telepathic — but two feelers still need at least one anchor",
};

const ELEMENT_ORDER: Element[] = ["fire", "earth", "air", "water"];
export function pairKey(a: Element, b: Element): string {
  return ELEMENT_ORDER.indexOf(a) <= ELEMENT_ORDER.indexOf(b) ? `${a}-${b}` : `${b}-${a}`;
}

/* ============ QUESTION BANK ============ */

export const QUESTIONS: Question[] = [
  {
    q: "Something's been bothering you in the relationship. You usually…",
    o: [
      { label: "Bring it up right away, plainly", weights: { con: { direct: 2 } }, cb: "You bring it up right away — no marinating, no mystery." },
      { label: "Wait for the right calm moment", weights: { con: { collab: 2 }, att: { secure: 1 } }, cb: "You wait for the calm moment — a strategist, even in feelings." },
      { label: "Let it go — most things resolve themselves", weights: { con: { avoidant: 2 }, att: { avoidant: 1 } }, cb: "You let things go and trust time to do the talking." },
      { label: "Go quiet and hope they notice", weights: { con: { accommodating: 2 }, att: { anxious: 1 } }, cb: "You go quiet and hope they notice. (They usually don't. Say the thing.)" },
    ],
  },
  {
    q: "Your favorite version of a great night together is…",
    o: [
      { label: "Deep conversation that goes til 2am", weights: { love: { words: 2 } }, cb: "Your perfect night is a conversation that forgets what time it is." },
      { label: "Doing absolutely nothing, together", weights: { love: { time: 2 } }, cb: "Your perfect night is doing nothing — together. That 'together' is the whole point." },
      { label: "Them handling something so you can exhale", weights: { love: { acts: 2 } }, cb: "Your idea of romance is someone quietly handling it so you can exhale." },
      { label: "Close, physical, no phones in sight", weights: { love: { touch: 2 } }, cb: "Your perfect night: close, physical, phones face-down and forgotten." },
    ],
  },
  {
    q: "They haven't texted back in a few hours. Honestly, you…",
    o: [
      { label: "Don't clock it — they're busy, so are you", weights: { att: { secure: 2 } }, cb: "A slow reply doesn't rattle you — busy is just busy." },
      { label: "Notice, and start rereading your last message", weights: { att: { anxious: 2 } }, cb: "You're the one who rereads the last text. We saw that." },
      { label: "Feel a little relieved to have space", weights: { att: { avoidant: 2 } }, cb: "A quiet phone feels like room to breathe — you said it yourself." },
      { label: "Send a casual follow-up to check the vibe", weights: { att: { anxious: 1 }, con: { direct: 1 } }, cb: "You send the casual follow-up — 'casual.' Sure." },
    ],
  },
  {
    q: "You feel most loved when your person…",
    o: [
      { label: "Tells you exactly what you mean to them", weights: { love: { words: 2 } }, cb: null },
      { label: "Clears their schedule just to be with you", weights: { love: { time: 2 } }, cb: null },
      { label: "Notices what you need before you ask", weights: { love: { acts: 2 } }, cb: null },
      { label: "Reaches for you — a hand, a pull-in, a hold", weights: { love: { touch: 2 } }, cb: null },
    ],
  },
  {
    q: "Mid-argument, your instinct is to…",
    o: [
      { label: "Say the hard thing now — clear air is worth it", weights: { con: { direct: 2 } }, cb: "Mid-argument, you say the hard thing out loud. Respect." },
      { label: "Find the compromise before it escalates", weights: { con: { collab: 2 } }, cb: "You hunt for the compromise before things escalate — built-in diplomacy." },
      { label: "Shut down — you'll talk when you're ready", weights: { con: { avoidant: 2 }, att: { avoidant: 1 } }, cb: "You shut down first and talk when YOU'RE ready — on your clock, always." },
      { label: "Smooth it over, even if you're still hurt", weights: { con: { accommodating: 2 }, att: { anxious: 1 } }, cb: "You smooth it over while still hurting. We're keeping an eye on that one." },
    ],
  },
  {
    q: "Being fully known by someone feels…",
    o: [
      { label: "Like the whole point", weights: { att: { secure: 2 } }, cb: "Being fully known, to you, is the whole point. That's rarer than it sounds." },
      { label: "Amazing — and a little terrifying to lose", weights: { att: { anxious: 2 } }, cb: "Being fully known thrills you — and quietly terrifies you to lose." },
      { label: "Good in doses; you keep a room to yourself", weights: { att: { avoidant: 2 } }, cb: "You keep a room to yourself, even in love. The right one knocks." },
      { label: "Like something you're still learning to allow", weights: { att: { anxious: 1, avoidant: 1 } }, cb: "Being fully known is something you're still learning to allow. Honest answer. Good sign." },
    ],
  },
  {
    q: "A gift from a partner lands best when it's…",
    o: [
      { label: "Proof they listen — the specific thing you mentioned once", weights: { love: { gifts: 2 } }, cb: "For you, the perfect gift is proof of listening — the thing you mentioned once, weeks ago." },
      { label: "Time, not things — an experience together", weights: { love: { time: 2 } }, cb: null },
      { label: "Practical — they solved something for you", weights: { love: { acts: 2 } }, cb: null },
      { label: "Honestly, you'd trade every gift for a real love letter", weights: { love: { words: 2 } }, cb: "You'd trade every gift for one real love letter. Noted, and honestly? Devastating." },
    ],
  },
  {
    q: "When your person is upset with you, you first need to know…",
    o: [
      { label: "Exactly what happened, plainly", weights: { con: { direct: 2 }, att: { secure: 1 } }, cb: null },
      { label: "That you two are still okay", weights: { att: { anxious: 2 } }, cb: "When they're upset, your first need is knowing you two are still okay. Everything else can wait." },
      { label: "That you can take a breath before diving in", weights: { att: { avoidant: 1 }, con: { avoidant: 1 } }, cb: null },
      { label: "What they need from you to fix it", weights: { con: { accommodating: 1 }, love: { acts: 1 } }, cb: null },
    ],
  },
  {
    q: "Affection in public — your comfort level is…",
    o: [
      { label: "Full send. Hold my hand, kiss me at the bar", weights: { love: { touch: 2 } }, cb: "Public affection? Full send, your words. Kiss at the bar and all." },
      { label: "Warm but subtle — a hand at the back says enough", weights: { love: { touch: 1 }, att: { secure: 1 } }, cb: null },
      { label: "Prefer to keep it private; it's ours", weights: { att: { avoidant: 1 } }, cb: "You keep affection private — 'it's ours.' A vault, romantically speaking." },
      { label: "Depends entirely on how secure things feel that day", weights: { att: { anxious: 2 } }, cb: "Your PDA meter runs on how secure things feel that day. That's data, not a flaw." },
    ],
  },
  {
    q: "The relationship habit you secretly value most:",
    o: [
      { label: "Debriefing the whole day together", weights: { love: { words: 1, time: 1 } }, cb: "Your secret favorite ritual: the nightly debrief. The day isn't over until it's told." },
      { label: "Rituals — same coffee order, same Sunday", weights: { love: { time: 1 }, att: { secure: 1 } }, cb: "Same coffee order, same Sunday — you fall in love through rituals." },
      { label: "Each doing your own thing, then coming home", weights: { att: { avoidant: 1, secure: 1 } }, cb: "Your ideal: separate orbits, shared home. Independence as a love language." },
      { label: "Constant little check-ins throughout the day", weights: { att: { anxious: 1 }, love: { words: 1 } }, cb: "The all-day check-in texts? That's your heartbeat made visible." },
    ],
  },
];

/**
 * Indices into QUESTIONS for the 5-question "quick read" — a curated subset
 * kept in sync with the full bank (no separate content to drift). Chosen for
 * balanced signal: 2 attachment, 2 love-language (covering all 5 love-language
 * options between them), 1 conflict-style — attachment and love language carry
 * the most result-copy weight, so they get the extra question.
 */
export const QUICK_QUESTION_INDICES = [0, 1, 2, 5, 6];

/* ============ RESULT COPY ============ */

export const ATT_COPY: Record<AttKey, [string, string]> = {
  secure: ["Steady flame", "You love hard without gripping hard — rare, and don't think people haven't noticed. You're the one everyone else calibrates to, the person who makes 'we're fine' actually mean fine."],
  anxious: ["Open flame", "You love out loud and feel everything in HD. Your radar for the slightest shift in closeness is exquisitely tuned — occasionally a notch past what's actually happening, but hey, at least you'll never be accused of not paying attention."],
  avoidant: ["Banked ember", "You run warm but guarded — closeness on your terms, on your timeline. That room you keep to yourself isn't coldness. It's the pilot light. The right person learns to knock, not barge."],
};

export const LOVE_COPY: Record<LoveKey, string> = {
  words: "You fall for the person who says it out loud. Texts that end in a period? You noticed. You always notice. For you, love unspoken is love unfinished.",
  time: "Presence is your whole currency. You'd trade every grand gesture for one afternoon of someone's undivided attention — phone face-down, nowhere else to be.",
  acts: "You read love in behavior, not speeches. The noticing, the handling, the quiet showing up — that's the love letter. Talk is nice; done is better.",
  touch: "You're wired for closeness you can feel. A hand finding yours under the table says more to you than a paragraph ever could. Warmth is the language; everything else is subtitles.",
  gifts: "You feel loved through proof-of-listening — the exact thing you mentioned once, in passing, three weeks ago. It was never about the price tag. It's that they kept the receipt of the conversation.",
};

export const CON_COPY: Record<ConKey, string> = {
  direct: "In a fight, you walk toward the fire. You'd rather have one hard conversation than a month of quiet resentment — and honestly, you're right.",
  collab: "In conflict you're the bridge-builder — instinctively hunting for the version where nobody loses. It's a gift. Just make sure 'nobody loses' includes you.",
  avoidant: "In conflict you pull back first — you process alone before you can process together. Not everyone gets that. The right one will.",
  accommodating: "You give ground to keep the peace — generous, warm, and worth watching. Peace you paid for with swallowed hurt isn't peace. It's an invoice with a due date.",
};

export const DYNAMIC_COPY: Record<AttKey, string> = {
  secure: "Here's your superpower: steadiness makes people braver. Partners open up faster next to someone who isn't keeping score — and they rarely realize you're the reason.",
  anxious: "One thing worth saying to them out loud: your reassurance-seeking is love, not doubt. Most partners can't tell the difference until you translate. Translate.",
  avoidant: "Fair warning: they're probably wondering where they stand more than they let on. You already feel the warm thing — try narrating it occasionally. Small words, big unlock.",
};

export const ATT_BLEND: Record<string, [string, string]> = {
  "secure-anxious": ["Steady flame, anxious flicker", "Mostly steady — but when it matters, your radar switches to high alert. You hold the line and check it twice."],
  "secure-avoidant": ["Steady flame, guarded edges", "Grounded and calm, with a door you keep politely closed. Not everyone gets the full tour, and that's a feature."],
  "anxious-avoidant": ["Push-pull flame", "You want closeness AND the exit row. Reaching in, pulling back — the honest name for it is 'still deciding how safe this is.' Fair."],
  "anxious-secure": ["Open flame, learning steady", "You feel everything loudly, but there's real ground under it. The alarm goes off; increasingly, you check before you run."],
  "avoidant-secure": ["Banked ember, warm core", "Self-contained on the surface, surprisingly solid underneath. You don't need much — but what you give, you mean."],
  "avoidant-anxious": ["Push-pull flame", "Space when they're close, longing when they're far. The distance isn't indifference — it's a thermostat you're still calibrating."],
};

export const CON_BLEND: Record<string, string> = {
  "direct-collab": "You say the hard thing, but you say it building toward a fix — a rare combo of blunt and constructive.",
  "collab-direct": "Diplomat first, but you won't bury the truth to keep the peace. The compromise has to be real.",
  "avoidant-accommodating": "You retreat AND you appease — which means resentment has two places to hide. Watch both doors.",
  "accommodating-avoidant": "You retreat AND you appease — which means resentment has two places to hide. Watch both doors.",
  "direct-avoidant": "You either say it immediately or not at all — no middle gear. Your partner learns to read which mode arrived.",
  "avoidant-direct": "You either say it immediately or not at all — no middle gear. Your partner learns to read which mode arrived.",
};

export const ELEMENT_FLAVOR: Record<Element, (sign: string) => string> = {
  fire: (sign) => `And it all runs at ${sign} voltage — whatever you feel, you feel it at full brightness, and the room usually knows.`,
  earth: (sign) => `All of it delivered ${sign}-style: quietly, consistently, and with receipts. You don't perform your feelings — you build with them.`,
  air: (sign) => `Filtered through that ${sign} mind, of course — you feel it, then you *narrate* it. Everything gets thought about twice and said beautifully once.`,
  water: (sign) => `And being a ${sign}, all of it runs deep — you don't just have feelings, you have a whole underwater weather system. The surface rarely tells the full story.`,
};

function indefiniteArticle(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

export const SIGN_ATT_BRIDGE: Record<Element, Record<AttKey, (sign: string) => string>> = {
  fire: {
    secure: (sign) => `${indefiniteArticle(sign)} ${sign} with actual ground under all that fire — the rarest kind`,
    anxious: (sign) => `${indefiniteArticle(sign)} ${sign}, so even your worrying burns bright`,
    avoidant: (sign) => `${indefiniteArticle(sign)} ${sign} who guards the flame instead of flaunting it — interesting`,
  },
  earth: {
    secure: (sign) => `textbook ${sign}: solid, and solidly loved for it`,
    anxious: (sign) => `${indefiniteArticle(sign)} ${sign} with a restless current under the calm surface — people miss it, we didn't`,
    avoidant: (sign) => `${indefiniteArticle(sign)} ${sign} doing what ${sign}s do — building walls with excellent craftsmanship`,
  },
  air: {
    secure: (sign) => `${indefiniteArticle(sign)} ${sign} who actually landed the plane — impressive`,
    anxious: (sign) => `${indefiniteArticle(sign)} ${sign}, which means your worries come fully narrated`,
    avoidant: (sign) => `${indefiniteArticle(sign)} ${sign} who keeps love at conversational distance — close enough to be brilliant, far enough to be safe`,
  },
  water: {
    secure: (sign) => `${indefiniteArticle(sign)} ${sign} with depth AND stability — an anchored ocean`,
    anxious: (sign) => `${indefiniteArticle(sign)} ${sign}, so the feelings were never going to be small`,
    avoidant: (sign) => `${indefiniteArticle(sign)} ${sign} in a diving bell — deep waters, sealed hatch`,
  },
};

export const EL_LOVE_DEFAULT: Record<Element, LoveKey> = { fire: "touch", earth: "acts", air: "words", water: "time" };
export const EL_CON_NEED: Record<Element, string> = {
  fire: "heat that clears fast — let them flare, don't smolder",
  earth: "cool-down room before the talk",
  air: "talking it out tonight, not tomorrow",
  water: "reassurance before resolution",
};

export const KICKERS = {
  you: [
    "Self-awareness is the most underrated flirt.",
    "Know thyself — it saves everyone a lot of decoding.",
    "You just handed yourself the cheat codes.",
  ],
  them: [
    "Chemistry starts the fire. This is how you keep the house.",
    "Knowing what they crave before they say it? That's the whole game.",
    "Consider this a head start most people never get.",
  ],
};

export const LOVE_LABEL: Record<LoveKey, string> = { words: "Words of affirmation", time: "Quality time", acts: "Acts of care", touch: "Physical touch", gifts: "Thoughtful tokens" };
export const CON_LABEL: Record<ConKey, string> = { direct: "Direct", collab: "Collaborative", avoidant: "Needs space first", accommodating: "Peacekeeper" };
export const ATT_LABEL: Record<AttKey, string> = { secure: "Steady flame", anxious: "Open flame", avoidant: "Banked ember" };

/* ================= STATE HELPERS ================= */

export function applyWeights(state: ScoreState, w: WeightMap): ScoreState {
  const next: ScoreState = {
    att: { ...state.att },
    love: { ...state.love },
    con: { ...state.con },
  };
  (Object.keys(w) as (keyof WeightMap)[]).forEach((dim) => {
    const dimWeights = w[dim];
    if (!dimWeights) return;
    Object.entries(dimWeights).forEach(([k, v]) => {
      (next[dim] as Record<string, number>)[k] += v as number;
    });
  });
  return next;
}

export function topKey<T extends string>(obj: Record<T, number>): T {
  return (Object.entries(obj) as [T, number][]).sort((a, b) => b[1] - a[1])[0][0];
}

export interface TopTwoResult<T extends string> {
  k1: T;
  v1: number;
  k2: T;
  v2: number;
  blended: boolean;
}

export function topTwo<T extends string>(obj: Record<T, number>): TopTwoResult<T> {
  const e = (Object.entries(obj) as [T, number][]).sort((a, b) => b[1] - a[1]);
  return { k1: e[0][0], v1: e[0][1], k2: e[1][0], v2: e[1][1], blended: e[0][1] - e[1][1] <= 1 && e[1][1] > 0 };
}

export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function signIndex(sign: Sign): number {
  return SIGNS.findIndex((x) => x.n === sign.n);
}

function pickDeterministic(arr: string[], userSign: Sign): string {
  return arr[signIndex(userSign) % arr.length];
}

/* ================= SPARK SCORE ================= */

export const PAIR_BASE: Record<string, number> = {
  "fire-fire": 78,
  "fire-air": 86,
  "fire-earth": 62,
  "fire-water": 68,
  "earth-earth": 74,
  "earth-air": 60,
  "earth-water": 88,
  "air-air": 80,
  "air-water": 66,
  "water-water": 76,
};

export function computeScore(userSign: Sign, partnerSign: Sign, att: AttKey, con: ConKey): number {
  let s = PAIR_BASE[pairKey(userSign.el, partnerSign.el)];
  if (att === "secure") s += 6;
  if (att === "anxious") s -= 2;
  if (att === "avoidant") s -= 3;
  if (con === "collab") s += 5;
  if (con === "direct") s += 2;
  if (con === "avoidant") s -= 4;
  if (con === "accommodating") s -= 1;
  s += ((signIndex(userSign) + signIndex(partnerSign)) % 5) - 2;
  return Math.max(38, Math.min(97, s));
}

export function scoreTease(score: number): string {
  if (score >= 80) return "High heat. The full story of why? That's written on their side of the read.";
  if (score >= 65) return "Real potential, real friction — the interesting half of this number is theirs to unlock.";
  return "Challenging on paper — which is exactly when the real comparison gets juicy.";
}

/* ================= SOLO RESULT ================= */

export interface SoloResultData {
  score: number;
  scoreTease: string;
  chips: [string, string, string];
  attKey: AttKey;
  loveKey: LoveKey;
  conKey: ConKey;
  sectionA: { paragraphs: [string, string, string]; kicker: string };
  sectionB: { paragraphs: [string, string, string, string, string]; kicker: string };
}

export function computeSoloResult(userSign: Sign, partnerSign: Sign, S: ScoreState, sigAnswers: string[]): SoloResultData {
  const att = topTwo(S.att);
  const love = topTwo(S.love);
  const con = topTwo(S.con);

  const score = computeScore(userSign, partnerSign, att.k1, con.k1);

  const attBlend = att.blended ? ATT_BLEND[`${att.k1}-${att.k2}`] : undefined;
  const attLabel = attBlend ? attBlend[0] : ATT_COPY[att.k1][0];
  const attBody = attBlend ? attBlend[1] : ATT_COPY[att.k1][1];
  const loveLabel = love.blended ? `${cap(love.k1)} + ${love.k2} hybrid` : `${cap(love.k1)} first`;
  const conBlendLine = con.blended ? CON_BLEND[`${con.k1}-${con.k2}`] : undefined;

  const chips: [string, string, string] = [attLabel, loveLabel, `${cap(con.k1)} in conflict`];

  const loveLine = love.blended
    ? `${LOVE_COPY[love.k1]} Though it's close — ${love.k2} runs right behind it. You're bilingual in love, which is either efficient or exhausting. Probably both.`
    : LOVE_COPY[love.k1];
  const conLine = conBlendLine || CON_COPY[con.k1];
  const bridge = SIGN_ATT_BRIDGE[userSign.el][att.k1](userSign.n);
  const cb = sigAnswers.length ? ` ${sigAnswers[0]}` : "";

  const sectionA: SoloResultData["sectionA"] = {
    paragraphs: [
      `<strong>${attLabel}.</strong> ${attBody} And you're ${bridge}.`,
      `${loveLine}${cb}`,
      `${conLine} ${ELEMENT_FLAVOR[userSign.el](userSign.n)}`,
    ],
    kicker: pickDeterministic(KICKERS.you, userSign),
  };

  const pt = SIGN_TRAITS[partnerSign.el];
  const pair = ELEMENT_PAIR[pairKey(userSign.el, partnerSign.el)];
  const theirLove = EL_LOVE_DEFAULT[partnerSign.el];
  const loveCross =
    love.k1 === theirLove
      ? `Here's the good news: you crave <strong>${LOVE_LABEL[love.k1].toLowerCase()}</strong> — and that's exactly the language ${partnerSign.n}s tend to speak natively. Affection should land with almost no translation loss.`
      : `Now the interesting part: you told us you're fed by <strong>${LOVE_LABEL[love.k1].toLowerCase()}</strong>, but ${partnerSign.n}s tend to show love through <strong>${LOVE_LABEL[theirLove].toLowerCase()}</strong>. That's not incompatibility — it's a translation gap. Learn to read their dialect and teach them yours; that's the whole assignment.`;

  const conStyleClause =
    con.k1 === "direct" ? "straight at it" : con.k1 === "collab" ? "building toward the fix" : con.k1 === "avoidant" ? "retreating first" : "smoothing it over";
  let conCollision: string;
  if (con.k1 === "direct" && partnerSign.el === "earth") {
    conCollision = "Your \"let's talk NOW\" will hit their \"not yet\" wall — give it an hour and you'll get a real conversation instead of a standoff.";
  } else if (con.k1 === "avoidant" && partnerSign.el === "air") {
    conCollision = "Your silence will read to them as a locked door. Leave a note on it — even \"later, I promise\" counts.";
  } else if (con.k1 === "avoidant" && partnerSign.el === "fire") {
    conCollision = "Your retreat may make their flare burn hotter before it clears. A time-stamp (\"we'll talk at 8\") keeps the fire contained.";
  } else if (con.k1 === "accommodating" && partnerSign.el === "water") {
    conCollision = "Careful: you'll both prioritize the feeling over the fix — sweet, until nothing ever actually gets resolved.";
  } else if (con.k1 === "direct" && partnerSign.el === "water") {
    conCollision = "Lead with the reassurance before the facts — \"we're fine, AND we need to talk\" changes everything for them.";
  } else {
    conCollision = "Play to that and most fights shrink before they start.";
  }
  const conCross = `And given how you fight — ${conStyleClause} — know that their sign usually needs <strong>${EL_CON_NEED[partnerSign.el]}</strong>. ${conCollision}`;

  const sectionB: SoloResultData["sectionB"] = {
    paragraphs: [
      `As a ${partnerSign.n}, they tend to crave <strong>${pt.crave}</strong>.`,
      loveCross,
      conCross,
      `Between your elements, this reads as <strong>${pair}</strong>.`,
      DYNAMIC_COPY[att.k1],
    ],
    kicker: pickDeterministic(KICKERS.them, userSign),
  };

  return {
    score,
    scoreTease: scoreTease(score),
    chips,
    attKey: att.k1,
    loveKey: love.k1,
    conKey: con.k1,
    sectionA,
    sectionB,
  };
}

/* ================= SHARE / INVITE ================= */

function stripTags(html: string): string {
  return html.replace(/<\/?[^>]+>/g, "");
}

export function buildShareText(
  userSign: Sign,
  partnerSign: Sign,
  result: Pick<SoloResultData, "score" | "scoreTease" | "chips" | "sectionA">,
  origin: string
): string {
  const [attLabel, loveLabel, conLabel] = result.chips;
  const about = stripTags(result.sectionA.paragraphs[0]);
  const crave = SIGN_TRAITS[partnerSign.el].crave.split(" — ")[0];
  return `🔥 My Ignite Spark Read\n${userSign.n} × ${partnerSign.n} — ${result.score}/100\n"${result.scoreTease}"\n\nABOUT ME · ${attLabel} · ${loveLabel} · ${conLabel}\n${about}\n\nThe read on them: a ${partnerSign.n} who craves ${crave}.\n\nTwo minutes, zero mercy — get your own read → ${origin}`;
}

export interface GuessQuestion {
  q: string;
  o: string[];
}

/**
 * 10 rounds of 3 questions each. Round 0 (the first 3) must stay word-for-word
 * unchanged — invite links already in the wild encode only answer *indices*
 * against these exact questions/options, not the text itself, so reordering
 * or rewording round 0 would make old links show wrong comparisons.
 */
export const GUESS_QS: GuessQuestion[] = [
  // round 0
  { q: "After a long week, they'd rather…", o: ["Go out and be around energy", "Stay in, just the two of you", "Have space to themselves first", "Talk through the whole week"] },
  { q: "If you two disagreed tonight, they would…", o: ["Say it straight, right away", "Cool off first, talk later", "Smooth it over quickly", "Turn it into a long conversation"] },
  { q: "Their idea of feeling loved is mostly…", o: ["Hearing it in words", "Your undivided time", "Things you do for them", "Physical closeness"] },
  // round 1
  { q: "When something good happens, they immediately want to…", o: ["Call or text you before anyone else", "Wait to tell you in person", "Post about it before telling most people", "Sit with it privately first, share later"] },
  { q: "Their biggest ick in a partner is…", o: ["Being flaky or unreliable", "Oversharing with everyone but them", "Being negative or complaining constantly", "Playing games instead of being direct"] },
  { q: "If you surprised them with a spontaneous trip, they'd…", o: ["Be thrilled, bags packed in ten minutes", "Love it but need a day to mentally prep", "Ask a dozen logistics questions first", "Secretly wish you'd asked before booking"] },
  // round 2
  { q: "Their honest first instinct meeting your friends is…", o: ["Charm the whole room immediately", "Warm up slowly, one person at a time", "Quietly observe before saying much", "Feel a little nervous, hide it well"] },
  { q: "When they're stressed, what actually helps is…", o: ["Being asked what they need, directly", "Someone just sitting with them, no fixing", "Space to sort it out solo, then talk", "Distraction — humor, a show, anything else"] },
  { q: "Their money instinct leans…", o: ["Spend on experiences, worry later", "Save first, splurge occasionally", "Track every dollar, no surprises", "Generous with others, frugal with themselves"] },
  // round 3
  { q: "The compliment that actually lands for them is…", o: ["That they're smart or good at something", "That they're easy to be around", "That they're attractive or magnetic", "That they made someone's day better"] },
  { q: "Their sense of humor runs…", o: ["Dry, deadpan, blink-and-you-miss-it", "Loud, chaotic, full commitment to the bit", "Witty wordplay, puns they're proud of", "Dark and a little unhinged, honestly"] },
  { q: "If you two hadn't talked all day, by evening they're…", o: ["Not thinking about it at all", "Wondering, but won't be the one to text first", "Already sent three check-in texts", "Assuming you need space and giving it"] },
  // round 4
  { q: "Their idea of a perfect Sunday is…", o: ["Fully planned — brunch, errands, a plan", "Zero plans, whatever the day brings", "Productive — cleaning, prepping the week", "Horizontal, phone off, doing nothing at all"] },
  { q: "When they mess up, they…", o: ["Own it immediately, no excuses", "Need a minute before they can admit it", "Apologize by doing something, not saying it", "Get defensive first, come around later"] },
  { q: "What they'd never say out loud but definitely think is…", o: ["They're a little more jealous than they let on", "They overthink texts way more than they admit", "They need more reassurance than they ask for", "They're pickier than they let on about small things"] },
  // round 5
  { q: "When someone compliments them, they usually…", o: ["Own it — thank you, I know", "Deflect it with a joke", "Get a little awkward and change the subject", "Immediately compliment them back"] },
  { q: "After a big win, their instinct is to…", o: ["Celebrate loud, tell everyone", "Treat themselves quietly, just for them", "Share the news with you first", "Downplay it and move on"] },
  { q: "As a texter, they're…", o: ["Instant replies, always on it", "Whenever they get to it — no rush", "Voice notes over typing, every time", "Would rather just call you"] },
  // round 6
  { q: "Caught being wrong mid-argument, they…", o: ["Admit it fast — no ego about it", "Need a minute before they can say it", "Deflect with a joke first", "Go quiet, come around later"] },
  { q: "An unexpected free day, and they'd…", o: ["Plan something spontaneous, last minute", "Finally catch up on everything undone", "Call up friends, get out of the house", "Do absolutely nothing — that's the whole plan"] },
  { q: "In friendships, their love language is…", o: ["The exact same as romantically", "Way more acts of service", "Way more quality time", "Totally different — playful, low-pressure"] },
  // round 7
  { q: "Bored on a random Tuesday night, they'd rather…", o: ["Try a new recipe or activity", "Rewatch a comfort show", "Call someone up — need people energy", "Read, journal, be alone with their thoughts"] },
  { q: "What actually stresses them out in a relationship is…", o: ["Feeling misunderstood", "Losing their independence", "Inconsistency — hot and cold", "Conflict getting avoided instead of solved"] },
  { q: "Their ideal vacation is…", o: ["Beach, book, do-nothing energy", "Hiking, adventure, get lost a little", "A new city, museums, way too much walking", "Somewhere familiar and cozy — no surprises"] },
  // round 8
  { q: "Missing you, they'd rather…", o: ["Send a random photo that reminded them of you", "Text 'thinking of you' out of nowhere", "Plan a surprise for when you're back", "Just show up — no warning needed"] },
  { q: "Their communication pet peeve is…", o: ["Being left on read", "One-word answers", "Over-explaining the obvious", "Mixed signals — say one thing, do another"] },
  { q: "After a mistake, what they actually need is…", o: ["Reassurance it's not a big deal", "Space to process before talking", "Help actually fixing it", "Someone to vent to, no advice needed"] },
  // round 9
  { q: "Plans change last minute, and they…", o: ["Roll with it, genuinely fine", "Mildly annoyed but adjust quickly", "Need a beat to reset their head", "Really struggle to shift gears"] },
  { q: "One word for their ideal partner:", o: ["Reliable", "Exciting", "Understanding", "Honest"] },
  { q: "Silence in a conversation, for them, is…", o: ["Totally comfortable — no need to fill it", "Something they instinctively fill", "Something they read into", "Actually kind of peaceful"] },
];

export const GUESS_ROUND_SIZE = 3;

// Deterministic PRNG (mulberry32) seeded from a string, so the same seed always
// produces the same shuffle — needed so every device viewing the same round
// number (sender guessing, recipient answering for real) sees the same questions.
function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) | 0;
  const next = () => {
    h |= 0;
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * The first pass through all 5 rounds (round 0-4) is fixed, in authored order —
 * round 0 must stay literally unchanged for backward compatibility with invite
 * links already sent. Once a pairing plays past round 4, instead of looping back
 * to round 0's exact content (which read as a dead giveaway repeat and killed the
 * "what's next" suspense), each subsequent lap through the bank is a fresh,
 * deterministic reshuffle of all 15 questions — so round 5 is a genuinely
 * different grouping than round 0, round 10 different again, and so on.
 */
export function getGuessRoundQuestions(round: number): GuessQuestion[] {
  const totalRounds = Math.floor(GUESS_QS.length / GUESS_ROUND_SIZE);
  const safeRound = round < 0 ? (round % totalRounds) + totalRounds : round;
  const cycle = Math.floor(safeRound / totalRounds);
  const posInCycle = safeRound % totalRounds;
  const start = posInCycle * GUESS_ROUND_SIZE;

  const order = cycle === 0 ? GUESS_QS.map((_, i) => i) : seededShuffle(GUESS_QS.map((_, i) => i), `guess-cycle-${cycle}`);
  return order.slice(start, start + GUESS_ROUND_SIZE).map((i) => GUESS_QS[i]);
}

export function buildInviteMessage(
  userSign: Sign,
  partnerSign: Sign,
  guesses: number[],
  sparkScore: number,
  round: number,
  pairingId: string,
  origin: string
): { message: string; link: string } {
  const payload = btoa(JSON.stringify({ u: userSign.n, p: partnerSign.n, g: guesses, s: sparkScore, r: round, pid: pairingId }));
  const link = `${origin}/read?invite=${payload}`;
  const message =
    round === 0
      ? `I took a Spark Read on us (${userSign.n} × ${partnerSign.n} — we scored ${sparkScore}) and sealed 3 guesses about you. Take yours and unlock them → ${link}`
      : `Round ${round + 1}! I sealed 3 fresh guesses about you — think you know me as well? Take yours and unlock them → ${link}`;
  return { message, link };
}

export interface InvitePayload {
  u: string;
  p: string;
  g: number[];
  s: number;
  r: number;
  pid: string | null;
}

export function decodeInvitePayload(raw: string): InvitePayload | null {
  try {
    const data = JSON.parse(atob(raw));
    if (typeof data?.u === "string" && typeof data?.p === "string" && typeof data?.s === "number" && Array.isArray(data?.g)) {
      return {
        u: data.u,
        p: data.p,
        g: data.g,
        s: data.s,
        r: typeof data?.r === "number" ? data.r : 0,
        pid: typeof data?.pid === "string" ? data.pid : null,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/* ================= PAIRED READ SEAM (V2 — not used in solo UI) ================= */

export interface SimPartnerProfile {
  att: AttKey;
  love: LoveKey;
  con: ConKey;
  answers: [number, number, number];
}

/**
 * Deterministic partner simulation used by the V1 paired-read demo.
 * V2 replaces this with real partner quiz data behind the same interface.
 */
export function simPartner(partnerSign: Sign): SimPartnerProfile {
  const idx = signIndex(partnerSign);
  const atts: AttKey[] = ["secure", "anxious", "avoidant"];
  const cons: ConKey[] = ["direct", "collab", "avoidant", "accommodating"];
  return {
    att: atts[idx % 3],
    love: EL_LOVE_DEFAULT[partnerSign.el],
    con: cons[(idx + 1) % 4],
    answers: [idx % 4, (idx + 2) % 4, (idx + 1) % 4],
  };
}
