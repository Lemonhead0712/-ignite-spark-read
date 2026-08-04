import type { Sign, SoloResultData } from "@/lib/engine";
import { Brand } from "../ui/Brand";
import { Button } from "../ui/Button";

export function GuessHub({
  userSign,
  partnerSign,
  result,
  round,
  onPlayRound,
  onExit,
}: {
  userSign: Sign;
  partnerSign: Sign;
  result: SoloResultData;
  round: number;
  onPlayRound: () => void;
  onExit: () => void;
}) {
  return (
    <section className="flex flex-1 animate-fadeUp flex-col">
      <div className="mb-sp-2 flex min-h-[32px] items-center justify-between">
        <button
          onClick={onExit}
          className="p-[6px_2px] font-sans text-meta text-ivory-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ember-2)] focus-visible:outline-offset-[3px] focus-visible:rounded-[6px]"
        >
          ✕ Start over
        </button>
        <Brand />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-sp-3 text-center">
        <div className="text-label uppercase tracking-[.2em] text-rose">
          {userSign.n} × {partnerSign.n}
        </div>
        <h2 className="font-serif text-title font-normal leading-[1.18]">The Guess Game</h2>
        <div className="rounded border border-line bg-card px-sp-3 py-sp-2">
          <span className="text-label uppercase tracking-[.2em] text-ivory-dim">Your Spark Score</span>
          <div className="font-serif text-[2.4rem] leading-tight" style={{ color: "var(--ember-2)" }}>
            {result.score}
          </div>
        </div>
        <p className="max-w-[32ch] text-body text-ivory-dim">
          You already have your read on each other. Now keep guessing — every round brings 3 fresh questions.
        </p>
        <div className="text-meta text-ivory-dim">Round {round + 1}</div>
        <Button onClick={onPlayRound} className="max-w-[320px]">
          Play round {round + 1}
        </Button>
      </div>
    </section>
  );
}
