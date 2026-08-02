import { GUESS_QS } from "@/lib/engine";
import { Brand } from "../ui/Brand";
import { Button } from "../ui/Button";

export function InviteReveal({
  senderName,
  guesses,
  answers,
  onContinue,
  onExit,
}: {
  senderName: string;
  guesses: number[];
  answers: (number | null)[];
  onContinue: () => void;
  onExit: () => void;
}) {
  const matches = GUESS_QS.reduce((count, _, i) => (guesses[i] === answers[i] ? count + 1 : count), 0);
  const headline =
    matches === GUESS_QS.length
      ? `${senderName} read you perfectly.`
      : matches === 0
        ? `${senderName} got none of it. Bold guesses.`
        : `${senderName} got ${matches} of ${GUESS_QS.length} right.`;

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
      <div className="flex flex-1 flex-col gap-sp-3 overflow-y-auto py-sp-2">
        <div className="text-center">
          <div className="mb-sp-2 text-[3rem]">{matches === GUESS_QS.length ? "🎯" : matches === 0 ? "😬" : "🔥"}</div>
          <h2 className="font-serif text-title font-normal leading-[1.18]">{headline}</h2>
        </div>
        <div className="flex flex-col gap-sp-2">
          {GUESS_QS.map((q, i) => {
            const correct = guesses[i] === answers[i];
            const yourAnswer = answers[i];
            return (
              <div key={q.q} className="rounded border border-line bg-card p-sp-3">
                <p className="mb-sp-1 text-meta text-ivory-dim">{q.q}</p>
                <p className="mb-[4px] text-body">
                  <span className="text-ivory-dim">Their guess: </span>
                  <span className={correct ? "font-semibold" : "text-ivory-dim"} style={correct ? { color: "var(--ember-2)" } : undefined}>
                    {q.o[guesses[i]]}
                  </span>{" "}
                  {correct ? "✓" : "✗"}
                </p>
                {!correct && yourAnswer !== null && (
                  <p className="text-body">
                    <span className="text-ivory-dim">Your answer: </span>
                    <span className="text-ivory">{q.o[yourAnswer]}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Button onClick={onContinue}>See your own Spark Read</Button>
    </section>
  );
}
