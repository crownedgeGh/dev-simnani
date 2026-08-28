"use client";

import { useState } from "react";
import Link from "next/link";

export default function PropertyActionCard({ propertyId }) {
  const [showToast, setShowToast] = useState(false);

  function handleContactClick() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }

  return (
    <div className="border border-navy-700/60 bg-navy-900 p-6">
      <h3 className="font-display text-lg text-cream">Interested?</h3>
      <p className="mt-2 text-sm text-muted">
        Our advisory team will get back to you within 24 hours.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <Link
          href={`/property/${propertyId}/enquire`}
          className="tracked-label bg-gold-400 px-6 py-4 text-center text-xs text-navy-950 transition hover:bg-gold-300"
        >
          Send Enquiry
        </Link>
        <Link
          href={`/property/${propertyId}/schedule-visit`}
          className="tracked-label border border-navy-700/60 px-6 py-4 text-center text-xs text-cream transition hover:border-gold-400"
        >
          Schedule Site Visit
        </Link>
        <Link
          href="/request-callback"
          className="tracked-label border border-navy-700/60 px-6 py-4 text-center text-xs text-cream transition hover:border-gold-400"
        >
          Request Callback
        </Link>
      </div>

      <button
        type="button"
        onClick={handleContactClick}
        className="mt-6 flex w-full items-center gap-3 border-t border-navy-700/60 pt-6 text-left transition hover:opacity-80"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-700/60 font-display text-lg text-gold-400">
          A
        </div>
        <div>
          <p className="tracked-label text-xs text-gold-400">Contact Person</p>
          <p className="text-sm text-cream">Alexander Vance</p>
          <p className="tracked-label text-xs text-muted">Senior Advisor</p>
        </div>
      </button>

      {showToast && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 sm:bottom-8">
          <div className="tracked-label rounded-sm border border-gold-500/70 bg-navy-900 px-5 py-3 text-xs text-cream shadow-lg">
            The person will contact you soon.
          </div>
        </div>
      )}
    </div>
  );
}
