import { Brand } from "./Brand";

export function TopBar({
  label,
  onAction,
  onRestart,
}: {
  label: string;
  onAction: () => void;
  onRestart?: () => void;
}) {
  return (
    <div className="mb-sp-2 flex min-h-[32px] items-center justify-between">
      <button
        onClick={onAction}
        className="p-[6px_2px] font-sans text-meta text-ivory-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ember-2)] focus-visible:outline-offset-[3px] focus-visible:rounded-[6px]"
      >
        {label}
      </button>
      <Brand />
      {onRestart ? (
        <button
          onClick={onRestart}
          aria-label="Restart from the beginning"
          title="Restart from the beginning"
          className="p-[6px_2px] font-sans text-meta text-ivory-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ember-2)] focus-visible:outline-offset-[3px] focus-visible:rounded-[6px]"
        >
          ↺
        </button>
      ) : (
        <span className="w-[20px]" aria-hidden="true" />
      )}
    </div>
  );
}
