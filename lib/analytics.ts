/**
 * Provider-agnostic analytics wrapper. Wire a real provider (Plausible, PostHog, GA)
 * into `dispatch` later — call sites don't need to change.
 */

export type AnalyticsEvent =
  | "quiz_start"
  | "quiz_complete"
  | "guess_start"
  | "guess_sealed"
  | "share_tap"
  | "save_image"
  | "invite_copy";

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

function dispatch(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, props ?? {});
  }
  // Future: forward to the configured provider, e.g.
  // window.plausible?.(event, { props });
}

export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  dispatch(event, props);
}
