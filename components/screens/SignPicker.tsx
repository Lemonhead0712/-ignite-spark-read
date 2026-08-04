"use client";

import { useState } from "react";
import { SIGNS, type Sign } from "@/lib/engine";
import { TopBar } from "../ui/TopBar";

interface SignPickerProps {
  variant: "you" | "them";
  onBack: () => void;
  onPick: (sign: Sign) => void;
  onRestart: () => void;
}

const COPY = {
  you: {
    eyebrow: "Step 1 of 2 · You",
    title: "First things first — what's your sign?",
    sub: "Sun sign is all we need. We're quick like that.",
    backLabel: "← Back",
  },
  them: {
    eyebrow: "Step 2 of 2 · Them",
    title: "And the person on your mind?",
    sub: "Partner, situationship, the one you keep almost-texting. We don't judge.",
    backLabel: "← Back",
  },
};

export function SignPicker({ variant, onBack, onPick, onRestart }: SignPickerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const copy = COPY[variant];
  const selColor = variant === "you" ? "var(--you)" : "var(--them)";

  function handlePick(sign: Sign) {
    setSelected(sign.n);
    setTimeout(() => onPick(sign), 260);
  }

  return (
    <section className="flex flex-1 animate-fadeUp flex-col">
      <TopBar label={copy.backLabel} onAction={onBack} onRestart={onRestart} />
      <span className="mb-sp-1 block text-label uppercase tracking-[.24em] text-rose">{copy.eyebrow}</span>
      <h2 className="mb-[6px] font-serif text-title font-normal leading-[1.18]">{copy.title}</h2>
      <p className="mb-sp-2 text-body text-ivory-dim">{copy.sub}</p>
      <div className="mb-sp-2 grid grid-cols-3 gap-[8px]">
        {SIGNS.map((sign) => {
          const isSel = selected === sign.n;
          return (
            <button
              key={sign.n}
              onClick={() => handlePick(sign)}
              className="cursor-pointer rounded-sm border p-[10px_6px] text-center font-sans text-ivory transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ember-2)] focus-visible:outline-offset-2"
              style={{
                borderColor: isSel ? selColor : "var(--line)",
                background: isSel
                  ? variant === "you"
                    ? "linear-gradient(180deg, rgba(255,107,74,.16), rgba(255,179,71,.05))"
                    : "linear-gradient(180deg, rgba(217,122,150,.18), rgba(217,122,150,.05))"
                  : "var(--card)",
              }}
            >
              <span
                className="mb-[5px] block text-[1.7rem]"
                style={{ color: isSel ? (variant === "you" ? "var(--ember-2)" : "var(--rose)") : "var(--rose)" }}
              >
                {sign.g}
              </span>
              <span className="text-[.88rem] font-semibold tracking-[.02em]">{sign.n}</span>
              <br />
              <span className="text-[.7rem] text-ivory-dim">{sign.d}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
