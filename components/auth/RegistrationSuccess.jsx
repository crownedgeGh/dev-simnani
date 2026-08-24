"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegistrationSuccess({
  title,
  subtitle,
  idLabel,
  accountId,
  pending = false,
  pendingNote,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(accountId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-400 text-3xl text-gold-400">
        ✓
      </span>
      <div>
        <h1 className="font-display text-3xl text-cream sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
      </div>

      {pending && (
        <span className="tracked-label flex items-center gap-2 border border-gold-400/60 bg-gold-400/10 px-4 py-1.5 text-xs text-gold-400">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
          Pending Verification
        </span>
      )}

      <div className="w-full border border-navy-700/60 bg-navy-950 p-4">
        <p className="tracked-label text-xs text-muted">{idLabel}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-display text-lg tracking-widest text-gold-400">{accountId}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="tracked-label text-xs text-muted transition hover:text-gold-400"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      {pendingNote && <p className="text-xs text-muted">{pendingNote}</p>}

      <div className="flex w-full flex-col gap-3">
        <Link
          href={primaryHref}
          className="tracked-label bg-gold-400 px-6 py-4 text-center text-xs text-navy-950 transition hover:bg-gold-300"
        >
          {primaryLabel}
        </Link>
        <Link
          href={secondaryHref}
          className="tracked-label border border-navy-700/60 px-6 py-4 text-center text-xs text-cream transition hover:border-gold-400"
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
