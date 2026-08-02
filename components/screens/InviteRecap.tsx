import { GUESS_QS } from "@/lib/engine";
import { Brand } from "../ui/Brand";
import { ProgressBar } from "../ui/ProgressBar";

export function InviteRecap({
  gi,
  senderName,
  onAnswer,
  onBack,
}: {
  gi: number;
  senderName: string;
  onAnswer: (index: number) => void;
  onBack: () => void;
}) {
  const question = GUESS_QS[gi];

  return (
    <section className="flex flex-1 animate-fadeUp flex-col">
      <div className="mb-sp-2 flex min-h-[32px] items-center justify-between">
        <Brand />
      </div>
      <ProgressBar percent={(gi / GUESS_QS.length) * 100} />
      <div className="mb-sp-1">
        <div className="text-label uppercase tracking-[.2em] text-rose">
          Question {gi + 1} of {GUESS_QS.length} · Your real answer
        </div>
        {gi > 0 && (
          <button
            onClick={onBack}
            className="mt-sp-1 ml-auto block p-[4px_2px] font-sans text-meta text-ivory-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ember-2)] focus-visible:outline-offset-[3px] focus-visible:rounded-[6px]"
          >
            ‹ Previous
          </button>
        )}
      </div>
      <p className="mb-sp-3 text-meta text-ivory-dim">
        {senderName} guessed how you&rsquo;d answer this. Let&rsquo;s see if they know you as well as they think.
      </p>
      <div className="mb-sp-4 min-h-[3.6em] font-serif text-question font-normal leading-[1.24]">{question.q}</div>
      <div className="flex flex-col gap-[11px]">
        {question.o.map((label, idx) => (
          <button
            key={label}
            onClick={() => onAnswer(idx)}
            className="cursor-pointer rounded border border-line bg-card p-[16px_18px] text-left font-sans text-body leading-[1.45] text-ivory transition-[border-color,transform] duration-150 hover:border-[rgba(255,107,74,.55)] active:scale-[.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ember-2)] focus-visible:outline-offset-2"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
