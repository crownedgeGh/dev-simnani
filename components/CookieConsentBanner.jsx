"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdClose } from "react-icons/md";
import { getConsent, setConsent, CONSENT_EVENT } from "@/lib/consent";

export default function CookieConsentBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => setVisible(!getConsent());
    check();
    window.addEventListener(CONSENT_EVENT, check);
    return () => window.removeEventListener(CONSENT_EVENT, check);
  }, []);

  function decide(analytics) {
    setConsent(analytics);
    setVisible(false);
  }

  if (!visible || pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-navy-700/60 bg-navy-900 px-4 pb-5 pt-10 sm:px-6 sm:pt-5 lg:px-8">
      <button
        type="button"
        onClick={() => decide(false)}
        aria-label="Close"
        className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center text-muted transition hover:text-gold-400"
      >
        <MdClose className="h-5 w-5" />
      </button>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-muted">
          We use essential local storage to run your account, saved properties and preferences, and
          (only with your consent) Google Analytics cookies to understand site usage. This complies
          with the Digital Personal Data Protection Act, 2023 and the IT Act, 2000 (SPDI Rules). See
          our{" "}
          <Link href="/legal/privacy-policy" className="text-gold-400 hover:text-gold-300">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => decide(false)}
            className="tracked-label min-h-11 border border-gold-500/70 px-4 py-2 text-xs text-gold-400 transition hover:bg-gold-500/10"
          >
            Necessary Only
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            className="tracked-label min-h-11 bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
