"use client";

import { useState, useEffect } from "react";
import { MdCall, MdContentCopy, MdCheck, MdShare } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";
import AuthGateModal from "@/components/auth/AuthGateModal";

const FALLBACK_MOBILE = "+91 98765 43210";

export default function PropertyActionCard({ propertyId, contactName, contactRole, contactMobile }) {
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [numberRevealed, setNumberRevealed] = useState(false);
  const [numberEntered, setNumberEntered] = useState(false);
  const [numberCopied, setNumberCopied] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShareUrl(`${window.location.origin}/property/${propertyId}`);
    }, 0);
    return () => clearTimeout(timer);
  }, [propertyId]);

  const phone = contactMobile || FALLBACK_MOBILE;
  const initial = (contactName || "A").trim().charAt(0).toUpperCase();

  async function handleInterested() {
    if (!isAuthenticated) {
      setShowAuthGate(true);
      return;
    }
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
    } catch {
      // best-effort — still show the callback confirmation
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }

  function handleCallPerson(e) {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowAuthGate(true);
    }
  }

  function handleShowNumber() {
    if (!isAuthenticated) {
      setShowAuthGate(true);
      return;
    }
    setNumberRevealed(true);
    requestAnimationFrame(() => setNumberEntered(true));
  }

  async function handleCopyNumber() {
    try {
      await navigator.clipboard.writeText(phone);
    } catch {
      // Clipboard API unavailable — silently ignore in demo mode
    }
    setNumberCopied(true);
    setTimeout(() => setNumberCopied(false), 2000);
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Clipboard API unavailable — silently ignore in demo mode
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border border-navy-700/60 bg-navy-900 p-6">
      <h3 className="font-display text-lg text-cream">Interested?</h3>
      <p className="mt-2 text-sm text-muted">
        Our advisory team will get back to you within 24 hours.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleInterested}
          className="tracked-label bg-gold-400 px-6 py-4 text-center text-xs text-navy-950 transition hover:bg-gold-300"
        >
          I&apos;m Interested
        </button>
        {/* Mobile (<640px): Call Person opens the dialpad directly */}
        <a
          href={`tel:${phone.replace(/\s+/g, "")}`}
          onClick={handleCallPerson}
          className="tracked-label flex min-h-[44px] items-center justify-center gap-2 border border-navy-700/60 px-6 py-4 text-center text-xs text-cream transition hover:border-gold-400 sm:hidden"
        >
          <MdCall className="h-4 w-4 shrink-0 text-gold-400" />
          Call Now
        </a>

        {/* Tablet & up (>=640px): Show Number with copy */}
        <div className="hidden sm:block">
          {!numberRevealed ? (
            <button
              type="button"
              onClick={handleShowNumber}
              className="tracked-label flex min-h-[44px] w-full items-center justify-center gap-2 border border-navy-700/60 px-6 py-4 text-center text-xs text-cream transition hover:border-gold-400"
            >
              <MdCall className="h-4 w-4 shrink-0 text-gold-400" />
              Call Now
            </button>
          ) : (
            <div
              className={`flex min-h-[44px] items-center gap-2 border border-navy-700/60 bg-navy-950 py-2 pl-4 pr-2 transition-all duration-300 ease-out ${
                numberEntered ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
            >
              <span className="min-w-0 flex-1 truncate text-sm text-cream">{phone}</span>
              <button
                type="button"
                onClick={handleCopyNumber}
                aria-label="Copy phone number"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border transition active:scale-95 ${
                  numberCopied
                    ? "border-gold-400 bg-gold-400 text-navy-950"
                    : "border-navy-700/60 text-gold-400 hover:border-gold-400"
                }`}
              >
                {numberCopied ? <MdCheck className="h-4 w-4" /> : <MdContentCopy className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-navy-700/60 pt-5">
        <p className="tracked-label flex items-center gap-2 text-xs text-muted">
          <MdShare className="h-4 w-4 shrink-0 text-gold-400" />
          Share This Property
        </p>
        <div className="mt-3 flex items-center gap-2 border border-navy-700/60 bg-navy-950 p-2">
          <span className="min-w-0 flex-1 truncate px-2 text-xs text-cream/80">
            {shareUrl || "Generating link…"}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy property link"
            className={`flex h-10 w-10 shrink-0 items-center justify-center border transition ${
              copied
                ? "border-gold-400 bg-gold-400 text-navy-950"
                : "border-navy-700/60 text-cream hover:border-gold-400 hover:text-gold-400"
            }`}
          >
            {copied ? <MdCheck className="h-4 w-4" /> : <MdContentCopy className="h-4 w-4" />}
          </button>
        </div>
        {copied && <p className="mt-2 text-xs text-gold-400">Link copied to clipboard!</p>}
      </div>

      <div className="mt-6 flex items-center gap-3 border-t border-navy-700/60 pt-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-700/60 font-display text-lg text-gold-400">
          {initial}
        </div>
        <div>
          <p className="tracked-label text-xs text-gold-400">Contact Person</p>
          <p className="text-sm text-cream">{contactName || "Alexander Vance"}</p>
          <p className="tracked-label text-xs text-muted">{contactRole || "Senior Advisor"}</p>
        </div>
      </div>

      {showToast && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 sm:bottom-8">
          <div className="tracked-label rounded-sm border border-gold-500/70 bg-navy-900 px-5 py-3 text-xs text-cream shadow-lg">
            You will get a callback soon.
          </div>
        </div>
      )}

      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        title="Contact This Property"
        subtitle="Sign in or create a free account to view contact details and connect with the owner."
      />
    </div>
  );
}
