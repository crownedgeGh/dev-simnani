"use client";

import Image from "next/image";
import Link from "next/link";
import { MdEmail } from "react-icons/md";

const ROW_GRID =
  "grid grid-cols-1 gap-4 sm:grid-cols-[1.6fr_0.8fr_0.9fr_0.9fr_1fr_1.1fr] sm:items-center sm:gap-3";

export default function BankDealsTable({ banks, onGetDeal }) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-navy-700/60 bg-navy-900">
      {/* Header row — desktop only */}
      <div className={`${ROW_GRID} hidden border-b border-navy-700/60 bg-navy-950/40 px-5 py-3 sm:grid`}>
        <span className="tracked-label text-[11px] text-muted">Bank Name</span>
        <span className="tracked-label text-[11px] text-muted">Rate of interest</span>
        <span className="tracked-label text-[11px] text-muted">Processing fees</span>
        <span className="tracked-label text-[11px] text-muted">Tenure</span>
        <span />
        <span />
      </div>

      <div className="divide-y divide-navy-700/60">
        {banks.map((bank) => (
          <div key={bank._id} className={`${ROW_GRID} relative px-5 py-5 ${bank.featured ? "pt-9" : ""}`}>
            {bank.featured && (
              <span className="tracked-label absolute left-5 top-2 rounded-full bg-gold-400/10 px-2 py-0.5 text-[9px] text-gold-400">
                Featured
              </span>
            )}

            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                <Image
                  src={bank.logo}
                  alt={`${bank.name} logo`}
                  width={56}
                  height={56}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-sm text-cream sm:text-base">{bank.name}</span>
            </div>

            <div className="flex items-baseline gap-3 sm:block">
              <span className="font-display text-xl text-cream">
                {bank.rate}
                <span className="text-sm text-muted">%</span>
              </span>
              <span className="text-xs text-muted sm:hidden">Rate of interest</span>
            </div>

            <div className="flex items-baseline gap-3 sm:block">
              <span className="text-cream">
                ₹{bank.fee.toLocaleString("en-IN")}
                <span className="ml-1 text-xs text-muted">+ GST</span>
              </span>
              <span className="text-xs text-muted sm:hidden">Processing fees</span>
            </div>

            <div className="flex items-baseline gap-3 sm:block">
              <span className="text-cream">
                {bank.tenureMin}-{bank.tenureMax}
                <span className="ml-1 text-xs text-muted">years</span>
              </span>
              <span className="text-xs text-muted sm:hidden">Tenure</span>
            </div>

            <a
              href={`mailto:info.crownedge@gmail.com?subject=${encodeURIComponent(`${bank.name} home loan enquiry`)}`}
              className="flex min-h-[44px] items-center gap-1.5 text-sm text-muted transition hover:text-gold-400"
            >
              <MdEmail className="h-4 w-4" />
              Email me
            </a>

            <div className="flex flex-col items-start gap-1.5 sm:items-end">
              <button
                type="button"
                onClick={() => onGetDeal(bank)}
                className="tracked-label flex min-h-[44px] w-full items-center justify-center rounded-md bg-gold-400 px-4 text-xs font-bold text-navy-950 transition hover:bg-gold-300 active:scale-[0.98] sm:w-auto"
              >
                Get me this deal
              </button>
              {bank.knowMoreHref && (
                <Link href={bank.knowMoreHref} className="text-xs text-gold-400 underline underline-offset-2">
                  Know More
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
