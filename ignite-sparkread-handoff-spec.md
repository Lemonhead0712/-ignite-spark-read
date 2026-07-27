# Ignite "Spark Read" — Production Build Handoff Spec

**For:** Claude Code, building the production Next.js app
**Companion file:** `ignite-prototype.html` — a complete, working reference implementation. When this document and the prototype disagree, the prototype wins. All copy, logic, timings, and design tokens can be lifted directly from it.
**Supersedes:** `ignite-compatibility-quiz-spec.md` and `ignite-full-application-spec.md` (both outdated — discard).

---

## 1. Product Summary

Ignite is a fast, light, playful-flirty zodiac compatibility web app. Core mechanic: **Spark Read** — the user answers 10 questions about *themselves*, and the app produces (a) a personality portrait of them and (b) a pattern-based prediction of their partner's dynamic, blending relationship psychology with zodiac framing.

- Voice: playful-flirty with wisdom underneath. Teasing, winking, quotable. Never clinical, never heavy.
- Anonymous, no login. Solo experience entirely free. Premium = partner invite + paired comparison + question packs.
- Old Chemistry Type system and five-tab structure: retired entirely.
- Sun sign only (no rising/moon in V1).

## 2. Stack & Platform

- Next.js / TypeScript / Tailwind (owner's standard stack)
- **Web-first launch.** Build as installable PWA. Native deferred.
- No backend required for solo V1 except: hosting, analytics, and (fast-follow) invite-link session pairing + payments.

## 3. Design System (lift tokens from prototype `:root`)

- Palette: night `#1A0F1E`, card `#2B1830`, ember gradient `#FF6B4A→#FFB347`, rose `#E8A0B4`/`#D97A96`, ivory `#F5EDE6`
- **Identity system (app-wide):** You = ember, Them = rose. Applies to sign picker steps, interstitial glyphs, pairline, guess rows, paired comparison columns, duo header cards.
- Type: Instrument Serif (display, incl. score numerals and question text) + Outfit (UI/body). Type scale + spacing rhythm defined as CSS vars in prototype.
- Motion: soft blur-in glyphs, staggered `softUp` fades, dissolve transitions, animated score ring count-up, ignition orbit animation (two glyphs drift together + flare). Respect `prefers-reduced-motion`.

## 4. Screens (13 total — flow order)

1. **Landing** — hero: "Know what they want, *without asking.*" Meta: 2 minutes / No sign-up / Free. Single CTA.
2. **Sign picker (You)** — 12-sign glyph grid, ember selection tint, "Step 1 of 2 · You".
3. **Interstitial 1** — user's glyph breathes in + "{Sign} — noted." + per-sign flirty blurb (SIGN_DESC, 12 entries) + button "Next — who's on your mind?" (user-paced, not timed).
4. **Sign picker (Them)** — same grid re-themed rose, "Step 2 of 2 · Them", sub: "Partner, situationship, the one you keep almost-texting. We don't judge."
5. **Interstitial 2** — their glyph in rose + element-pair reaction line (REACTS, 10 entries) + their sign blurb + "Ten questions. Two minutes. Zero mercy." + Continue button.
6. **Quiz** — 10 questions, one per screen, progress bar, 4 options each.
7. **Ignition** — orbit animation, rotating status lines, ~2.6s, auto-advances to results.
8. **Solo Result** — pairline, Spark Score ring, Section A "About you", Section B "Their likely dynamic", Guess Mode entry, share + retake actions.
9. **Guess Mode** — 3 questions, "How would THEY answer?" (GUESS_QS).
10. **Sealed** — lock moment, "Sealed. No takebacks.", copy-invite + paired-preview (demo) + back.
11. **Paired Read** — duo identity header, True Spark Score with delta line vs solo score, guess reveal cards (✓/✕ + hits verdict), side-by-side profile table, confirmed dynamic, "The fine print of you two" (click/clash lists), packs entry. V1 ships this as clearly-labeled demo w/ simulated partner; V2 swaps in real data, same UI.
12. **Packs browser** — 3 packs: 🔥 First Fight, ✈️ Long Distance, 🔑 Moving In (5 questions each, full content in prototype PACKS array).
13. **Pack player + Pack results** — answer-for-answer comparison, "✓ Same page" / "◇ Different pages — talk about this one", match-count kicker.

## 5. Scoring Engine (the core IP — port exactly)

### 5.1 Dimensions & weighting
Three dimensions scored from the 10-question bank (QUESTIONS array):
- **att**: secure / anxious / avoidant
- **love**: words / time / acts / touch / gifts
- **con**: direct / collab / avoidant / accommodating

Each answer option carries weighted contributions to one or more dimensions (weights 1–2, an option can feed multiple dimensions). Full weight map is in the prototype.

### 5.2 Signature answer callbacks
Most options carry a `cb` string — a flirty line quoting the answer back ("You're the one who rereads the last text. We saw that."). Collected in pick order; **exactly one** is woven into Section A's love paragraph.

### 5.3 Margin detection & blends (`topTwo`)
For each dimension, compute top two scores. If `v1 - v2 <= 1 && v2 > 0` → blended:
- Attachment blends use ATT_BLEND (6 directional pairs, e.g. "Steady flame, anxious flicker", "Push-pull flame") — label + dedicated copy.
- Love blend → hybrid chip label + "bilingual in love" line appended.
- Conflict blends use CON_BLEND lines.

### 5.4 Section A — woven portrait (3 paragraphs + kicker, NOT a per-question checklist)
1. Attachment copy (blend-aware) fused with sign via SIGN_ATT_BRIDGE — 12 element×attachment fusions ("a Scorpio in a diving bell — deep waters, sealed hatch").
2. Love-language copy with the single callback woven in.
3. Conflict copy + ELEMENT_FLAVOR closing clause (per-element, sign-named).
4. Italic kicker (rotating, deterministic by sign index).

### 5.5 Section B — cross-reflection (their sign × user's actual answers)
- Their element craving (SIGN_TRAITS).
- **Love cross:** user's love language vs partner element's default (EL_LOVE_DEFAULT: fire→touch, earth→acts, air→words, water→time). Match → "no translation loss" line; gap → "translation gap… that's the whole assignment" line.
- **Conflict cross:** user's conflict style vs partner element's need (EL_CON_NEED), with 5 specific collision cases (e.g. direct×earth "let's-talk-NOW hits their not-yet wall — give it an hour") + generic fallback.
- Element pairing line (ELEMENT_PAIR, 10 entries) + DYNAMIC_COPY by user attachment + kicker.
- Tone rule (hard requirement): tendency language only — "tends to / often / likely". Never diagnostic ("they need/are/will").

### 5.6 Spark Score
`base = PAIR_BASE[elementPair]` (10 values, 60–88) then: secure +6 / anxious −2 / avoidant −3; collab +5 / direct +2 / con-avoidant −4 / accommodating −1; deterministic wobble `((signIdxA+signIdxB)%5)−2`; clamp 38–97. Tease line by band (≥80 / ≥65 / else) always points at the partner's read as the missing half.

### 5.7 True Spark Score (paired)
Same base; +5 if either secure; −7 anxious×avoidant either direction; +6 love match; +4 conflict match; −3 direct×avoidant either direction; clamp. Delta line compares vs solo score.

### 5.8 Partner simulation (V1 demo only)
Deterministic, seeded by partner sign index: att by idx%3, love by element default, con by (idx+1)%4, guess answers [(idx)%4,(idx+2)%4,(idx+1)%4]. **V2 replaces this function with real partner quiz data — same interfaces.**

## 6. Guess Mode & Invite

- 3 fixed questions (GUESS_QS), guesses stored in session.
- Invite = base64 payload `{u,p,g,s}` in URL param — guesses ride in the link itself; nothing stored server-side until partner converts. V2: partner opening link → their own quiz → paired read unlocks for both (requires lightweight session-pair persistence: invite code ↔ two result sets).

## 7. Sharing & Clipboard

Share text (blend-aware labels, must match on-screen reading) via layered fallback: `navigator.clipboard` → `execCommand('copy')` → manual copy bottom sheet ("Copy it yourself — we tried, your browser said no.").

## 8. State Rules

- All session state (answers, sigAnswers, guesses, score, pack answers) resets on restart/retake — no leakage between reads.
- Anonymous: results are session-only. Shareable-result mechanism (link or image) remains an open launch decision.

## 9. Monetization

- Free: everything solo (quiz, both sections, score, guess mode sealing).
- Premium (fast-follow): partner invite unlock, real paired read, question packs. Pricing per existing Ignite model ($2.99/$6.99 tiers).
- Paywall never appears before the solo result.

## 10. Launch Checklist (remaining work)

- [ ] Production Next.js build from prototype (this spec)
- [ ] Domain + deploy + PWA manifest
- [ ] Analytics from day one: quiz start→complete rate, guess-mode uptake, share taps, invite copies
- [ ] Privacy policy + terms (required for Meta ads)
- [ ] Shareable-result decision (link vs image card)
- [ ] 5–10 external user tests before public launch
- [ ] Fast-follow: payments (Stripe), invite session-pairing backend, real paired read
- [ ] Meta ad creative referencing Spark Score / guess-reveal moments

## 11. Explicitly Out of Scope for V1

Rising/moon signs · accounts/login · daily content features · push notifications · native apps · partner answering anything · any emotionally heavy/therapeutic framing.
