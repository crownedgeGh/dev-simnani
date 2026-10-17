"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FiMapPin, FiX } from "react-icons/fi";
import StateCitySearchFields from "@/components/shared/StateCitySearchFields";

const DARK_INPUT_CLASS =
  "h-10 w-full rounded-lg border border-navy-700/60 bg-navy-950 px-3 text-xs text-cream placeholder:text-muted outline-none transition focus:border-gold-400";
const DARK_LABEL_CLASS = "text-[11px] font-medium text-muted";
const DARK_MENU_CLASS = "border border-navy-700/60 bg-navy-900 text-cream";
const DARK_OPTION_CLASS = "text-cream hover:bg-navy-800 hover:text-gold-400";

const STORAGE_KEY = "se_location_prompt_seen";
const LOCATION_KEY = "se_user_location";
const STALE_MS = 30 * 60 * 1000; // re-detect city after 30 min, e.g. if the user has traveled

export default function LocationPrompt() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [manual, setManual] = useState(false);
  const [manualState, setManualState] = useState("");
  const [manualCity, setManualCity] = useState("");

  const isAdminRoute = pathname?.startsWith("/admin");
  const isHomePage = pathname === "/";

  useEffect(() => {
    if (isAdminRoute || !isHomePage) return;
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time check of localStorage, a client-only external store
        setVisible(true);
      }
    } catch {
      // localStorage unavailable — skip the prompt rather than nag every load
    }
  }, [isAdminRoute, isHomePage]);

  function dismiss() {
    setVisible(false);
  }

  useEffect(() => {
    window.addEventListener("se-location-detected", dismiss);
    return () => window.removeEventListener("se-location-detected", dismiss);
  }, []);

  useEffect(() => {
    function openPrompt() {
      if (isAdminRoute) return;
      setVisible(true);
      setExpanded(true);
    }
    window.addEventListener("se-open-location-prompt", openPrompt);
    return () => window.removeEventListener("se-open-location-prompt", openPrompt);
  }, [isAdminRoute]);

  function markGranted() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  function saveCity(city, state) {
    if (!city) return;
    try {
      localStorage.setItem("se_user_city", city);
      if (state) localStorage.setItem("se_user_state", state);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent("se-location-updated", { detail: city }));
  }

  function handleManualSave() {
    if (!manualState || !manualCity) return;
    markGranted();
    saveCity(manualCity, manualState);
    setManual(false);
    dismiss();
  }

  // IP-based fallback — used when GPS is denied, times out, or isn't available
  // (e.g. no secure context), so the city badge still has a chance to populate.
  function fetchCityByIp() {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => saveCity(data?.city))
      .catch(() => {
        // IP lookup unavailable too — no city badge, not fatal
      });
  }

  function detectCityFromCoords(lat, lng) {
    try {
      localStorage.setItem(LOCATION_KEY, JSON.stringify({ lat, lng, savedAt: Date.now() }));
    } catch {
      // ignore
    }
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
      .then((res) => res.json())
      .then((data) => saveCity(data?.city || data?.locality || data?.principalSubdivision))
      .catch(() => {
        // reverse geocoding unavailable — fall back to IP-based city
        fetchCityByIp();
      });
  }

  function handleAllow() {
    if (!("geolocation" in navigator)) {
      markGranted();
      fetchCityByIp();
      return;
    }
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setRequesting(false);
        markGranted();
        detectCityFromCoords(position.coords.latitude, position.coords.longitude);
      },
      () => {
        // Permission denied / timed out / insecure context — still stop nagging,
        // and fall back to an IP-based city guess.
        setRequesting(false);
        markGranted();
        fetchCityByIp();
      },
      { timeout: 10000 }
    );
  }

  // Silent re-detect: if location was granted before and the cached fix is
  // stale, quietly refresh it on this load — covers the "traveled to another
  // city" case without re-showing the prompt. No-ops if permission was denied
  // (the browser just won't prompt and getCurrentPosition errors silently).
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    let seen, cached;
    try {
      seen = localStorage.getItem(STORAGE_KEY);
      cached = JSON.parse(localStorage.getItem(LOCATION_KEY) || "null");
    } catch {
      return;
    }
    if (!seen) return;
    if (cached?.savedAt && Date.now() - cached.savedAt < STALE_MS) return;

    navigator.geolocation.getCurrentPosition(
      (position) => detectCityFromCoords(position.coords.latitude, position.coords.longitude),
      () => {
        // denied/unavailable this time — leave the last known city as-is
      },
      { timeout: 10000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time mount check, detectCityFromCoords has no reactive deps
  }, []);

  if (!visible || isAdminRoute || !isHomePage) return null;

  return (
    <>
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          aria-label="Use your current location"
          className="fixed right-3 top-20 z-40 flex h-11 w-11 items-center justify-center sm:right-4 sm:top-24"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-gold-400/30" />
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/50 bg-navy-900 text-gold-400 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.9)] transition active:scale-95">
            <FiMapPin className="h-5 w-5" />
          </span>
        </button>
      )}

      <div
        className={`fixed right-3 top-20 z-40 w-[calc(100%-1.5rem)] max-w-[260px] sm:right-4 sm:top-24 sm:max-w-[280px] ${
          expanded ? "block" : "hidden"
        }`}
      >
        <div className="relative flex flex-col gap-2.5 rounded-2xl border border-navy-700/60 bg-navy-900 p-3.5 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.9)] sm:p-4">
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute right-2.5 top-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted transition active:scale-[0.98] hover:text-cream"
          >
            <FiX className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center gap-2.5 pr-6">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold-500/40 bg-gold-400/10">
              <FiMapPin className="h-3.5 w-3.5 text-gold-400" />
            </span>
            <p className="font-display text-sm text-cream">
              {manual ? "Set your location" : "Use your current location?"}
            </p>
          </div>

          {manual ? (
            <>
              <StateCitySearchFields
                state={manualState}
                city={manualCity}
                onChange={({ state, city }) => {
                  setManualState(state);
                  setManualCity(city);
                }}
                inputClassName={DARK_INPUT_CLASS}
                labelClassName={DARK_LABEL_CLASS}
                menuClassName={DARK_MENU_CLASS}
                optionClassName={DARK_OPTION_CLASS}
              />
              <div className="mt-0.5 flex flex-col gap-2">
                <button
                  onClick={handleManualSave}
                  disabled={!manualState || !manualCity}
                  className="tracked-label w-full rounded-lg bg-gold-400 px-4 py-2 text-[11px] text-navy-950 shadow-lg shadow-gold-400/10 transition active:scale-[0.98] hover:bg-gold-300 hover:shadow-gold-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save Location
                </button>
                <button
                  onClick={() => setManual(false)}
                  className="tracked-label w-full rounded-lg border border-navy-700/60 px-4 py-2 text-[11px] text-cream transition active:scale-[0.98] hover:border-gold-500/60 hover:text-gold-400"
                >
                  Back
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs leading-relaxed text-muted">
                Allow location access for better, more relevant property results near you.
              </p>

              <div className="mt-0.5 flex flex-col gap-2">
                <button
                  onClick={handleAllow}
                  disabled={requesting}
                  className="tracked-label w-full rounded-lg bg-gold-400 px-4 py-2 text-[11px] text-navy-950 shadow-lg shadow-gold-400/10 transition active:scale-[0.98] hover:bg-gold-300 hover:shadow-gold-400/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
                >
                  {requesting ? "Requesting…" : "Allow Location"}
                </button>
                <button
                  onClick={() => {
                    setManualState("");
                    setManualCity("");
                    setManual(true);
                  }}
                  className="tracked-label w-full rounded-lg border border-navy-700/60 px-4 py-2 text-[11px] text-cream transition active:scale-[0.98] hover:border-gold-500/60 hover:text-gold-400"
                >
                  Set City Manually
                </button>
                <button
                  onClick={dismiss}
                  className="tracked-label w-full text-center text-[11px] text-muted transition hover:text-cream"
                >
                  Not Now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
