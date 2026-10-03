"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdClose } from "react-icons/md";
import { getConsent, setConsent, CONSENT_EVENT } from "@/lib/consent";

export default function CookieConsentBanner() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const [reached, setReached] = useState(false);

  useEffect(() => {
    const check = () => setPending(!getConsent());
    check();
    window.addEventListener(CONSENT_EVENT, check);
    return () => window.removeEventListener(CONSENT_EVENT, check);
  }, []);

  useEffect(() => {
    const target = document.getElementById("featured-properties");
    if (!target) {
      setReached(true);
      return;
    }
    const check = () => setReached(target.getBoundingClientRect().top <= 0);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [pathname]);

  const visible = pending && reached;

  function decide(analytics) {
    setConsent(analytics);
    setVisible(false);
  }

  if (!visible || pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6 sm:justify-end sm:px-6 lg:px-8">
      <div className="flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-navy-700/60 bg-navy-900 px-4 py-2.5 text-center shadow-lg shadow-black/40 sm:text-left">
        <p className="text-xs text-muted">
          We use cookies.{" "}
          <Link href="/legal/privacy-policy" className="text-gold-400 hover:text-gold-300">
            Privacy Policy
          </Link>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => decide(false)}
            className="tracked-label rounded-full border border-gold-500/70 px-3 py-1.5 text-[11px] text-gold-400 transition hover:bg-gold-500/10"
          >
            Necessary Only
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            className="tracked-label rounded-full bg-gold-400 px-3 py-1.5 text-[11px] text-navy-950 transition hover:bg-gold-300"
          >
            Accept All
          </button>
          <button
            type="button"
            onClick={() => decide(false)}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:text-gold-400"
          >
            <MdClose className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
