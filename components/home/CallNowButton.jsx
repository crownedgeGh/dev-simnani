"use client";

import { useState } from "react";
import { MdPhone, MdContentCopy, MdCheck } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";
import AuthGateModal from "@/components/auth/AuthGateModal";

export default function CallNowButton({ mobile, onRevealChange }) {
  const { isAuthenticated } = useAuth();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);

  if (!mobile) return null;

  function handleCopy(e) {
    e.preventDefault();
    navigator.clipboard.writeText(mobile).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleMobileTap(e) {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowAuthGate(true);
    }
  }

  function handleReveal() {
    if (!isAuthenticated) {
      setShowAuthGate(true);
      return;
    }
    setRevealed(true);
    onRevealChange?.(true);
  }

  return (
    <>
      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        title="Contact This Agent"
        subtitle="Sign in or create a free account to view contact details and connect."
      />

      {/* Mobile: tel: link → opens dialpad (gated behind auth) */}
      <a
        href={`tel:${mobile}`}
        onClick={handleMobileTap}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gold-500/50 bg-gold-400/10 py-2.5 text-sm font-semibold text-gold-400 transition hover:bg-gold-400/20 active:scale-95 sm:hidden"
        aria-label="Call agent"
      >
        <MdPhone size={17} />
        Call Now
      </a>

      {/* Desktop: reveal number → call link + copy button */}
      <div className="hidden sm:block">
        {revealed && isAuthenticated ? (
          <div className="flex items-center gap-2">
            <a
              href={`tel:${mobile}`}
              className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-gold-500/50 bg-gold-400/10 py-2.5 text-sm font-semibold text-gold-400 transition hover:bg-gold-400/20"
              aria-label={`Call ${mobile}`}
            >
              <MdPhone size={17} className="shrink-0" />
              <span className="truncate">{mobile}</span>
            </a>
            <button
              onClick={handleCopy}
              title={copied ? "Copied!" : "Copy number"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-navy-700/60 bg-navy-800 text-muted transition hover:border-gold-500/50 hover:text-gold-400"
            >
              {copied ? (
                <MdCheck size={17} className="text-green-400" />
              ) : (
                <MdContentCopy size={16} />
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={handleReveal}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gold-500/50 bg-gold-400/10 py-2.5 text-sm font-semibold text-gold-400 transition hover:bg-gold-400/20 active:scale-95"
          >
            <MdPhone size={17} />
            Call Now
          </button>
        )}
      </div>
    </>
  );
}
