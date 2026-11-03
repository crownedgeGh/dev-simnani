"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Set by /list-free when a visitor picks a role; cleared once the tour is seen.
export const POST_TOUR_KEY = "se_post_tour";

// First visible of: desktop button, mobile-menu button, hamburger (menu closed).
function findTarget() {
  const ids = ["#navbar-post-property-btn", "#mobile-post-property-btn", 'button[aria-label="Toggle navigation menu"]'];
  for (const sel of ids) {
    const el = document.querySelector(sel);
    const r = el?.getBoundingClientRect();
    if (r && r.width > 0 && r.height > 0) return { rect: r, isMenu: sel.startsWith("button") };
  }
  return null;
}

export default function PostPropertyTour() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [target, setTarget] = useState(null);

  const eligible = isAuthenticated && !pathname.startsWith("/auth") && !pathname.startsWith("/admin");

  function done() {
    try {
      localStorage.removeItem(POST_TOUR_KEY);
    } catch {}
    setTarget(null);
  }

  // Poll: the flag is set from another page and the navbar menu opens/closes
  // without events we can hook.
  useEffect(() => {
    if (!eligible) return;
    const tick = () => {
      let on = false;
      try {
        on = localStorage.getItem(POST_TOUR_KEY) === "1";
      } catch {}
      if (on && pathname.startsWith("/post-property")) return done();
      setTarget(on ? findTarget() : null);
    };
    const t = setInterval(tick, 300);
    return () => clearInterval(t);
  }, [eligible, pathname]);

  if (!eligible || !target) return null;
  const { rect, isMenu } = target;
  const pad = 6;
  const tipWidth = Math.min(300, window.innerWidth - 24);
  const left = Math.max(12, Math.min(rect.left + rect.width / 2 - tipWidth / 2, window.innerWidth - tipWidth - 12));

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      <div
        className="absolute rounded-full border-2 border-gold-400"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          boxShadow: "0 0 0 9999px color-mix(in srgb, var(--color-navy-950) 80%, transparent), 0 0 24px var(--color-gold-400)",
        }}
      />
      <div
        className="pointer-events-auto absolute rounded-2xl border border-gold-500/60 bg-navy-900 p-4 shadow-2xl"
        style={{ top: rect.bottom + pad + 12, left, width: tipWidth }}
      >
        <p className="tracked-label text-xs text-gold-400">Account ready 🎉</p>
        <p className="mt-2 text-sm text-cream">
          {isMenu
            ? "Open the menu and tap “Post Your Property” to list your first property for free."
            : "Tap “Post Property” here to list your first property for free."}
        </p>
        <button
          type="button"
          onClick={done}
          className="tracked-label mt-3 min-h-[44px] w-full rounded-full bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
