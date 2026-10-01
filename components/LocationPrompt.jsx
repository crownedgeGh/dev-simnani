"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FiMapPin, FiX } from "react-icons/fi";

const STORAGE_KEY = "se_location_prompt_seen";

export default function LocationPrompt() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) return;
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time check of localStorage, a client-only external store
        setVisible(true);
      }
    } catch {
      // localStorage unavailable — skip the prompt rather than nag every load
    }
  }, [isAdminRoute]);

  function dismiss() {
    setVisible(false);
  }

  function markGranted() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  function handleAllow() {
    if (!("geolocation" in navigator)) {
      dismiss();
      return;
    }
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          localStorage.setItem(
            "se_user_location",
            JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              savedAt: Date.now(),
            })
          );
        } catch {
          // ignore
        }
        setRequesting(false);
        markGranted();
      },
      () => {
        setRequesting(false);
        dismiss();
      },
      { timeout: 10000 }
    );
  }

  if (!visible || isAdminRoute) return null;

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
              Use your current location?
            </p>
          </div>

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
              onClick={dismiss}
              className="tracked-label w-full rounded-lg border border-navy-700/60 px-4 py-2 text-[11px] text-cream transition active:scale-[0.98] hover:border-gold-500/60 hover:text-gold-400"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
