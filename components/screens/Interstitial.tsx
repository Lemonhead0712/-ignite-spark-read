import { REACTS, SIGN_DESC, pairKey, type Sign } from "@/lib/engine";
import { Button } from "../ui/Button";

interface Step1Props {
  variant: "step1";
  sign: Sign;
  onContinue: () => void;
  ctaLabel?: string;
}

interface Step2Props {
  variant: "step2";
  sign: Sign;
  userElement: Sign["el"];
  onContinue: () => void;
}

export function Interstitial(props: Step1Props | Step2Props) {
  const isStep2 = props.variant === "step2";
  const desc = SIGN_DESC[props.sign.n];

  return (
    <section className="flex flex-1 animate-fadeUp flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-sp-3 text-center">
        <span className={`step-glyph ${isStep2 ? "them" : "you"}`}>{props.sign.g}</span>

        {isStep2 ? (
          <div className="animate-softUp font-serif text-[1.48rem] italic">
            {REACTS[pairKey((props as Step2Props).userElement, props.sign.el)]}
          </div>
        ) : (
          <div className="animate-softUp font-serif text-[1.48rem]">
            <span style={{ color: "var(--you)" }}>{props.sign.n}</span> — noted.
          </div>
        )}

        <p className="max-w-[32ch] animate-softUp text-center text-body leading-[1.6] text-ivory-dim [animation-delay:0.6s]">
          {desc}
        </p>

        {isStep2 && (
          <div className="animate-softUp text-body [animation-delay:0.8s]" style={{ color: "var(--ember-2)" }}>
            Ten questions. Two minutes. Zero mercy.
          </div>
        )}

        <Button onClick={props.onContinue} className="max-w-[320px] animate-softUp [animation-delay:1.1s]">
          {props.variant === "step1" ? props.ctaLabel ?? "Next — who's on your mind?" : "Continue — let's do this"}
        </Button>
      </div>
    </section>
  );
}
