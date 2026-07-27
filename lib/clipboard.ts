/**
 * Three-layer clipboard fallback: async Clipboard API -> execCommand('copy') -> manual copy sheet.
 * Mirrors the prototype's copyText/showCopySheet behavior for a React UI.
 */

export type CopyResult = { status: "copied" } | { status: "manual"; text: string };

function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export async function copyText(text: string): Promise<CopyResult> {
  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { status: "copied" };
    } catch {
      // fall through to legacy path
    }
  }
  if (legacyCopy(text)) return { status: "copied" };
  return { status: "manual", text };
}
