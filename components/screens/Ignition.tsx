"use client";

import { useEffect, useState } from "react";
import type { Sign } from "@/lib/engine";

const MESSAGES = ["Reading your spark…", "Weighing both signs…", "Tracing the dynamic…"];

export function Ignition({ userSign, partnerSign, onComplete }: { userSign: Sign; partnerSign: Sign; onComplete: () => void }) {
  const [lit, setLit] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setLit(true));
      return () => cancelAnimationFrame(raf2);
    });
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, MESSAGES.length - 1));
    }, 800);
    const done = setTimeout(onComplete, 2600);
    return () => {
      cancelAnimationFrame(raf1);
      clearInterval(msgInterval);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="flex flex-1 animate-fadeUp flex-col items-center justify-center gap-sp-3 text-center">
      <div className={`orbit ${lit ? "lit" : ""}`}>
        <span className="orb-glyph orb-a">{userSign.g}</span>
        <span className="orb-glyph orb-b">{partnerSign.g}</span>
        <span className="flare" />
      </div>
      <div className="font-serif text-[1.42rem] italic text-ivory-dim">{MESSAGES[msgIndex]}</div>
    </section>
  );
}
