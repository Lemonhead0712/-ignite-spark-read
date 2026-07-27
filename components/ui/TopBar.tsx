import { Brand } from "./Brand";

export function TopBar({ label, onAction }: { label: string; onAction: () => void }) {
  return (
    <div className="mb-sp-2 flex min-h-[32px] items-center justify-between">
      <button
        onClick={onAction}
        className="p-[6px_2px] font-sans text-meta text-ivory-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ember-2)] focus-visible:outline-offset-[3px] focus-visible:rounded-[6px]"
      >
        {label}
      </button>
      <Brand />
    </div>
  );
}
