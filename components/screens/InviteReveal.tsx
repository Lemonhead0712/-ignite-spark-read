import { GUESS_ROUND_SIZE, getGuessRoundQuestions } from "@/lib/engine";
import { Brand } from "../ui/Brand";
import { Button } from "../ui/Button";

export function InviteReveal({
  round,
  senderName,
  guesses,
  answers,
  isReturningPair,
  onContinue,
  onExit,
}: {
  round: number;
  senderName: string;
  guesses: number[];
  answers: (number | null)[];
  isReturningPair: boolean;
  onContinue: () => void;
  onExit: () => void;
}) {
  const questions = getGuessRoundQuestions(round);
  const matches = questions.reduce((count, _, i) => (guesses[i] === answers[i] ? count + 1 : count), 0);
  const headline =
    matches === GUESS_ROUND_SIZE
      ? `${senderName} read you perfectly.`
      : matches === 0
        ? `${senderName} got none of it. Bold guesses.`
        : `${senderName} got ${matches} of ${GUESS_ROUND_SIZE} right.`;

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
          <div className="mb-sp-2 text-[3rem]">{matches === GUESS_ROUND_SIZE ? "🎯" : matches === 0 ? "😬" : "🔥"}</div>
          <h2 className="font-serif text-title font-normal leading-[1.18]">{headline}</h2>
        </div>
        <div className="flex flex-col gap-sp-2">
          {questions.map((q, i) => {
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
      {!isReturningPair && (
        <p className="mb-sp-2 text-center text-meta text-ivory-dim">Just 5 quick questions, then you're back in the game.</p>
      )}
      <Button onClick={onContinue}>{isReturningPair ? "Back to the game" : "Take your quick 5-question read"}</Button>
    </section>
  );
}
