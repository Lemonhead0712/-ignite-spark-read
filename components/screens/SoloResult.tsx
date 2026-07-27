import type { Sign, SoloResultData } from "@/lib/engine";
import { Button } from "../ui/Button";
import { RichText } from "../ui/RichText";
import { ScoreRing } from "../ui/ScoreRing";
import { TopBar } from "../ui/TopBar";

interface SoloResultProps {
  userSign: Sign;
  partnerSign: Sign;
  result: SoloResultData;
  onRetake: () => void;
  onShare: () => void;
  onStartGuess: () => void;
}

export function SoloResult({ userSign, partnerSign, result, onRetake, onShare, onStartGuess }: SoloResultProps) {
  return (
    <section className="flex flex-1 animate-fadeUp flex-col">
      <TopBar label="↺ Retake" onAction={onRetake} />

      <div className="mb-sp-4 text-center">
        <div className="mb-[6px] text-label uppercase tracking-[.2em] text-ivory-dim">
          <span style={{ color: "var(--you)" }}>
            {userSign.g} {userSign.n}
          </span>
          &nbsp;×&nbsp;
          <span style={{ color: "var(--them)" }}>
            {partnerSign.n} {partnerSign.g}
          </span>
        </div>
        <h2 className="font-serif text-title font-normal leading-[1.18]">Your Spark Read</h2>
      </div>

      <div className="mb-sp-4 flex flex-col items-center gap-sp-2">
        <ScoreRing score={result.score} label="Spark Score" />
        <p className="max-w-[32ch] text-center text-meta leading-[1.55] text-ivory-dim">{result.scoreTease}</p>
      </div>

      <div className="mb-sp-3 rounded border border-line bg-card p-sp-3">
        <span className="mb-sp-2 inline-block text-label uppercase tracking-[.2em]" style={{ color: "var(--ember-2)" }}>
          About you · from your answers
        </span>
        <div className="mb-sp-2 flex flex-wrap gap-2">
          {result.chips.map((chip) => (
            <span key={chip} className="rounded-full border border-line px-[13px] py-[6px] text-[.74rem] font-medium text-rose">
              {chip}
            </span>
          ))}
        </div>
        <div className="[&_p]:mb-sp-2 [&_p:last-child]:mb-0 [&_p]:text-body [&_p]:text-ivory-dim [&_strong]:font-semibold [&_strong]:text-ivory">
          {result.sectionA.paragraphs.map((html, i) => (
            <RichText key={i} html={html} />
          ))}
          <p className="mt-sp-2 border-t border-line pt-sp-2 font-serif italic text-[1.02rem]" style={{ color: "var(--rose)" }}>
            {result.sectionA.kicker}
          </p>
        </div>
      </div>

      <div
        className="mb-sp-3 rounded border p-sp-3"
        style={{
          background: "linear-gradient(180deg, rgba(217,122,150,.10), rgba(43,24,48,.92))",
          borderColor: "rgba(217,122,150,.32)",
        }}
      >
        <span className="mb-sp-2 inline-block text-label uppercase tracking-[.2em]" style={{ color: "var(--them)" }}>
          Their likely dynamic · a pattern-based read
        </span>
        <div className="[&_p]:mb-sp-2 [&_p:last-child]:mb-0 [&_p]:text-body [&_p]:text-ivory-dim [&_strong]:font-semibold [&_strong]:text-ivory">
          {result.sectionB.paragraphs.map((html, i) => (
            <RichText key={i} html={html} />
          ))}
          <p className="mt-sp-2 border-t border-line pt-sp-2 font-serif italic text-[1.02rem]" style={{ color: "var(--rose)" }}>
            {result.sectionB.kicker}
          </p>
        </div>
      </div>

      <div className="mb-sp-3 rounded border border-dashed p-sp-3 text-center" style={{ borderColor: "rgba(255,179,71,.45)" }}>
        <h4 className="mb-[6px] font-serif text-section font-normal">Think you know them?</h4>
        <p className="mb-sp-2 text-meta leading-[1.55] text-ivory-dim">
          Guess how they&rsquo;d answer 3 questions. Your guesses get sealed into your invite — when they take their own
          read, you both find out how right you were. No pressure. (Some pressure.)
        </p>
        <Button variant="ghost" onClick={onStartGuess}>
          Play Guess Mode
        </Button>
      </div>

      <div className="flex flex-col pb-sp-1">
        <Button onClick={onShare}>Copy my read to share</Button>
        <Button variant="ghost" onClick={onRetake} className="mt-sp-2">
          Start a new read
        </Button>
      </div>
    </section>
  );
}
