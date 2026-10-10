"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { MdCall, MdCheck, MdContentCopy } from "react-icons/md";

const VENDOR_NUMBER = "9993512100";

// Hardcoded vendor contact for Farming Land / Industrial pages (Task 5).
export default function VendorContactCard() {
  const [showNumber, setShowNumber] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(`+91${VENDOR_NUMBER}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-navy-700/60 bg-navy-900 p-6 sm:flex-row">
      <div>
        <p className="tracked-label text-xs text-gold-400">Need Help Choosing?</p>
        <p className="mt-1 font-display text-xl text-cream">Connect with Service Provider</p>
      </div>
      <div className="flex w-full gap-3 sm:w-auto">
        {/* Mobile: tel: link opens the dialpad directly */}
        <a
          href={`tel:+91${VENDOR_NUMBER}`}
          className="tracked-label flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-gold-500/70 px-6 text-xs text-gold-400 transition hover:bg-gold-500/10 sm:hidden"
        >
          <MdCall className="h-4 w-4" /> Call
        </a>
        {/* Web/tablet: reveal the number instead of dialing */}
        {showNumber ? (
          <button
            type="button"
            onClick={handleCopy}
            className="tracked-label hidden h-12 flex-none items-center justify-center gap-2 rounded-full border border-gold-500/70 px-6 text-xs text-gold-400 transition hover:bg-gold-500/10 sm:flex"
          >
            {copied ? <MdCheck className="h-4 w-4" /> : <MdContentCopy className="h-4 w-4" />}
            +91 {VENDOR_NUMBER}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowNumber(true)}
            className="tracked-label hidden h-12 flex-none items-center justify-center gap-2 rounded-full border border-gold-500/70 px-6 text-xs text-gold-400 transition hover:bg-gold-500/10 sm:flex"
          >
            <MdCall className="h-4 w-4" /> Call Now
          </button>
        )}
        <a
          href={`https://wa.me/91${VENDOR_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="tracked-label flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gold-400 px-6 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 sm:flex-none"
        >
          <FaWhatsapp className="h-4 w-4" /> WhatsApp
        </a>
      </div>
    </div>
  );
}
