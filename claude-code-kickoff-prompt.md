# Claude Code Kickoff Prompt — Ignite Spark Read

Copy everything below the line into Claude Code from your Ignite project directory, with `ignite-sparkread-handoff-spec.md` and `ignite-prototype.html` placed in the project root first.

---

Build the production version of Ignite "Spark Read" as a Next.js app.

**Sources of truth (in this order):**
1. `ignite-prototype.html` — complete working reference implementation. All copy, scoring logic, data structures, design tokens, timings, and animations must match it exactly. Lift the content verbatim; do not rewrite copy.
2. `ignite-sparkread-handoff-spec.md` — architecture, screen map, engine documentation, and constraints.

**Scope for this phase — solo flow only (spec screens 1–8):**
Landing → sign picker (You) → interstitial 1 → sign picker (Them) → interstitial 2 → 10-question quiz → ignition animation → solo result (Spark Score, Section A portrait, Section B dynamic, Guess Mode + sealed screen + share).
Defer for later phases: paired read, question packs, payments, invite backend. Leave clean seams for them (the spec's simPartner interface note).

**Technical requirements:**
- Next.js (App Router) + TypeScript + Tailwind. Map the prototype's CSS custom properties into the Tailwind theme.
- Mobile-first, 480px max content width, exactly as the prototype renders.
- All state client-side (React state/context). No accounts, no database, no localStorage.
- Port the scoring engine (QUESTIONS weights, topTwo blend logic, signature callbacks, SIGN_ATT_BRIDGE, ELEMENT_FLAVOR, cross-reflection maps, computeScore) into a typed, pure, unit-tested module — `lib/engine.ts` — separate from UI. This module gets reused for the paired read later.
- Write unit tests for the engine: all 144 sign pairs produce valid copy, scores clamp 38–97, blend detection triggers at margin ≤1.
- Fonts: Instrument Serif + Outfit via next/font.
- Respect prefers-reduced-motion. Keyboard focus states as in prototype.
- Clipboard: port the three-layer fallback (async API → execCommand → manual copy sheet).
- PWA: manifest, icons, installable.
- Basic analytics events (provider-agnostic wrapper, wire-up later): quiz_start, quiz_complete, guess_start, guess_sealed, share_tap, invite_copy.

**Definition of done for this phase:**
Full solo journey runs flawlessly on mobile, pixel-faithful to the prototype's design system, engine tests green, deployable to Vercel/Netlify with one command.

Start by reading both source files completely, then propose your file structure before writing code.
