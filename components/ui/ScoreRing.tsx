"use client";

import { useEffect, useRef, useState } from "react";

export function ScoreRing({ score, label }: { score: number; label: string }) {
  const [current, setCurrent] = useState(0);
  const frame = useRef<number>();

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setCurrent(score);
      return;
    }
    let cur = 0;
    const step = () => {
      cur += Math.max(1, Math.round((score - cur) / 8));
      if (cur >= score) cur = score;
      setCurrent(cur);
      if (cur < score) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [score]);

  return (
    <div
      className="score-ring"
      style={{ ["--pct" as string]: current }}
    >
      <span className="score-num">{current}</span>
      <span className="text-label uppercase tracking-[.22em] text-ivory-dim">{label}</span>
    </div>
  );
}
