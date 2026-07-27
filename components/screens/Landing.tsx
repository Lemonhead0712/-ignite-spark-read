import { Brand } from "../ui/Brand";
import { Button } from "../ui/Button";

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <section className="flex flex-1 animate-fadeUp flex-col">
      <div className="mb-sp-2 flex min-h-[32px] items-center justify-between">
        <Brand />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-sp-3 pb-sp-5">
        <span className="block text-label uppercase tracking-[.24em] text-rose">Spark Read</span>
        <h1 className="font-serif text-hero font-normal leading-[1.08]">
          Know what they want, <em className="brand-em">without asking.</em>
        </h1>
        <p className="max-w-[34ch] text-[1.04rem] text-ivory-dim">
          Ten questions about you. One suspiciously accurate read on them. Two minutes, and you&rsquo;ll know things
          they haven&rsquo;t said out loud.
        </p>
        <div className="flex gap-[18px] text-meta text-ivory-dim">
          <span className="flex items-center gap-[7px]">
            <i className="block h-[5px] w-[5px] rounded-full bg-gradient-to-r from-[var(--ember-1)] to-[var(--ember-2)]" />
            2 minutes
          </span>
          <span className="flex items-center gap-[7px]">
            <i className="block h-[5px] w-[5px] rounded-full bg-gradient-to-r from-[var(--ember-1)] to-[var(--ember-2)]" />
            No sign-up
          </span>
          <span className="flex items-center gap-[7px]">
            <i className="block h-[5px] w-[5px] rounded-full bg-gradient-to-r from-[var(--ember-1)] to-[var(--ember-2)]" />
            Free
          </span>
        </div>
      </div>
      <Button onClick={onStart}>Start your Spark Read</Button>
    </section>
  );
}
