/**
 * gtag.js
 * -------
 * Thin client-side wrapper around window.gtag (loaded by
 * components/analytics/GoogleAnalytics.jsx). Safe to import and call from
 * any "use client" component even before the script has loaded, or when
 * NEXT_PUBLIC_GA_MEASUREMENT_ID is unset (both cases are no-ops).
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function pageview(url) {
  if (typeof window === "undefined" || !window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag("event", "page_view", { page_path: url });
}

/** Fire a GA4 event. Use standard event names (search, generate_lead,
 * select_content, view_item, login, sign_up, share) where GA4 defines one —
 * they get better default reporting — and a custom name otherwise. */
export function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || !window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag("event", name, params);
}
