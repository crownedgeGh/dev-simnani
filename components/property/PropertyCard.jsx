"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MdFavorite,
  MdFavoriteBorder,
  MdBed,
  MdBathtub,
  MdSquareFoot,
  MdLocationOn,
  MdAccessTime,
  MdCall,
  MdContentCopy,
  MdCheck,
} from "react-icons/md";
import { formatPostedDate } from "@/lib/properties";
import { useSavedPropertyIds } from "@/lib/savedProperties";
import { useAuth } from "@/context/AuthContext";
import AuthGateModal from "@/components/auth/AuthGateModal";

const FALLBACK_MOBILE = "+91 98765 43210";

export default function PropertyCard({ property, hideContactButton, emphasizeDetails }) {
  const { id, title, price, location, image, badge, beds, baths, area, roi, type, address, contact } =
    property;
  const isInvest = type === "invest";
  const isRent = type === "rent";
  const phone = contact?.mobile || property.mobile || FALLBACK_MOBILE;
  const [showToast, setShowToast] = useState(false);
  const [numberRevealed, setNumberRevealed] = useState(false);
  const [numberEntered, setNumberEntered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const postedLabel = formatPostedDate(property);
  const { isSaved, toggle } = useSavedPropertyIds();
  const { isAuthenticated } = useAuth();
  const saved = isSaved(id);

  function handleContactClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthGate(true);
      return;
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }

  function handleCallPerson(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthGate(true);
      return;
    }
    window.location.href = `tel:${phone.replace(/\s+/g, "")}`;
  }

  function handleShowNumber(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthGate(true);
      return;
    }
    setNumberRevealed(true);
    requestAnimationFrame(() => setNumberEntered(true));
  }

  async function handleCopyNumber(e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(phone);
    } catch {
      // Clipboard API unavailable — silently ignore in demo mode
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSaveClick(e) {
    e.preventDefault();
    e.stopPropagation();
    toggle(id);
  }

  return (
    <>
    <Link
      href={`/property/${id}`}
      className="group flex h-full flex-col overflow-hidden rounded-sm border border-navy-700/60 bg-navy-900 transition active:border-gold-500/50 active:shadow-[0_0_0_1px_var(--color-gold-500)] hover:border-gold-500/50 hover:shadow-[0_0_0_1px_var(--color-gold-500)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-active:scale-105 group-hover:scale-105"
        />
        {badge && (
          <span className="tracked-label absolute left-3 top-3 rounded-sm bg-gold-500 px-2 py-1 text-[10px] font-semibold text-navy-950">
            {badge}
          </span>
        )}
        <button
          type="button"
          aria-label={saved ? "Remove from saved properties" : "Save property"}
          aria-pressed={saved}
          onClick={handleSaveClick}
          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-navy-950/70 transition active:scale-110 active:text-gold-400 hover:scale-110 hover:text-gold-400 ${
            saved ? "text-gold-400" : "text-cream"
          }`}
        >
          {saved ? <MdFavorite className="h-6 w-6" /> : <MdFavoriteBorder className="h-6 w-6" />}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg text-cream">{title}</h3>
        <p className="mt-1 flex items-start gap-1 text-sm text-muted">
          <MdLocationOn className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {address || location}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="font-sans text-xl font-semibold text-gold-400">{price}</p>
          {postedLabel && (
            <p className="flex items-center gap-1 text-xs text-muted">
              <MdAccessTime className="h-3.5 w-3.5 shrink-0" />
              {postedLabel}
            </p>
          )}
        </div>

        <div
          className={`mt-4 flex items-center gap-4 text-muted ${
            emphasizeDetails ? "text-sm" : "text-xs"
          }`}
        >
          {isInvest ? (
            <span>{roi}</span>
          ) : (
            <>
              {beds > 0 && (
                <span
                  className={`flex items-center gap-1 ${
                    emphasizeDetails ? "font-semibold text-cream" : ""
                  }`}
                >
                  <MdBed className={emphasizeDetails ? "h-4 w-4 shrink-0" : "h-3.5 w-3.5 shrink-0"} />
                  {beds} {emphasizeDetails ? "BHK" : "Beds"}
                </span>
              )}
              {!emphasizeDetails && baths > 0 && (
                <span className="flex items-center gap-1">
                  <MdBathtub className="h-3.5 w-3.5 shrink-0" />
                  {baths} Baths
                </span>
              )}
              <span
                className={`flex items-center gap-1 ${
                  emphasizeDetails ? "font-semibold text-cream" : ""
                }`}
              >
                <MdSquareFoot className={emphasizeDetails ? "h-4 w-4 shrink-0" : "h-3.5 w-3.5 shrink-0"} />
                {area}
              </span>
            </>
          )}
        </div>

        {!hideContactButton && (
          <div className="mt-auto pt-5">
            {isRent ? (
              <>
                {/* Mobile (<640px): Call Person opens the dialpad directly */}
                <button
                  type="button"
                  onClick={handleCallPerson}
                  className="tracked-label flex min-h-[44px] w-full items-center justify-center gap-2 border border-gold-500/70 py-2.5 text-center text-xs text-gold-400 transition active:bg-gold-500 active:text-navy-950 hover:bg-gold-500 hover:text-navy-950 sm:hidden"
                >
                  <MdCall className="h-4 w-4 shrink-0" />
                  Call Person
                </button>

                {/* Tablet & up (>=640px): Show Number with copy */}
                <div className="hidden sm:block">
                  {!numberRevealed ? (
                    <button
                      type="button"
                      onClick={handleShowNumber}
                      className="tracked-label flex min-h-[44px] w-full items-center justify-center gap-2 border border-gold-500/70 py-2.5 text-center text-xs text-gold-400 transition active:bg-gold-500 active:text-navy-950 hover:bg-gold-500 hover:text-navy-950"
                    >
                      <MdCall className="h-4 w-4 shrink-0" />
                      Show Number
                    </button>
                  ) : (
                    <div
                      className={`flex min-h-[44px] items-center gap-2 border border-gold-500/70 bg-navy-950 py-2 pl-4 pr-2 transition-all duration-300 ease-out ${
                        numberEntered ? "scale-100 opacity-100" : "scale-95 opacity-0"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate text-sm text-cream">{phone}</span>
                      <button
                        type="button"
                        onClick={handleCopyNumber}
                        aria-label="Copy phone number"
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border transition active:scale-95 ${
                          copied
                            ? "border-gold-400 bg-gold-400 text-navy-950"
                            : "border-navy-700/60 text-gold-400 hover:border-gold-400"
                        }`}
                      >
                        {copied ? <MdCheck className="h-4 w-4" /> : <MdContentCopy className="h-4 w-4" />}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={handleContactClick}
                className="tracked-label flex min-h-[44px] w-full items-center justify-center border border-gold-500/70 py-2.5 text-center text-xs text-gold-400 transition active:bg-gold-500 active:text-navy-950 hover:bg-gold-500 hover:text-navy-950"
              >
                Contact Person
              </button>
            )}
          </div>
        )}
      </div>

      {showToast && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 sm:bottom-8">
          <div className="tracked-label rounded-sm border border-gold-500/70 bg-navy-900 px-5 py-3 text-xs text-cream shadow-lg">
            The person will contact you soon.
          </div>
        </div>
      )}
    </Link>
    <AuthGateModal
      isOpen={showAuthGate}
      onClose={() => setShowAuthGate(false)}
      title="Contact This Property"
      subtitle="Sign in or create a free account to view contact details and connect with the owner."
    />
    </>
  );
}
