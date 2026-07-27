export function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed left-1/2 bottom-8 z-50 -translate-x-1/2 rounded-full bg-ivory px-[22px] py-[11px] font-sans text-meta font-semibold text-night transition-transform duration-300 ease-out ${
        visible ? "translate-y-0" : "translate-y-20"
      }`}
      style={{ transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(80px)" }}
    >
      {message}
    </div>
  );
}
