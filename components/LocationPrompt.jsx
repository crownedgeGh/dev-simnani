"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FiMapPin, FiX } from "react-icons/fi";

const STORAGE_KEY = "se_location_prompt_seen";

export default function LocationPrompt() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

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
        dismiss();
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
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm sm:px-0 sm:pb-0">
      <div className="flex items-start gap-3 rounded-sm border border-navy-700/60 bg-navy-900 p-4 shadow-2xl">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-500/40 bg-gold-400/10">
          <FiMapPin className="h-4 w-4 text-gold-400" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm text-cream">
            Use your current location?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Allow location access for better, more relevant property results near you.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleAllow}
              disabled={requesting}
              className="tracked-label bg-gold-400 px-3 py-2 text-[11px] text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {requesting ? "Requesting…" : "Allow Location"}
            </button>
            <button
              onClick={dismiss}
              className="tracked-label border border-navy-700/60 px-3 py-2 text-[11px] text-cream transition hover:border-gold-500/60 hover:text-gold-400"
            >
              Not Now
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 text-muted transition hover:text-cream"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
