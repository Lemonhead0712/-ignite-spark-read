import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "var(--night)",
        "night-2": "var(--night-2)",
        card: "var(--card)",
        "ember-1": "var(--ember-1)",
        "ember-2": "var(--ember-2)",
        rose: "var(--rose)",
        "rose-deep": "var(--rose-deep)",
        ivory: "var(--ivory)",
        "ivory-dim": "var(--ivory-dim)",
        line: "var(--line)",
        you: "var(--you)",
        them: "var(--them)",
      },
      fontFamily: {
        serif: ["var(--font-instrument-serif)", "serif"],
        sans: ["var(--font-outfit)", "sans-serif"],
      },
      fontSize: {
        hero: "var(--fs-hero)",
        title: "var(--fs-title)",
        question: "var(--fs-question)",
        section: "var(--fs-section)",
        body: "var(--fs-body)",
        meta: "var(--fs-meta)",
        label: "var(--fs-label)",
      },
      spacing: {
        "sp-1": "var(--sp-1)",
        "sp-2": "var(--sp-2)",
        "sp-3": "var(--sp-3)",
        "sp-4": "var(--sp-4)",
        "sp-5": "var(--sp-5)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)",
      },
      maxWidth: {
        app: "480px",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "none" },
        },
        glyphIn: {
          from: { transform: "scale(.75)", opacity: "0", filter: "blur(6px)" },
          to: { transform: "scale(1)", opacity: "1", filter: "blur(0)" },
        },
        softUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        flare: {
          "0%": { transform: "translate(-50%,-50%) scale(0)", opacity: "0" },
          "45%": { opacity: "1" },
          "100%": { transform: "translate(-50%,-50%) scale(15)", opacity: "0" },
        },
      },
      animation: {
        fadeUp: "fadeUp .45s ease both",
        glyphIn: "glyphIn 1s cubic-bezier(.25,.8,.3,1) both",
        softUp: "softUp .8s ease-out both",
        flare: "flare 1s .9s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
