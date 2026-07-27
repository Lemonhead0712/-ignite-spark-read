export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="mb-sp-2 h-1 overflow-hidden rounded-full bg-night-2">
      <i
        className="block h-full rounded-full bg-gradient-to-r from-[var(--ember-1)] to-[var(--ember-2)] transition-[width] duration-300 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
