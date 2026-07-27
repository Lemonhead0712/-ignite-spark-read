"use client";

import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base =
    "w-full rounded-full px-7 py-4 font-sans font-semibold text-base transition-transform active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px]";
  const styles =
    variant === "primary"
      ? "text-night bg-gradient-to-r from-[var(--ember-1)] to-[var(--ember-2)] shadow-[0_8px_28px_rgba(255,107,74,.26)] focus-visible:outline-ivory"
      : "text-ivory bg-transparent border border-line shadow-none focus-visible:outline-[var(--ember-2)]";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
