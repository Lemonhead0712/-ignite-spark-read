import { Button } from "../ui/Button";
import { TopBar } from "../ui/TopBar";

export function Sealed({
  onCopyInvite,
  onBack,
  backLabel = "Back to my read",
}: {
  onCopyInvite: () => void;
  onBack: () => void;
  backLabel?: string;
}) {
  return (
    <section className="flex flex-1 animate-fadeUp flex-col">
      <TopBar label={backLabel === "Back to game" ? "← Game" : "← Results"} onAction={onBack} />
      <div className="flex flex-1 flex-col items-center justify-center gap-[18px] text-center">
        <div className="text-[3.4rem]">🔒</div>
        <h2 className="text-center font-serif text-title font-normal leading-[1.18]">Sealed. No takebacks.</h2>
        <p className="mb-0 max-w-[32ch] text-center text-body text-ivory-dim">
          Your guesses are locked into your invite. Send it — when they finish their read, you both find out how well
          you really know each other.
        </p>
        <Button onClick={onCopyInvite}>Copy invite to send</Button>
        <Button variant="ghost" onClick={onBack}>
          {backLabel}
        </Button>
      </div>
    </section>
  );
}
