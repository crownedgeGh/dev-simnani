/**
 * Cookie/analytics consent, stored client-side only (localStorage).
 * "necessary" (login session, saved properties, theme, etc.) is always on —
 * it's required for the site to function and isn't a consent choice.
 * "analytics" (Google Analytics) is the only optional category today;
 * add more keys here if a new non-essential cookie/script is introduced.
 */

const CONSENT_KEY = "se_cookie_consent";
export const CONSENT_EVENT = "se-consent-change";

export function getConsent() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(CONSENT_KEY));
  } catch {
    return null;
  }
}

export function setConsent(analytics) {
  const value = { necessary: true, analytics, decidedAt: Date.now() };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
  return value;
}
