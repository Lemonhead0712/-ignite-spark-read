import { Brand } from "../ui/Brand";
import { Button } from "../ui/Button";

interface ResumePrompt {
  onResume: () => void;
  onDiscard: () => void;
}

export function Landing({
  onStart,
  onQuickStart,
  resume,
}: {
  onStart: () => void;
  onQuickStart: () => void;
  resume?: ResumePrompt;
}) {
  return (
    <section className="flex flex-1 animate-fadeUp flex-col">
      <div className="mb-sp-2 flex min-h-[32px] items-center justify-between">
        <Brand />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-sp-3 pb-sp-5">
        <svg viewBox="0 0 512 512" className="h-[clamp(64px,12vw,96px)] w-[clamp(64px,12vw,96px)]" aria-hidden="true">
          <defs>
            <linearGradient id="landing-ember" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B4A" />
              <stop offset="100%" stopColor="#FFB347" />
            </linearGradient>
          </defs>
          <path
            d="M256 96c18 62-34 84-34 138 0 40 30 70 68 70 4 0 8 0 12-1-10 16-28 27-50 27-46 0-84-38-84-90 0-70 56-104 88-144z"
            fill="url(#landing-ember)"
          />
          <path
            d="M256 220c10 30-14 42-14 66 0 20 16 34 34 34 22 0 40-18 40-42 0-38-32-38-60-58z"
            fill="url(#landing-ember)"
            opacity="0.85"
          />
        </svg>
        <span className="block text-label uppercase tracking-[.24em] text-rose">Spark Read</span>
        <h1 className="font-serif text-hero font-normal leading-[1.08]">
          Know what they want, <em className="brand-em">without asking.</em>
        </h1>
        <p className="max-w-[34ch] text-[1.14rem] text-ivory-dim">
          Ten questions about you. One suspiciously accurate read on them. Two minutes, and you&rsquo;ll know things
          they haven&rsquo;t said out loud.
        </p>
        <div className="flex gap-[18px] text-meta text-ivory-dim">
          <span className="flex items-center gap-[7px]">
            <i className="block h-[6px] w-[6px] rounded-full bg-gradient-to-r from-[var(--ember-1)] to-[var(--ember-2)]" />
            2 minutes
          </span>
          <span className="flex items-center gap-[7px]">
            <i className="block h-[6px] w-[6px] rounded-full bg-gradient-to-r from-[var(--ember-1)] to-[var(--ember-2)]" />
            No sign-up
          </span>
          <span className="flex items-center gap-[7px]">
            <i className="block h-[6px] w-[6px] rounded-full bg-gradient-to-r from-[var(--ember-1)] to-[var(--ember-2)]" />
            Free
          </span>
        </div>
      </div>
      {resume ? (
        <>
          <Button onClick={resume.onResume}>Continue where you left off</Button>
          <Button variant="ghost" onClick={resume.onDiscard} className="mt-sp-2">
            Start a new read instead
          </Button>
        </>
      ) : (
        <>
          <Button onClick={onStart}>Start your Spark Read</Button>
          <button
            onClick={onQuickStart}
            className="mt-sp-2 p-[6px] text-center font-sans text-meta text-ivory-dim underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ember-2)] focus-visible:outline-offset-[3px] focus-visible:rounded-[6px]"
          >
            In a hurry? Try the 5-question quick read →
          </button>
        </>
      )}
    </section>
  );
}
