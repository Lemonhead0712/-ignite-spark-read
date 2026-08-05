/**
 * Thin wrapper around Google Analytics (gtag.js, loaded in app/layout.tsx).
 * Call sites just use `track(event, props)` — the gtag call shape lives here only.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEvent =
  | "quiz_start"
  | "quiz_question_answered"
  | "quiz_complete"
  | "guess_start"
  | "guess_sealed"
  | "share_tap"
  | "share_app_tap"
  | "save_image"
  | "invite_copy"
  | "scorecard_view";

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

function dispatch(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, props ?? {});
  }
  window.gtag?.("event", event, props ?? {});
}

export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  dispatch(event, props);
}
