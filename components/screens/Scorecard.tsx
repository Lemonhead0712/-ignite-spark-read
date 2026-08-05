import type { RoundHistoryEntry } from "@/lib/roundHistory";
import type { Sign, SoloResultData } from "@/lib/engine";
import { Button } from "../ui/Button";
import { TopBar } from "../ui/TopBar";

export function Scorecard({
  userSign,
  partnerSign,
  result,
  history,
  onBack,
  onExit,
}: {
  userSign: Sign;
  partnerSign: Sign;
  result: SoloResultData;
  history: RoundHistoryEntry[];
  onBack: () => void;
  onExit: () => void;
}) {
  const totalCorrect = history.reduce((sum, r) => sum + r.correctCount, 0);
  const totalQuestions = history.reduce((sum, r) => sum + r.totalCount, 0);
  const guessAccuracyPct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null;
  // Even split: half the astrological Spark Score, half how well {partner} has
  // empirically read {user} so far. Falls back to the plain Spark Score when
  // there's no accuracy data yet, instead of fabricating a punishing 0%.
  const overallScore = guessAccuracyPct === null ? result.score : Math.round(0.5 * result.score + 0.5 * guessAccuracyPct);

  return (
    <section className="flex flex-1 animate-fadeUp flex-col">
      <TopBar label="← Back to game" onAction={onBack} onRestart={onExit} />
      <div className="flex flex-1 flex-col gap-sp-3 overflow-y-auto py-sp-2">
        <div className="text-center">
          <div className="text-label uppercase tracking-[.2em] text-rose">
            {userSign.n} × {partnerSign.n}
          </div>
          <h2 className="font-serif text-title font-normal leading-[1.18]">Scorecard</h2>
        </div>

        <div className="flex gap-[10px]">
          <div className="flex-1 rounded border border-line bg-card px-sp-3 py-sp-2 text-center">
            <span className="text-label uppercase tracking-[.2em] text-ivory-dim">Spark Score</span>
            <div className="font-serif text-[2rem] leading-tight" style={{ color: "var(--ember-2)" }}>
              {result.score}
            </div>
          </div>
          <div className="flex-1 rounded border border-line bg-card px-sp-3 py-sp-2 text-center">
            <span className="text-label uppercase tracking-[.2em] text-ivory-dim">Overall Match</span>
            <div className="font-serif text-[2rem] leading-tight" style={{ color: "var(--ember-2)" }}>
              {overallScore}
            </div>
          </div>
        </div>
        <p className="text-center text-meta text-ivory-dim">{result.scoreTease}</p>

        {history.length === 0 ? (
          <div className="rounded border border-line bg-card p-sp-3 text-center text-body text-ivory-dim">
            No rounds revealed here yet. Once {partnerSign.n} sends a round and you answer it, how well they read you
            shows up here.
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="font-serif text-[1.6rem]">
                {totalCorrect} of {totalQuestions} correct
              </div>
              <p className="text-meta text-ivory-dim">
                How well {partnerSign.n} has read you, across {history.length} round{history.length === 1 ? "" : "s"}
              </p>
              <p className="mt-[4px] text-meta text-ivory-dim">
                This reflects rounds where you answered {partnerSign.n}&rsquo;s guesses about you — not your guesses
                about them.
              </p>
            </div>

            <div className="flex flex-col gap-sp-2">
              {history.map((entry) => (
                <div key={entry.round} className="rounded border border-line bg-card p-sp-3">
                  <p className="mb-sp-1 text-meta text-ivory-dim">
                    Round {entry.round + 1} — {entry.correctCount}/{entry.totalCount}
                  </p>
                  <div className="flex flex-col gap-[10px]">
                    {entry.questions.map((q, i) => (
                      <div key={i}>
                        <p className="text-body">{q.question}</p>
                        <p className="mb-[2px] mt-[2px] text-meta">
                          <span className="text-ivory-dim">Their guess: </span>
                          <span
                            className={q.correct ? "font-semibold" : "text-ivory-dim"}
                            style={q.correct ? { color: "var(--ember-2)" } : undefined}
                          >
                            {q.guessLabel}
                          </span>{" "}
                          {q.correct ? "✓" : "✗"}
                        </p>
                        {!q.correct && q.answerLabel !== null && (
                          <p className="text-meta">
                            <span className="text-ivory-dim">Your answer: </span>
                            <span className="text-ivory">{q.answerLabel}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Button variant="ghost" onClick={onBack}>
        Back to the game
      </Button>
    </section>
  );
}
