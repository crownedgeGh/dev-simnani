"use client";

import { useMemo, useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import {
  MdCall,
  MdCheck,
  MdContentCopy,
  MdClose,
  MdPhoneInTalk,
} from "react-icons/md";
import SearchableSelect from "@/components/auth/SearchableSelect";
import { RTO_STATES, getCitiesForState } from "@/lib/cityRto";
import { getServiceTypeLabel } from "@/lib/serviceProviders";
import CallbackRequestModal from "./CallbackRequestModal";

// Section shown on /farming, /industrial, /properties and /commercial.
// The provider label is dynamic (serviceType prop) and the contact list is
// loaded from /api/service-providers once the visitor picks state + city.
export default function VendorContactCard({
  serviceType = "civil-contractor",
}) {
  const label = getServiceTypeLabel(serviceType);

  const [open, setOpen] = useState(false);
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [result, setResult] = useState(null); // { data, scope } once loaded
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackSent, setCallbackSent] = useState(false);

  const cityOptions = useMemo(
    () => (state ? getCitiesForState(state).map((c) => c.city) : []),
    [state],
  );

  // Picking a new location invalidates whatever list is on screen.
  function resetList() {
    setResult(null);
    setError("");
  }

  async function loadContacts() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/service-providers?serviceType=${serviceType}&state=${encodeURIComponent(
          state,
        )}&city=${encodeURIComponent(city)}`,
      );
      const json = await res.json();
      if (!json.success)
        throw new Error(json.error || "Could not load contacts");
      setResult({ data: json.data, scope: json.scope });
    } catch (e) {
      setError(e.message || "Could not load contacts");
    } finally {
      setLoading(false);
    }
  }

  async function copyNumber(dial) {
    try {
      await navigator.clipboard.writeText(dial);
      setCopied(dial);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setError("Copy failed — long-press the number to copy it manually.");
    }
  }

  return (
    <div className="mt-10 rounded-2xl border border-navy-700/60 bg-navy-900 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="tracked-label text-xs text-gold-400">
            Need Help Choosing?
          </p>
          <p className="mt-1 font-display text-xl text-cream sm:text-2xl">
            Connect with a {label}
          </p>
          <p className="mt-1 text-sm text-muted">
            Verified {label.toLowerCase()}s in your city, ready to take your
            call.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="tracked-label flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-6 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 sm:w-auto sm:flex-none"
        >
          {open ? (
            <MdClose className="h-4 w-4" />
          ) : (
            <MdCall className="h-4 w-4" />
          )}
          {open ? "Close" : "Call Now"}
        </button>
      </div>

      {open && (
        <div className="mt-6 border-t border-navy-800 pt-6">
          <p className="tracked-label text-xs text-muted">
            Select your location
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SearchableSelect
              id="sp-state"
              value={state}
              onChange={(next) => {
                setState(next);
                setCity("");
                resetList();
              }}
              options={RTO_STATES}
              placeholder="Select your state"
              searchPlaceholder="Search states…"
            />
            <SearchableSelect
              id="sp-city"
              value={city}
              onChange={(next) => {
                setCity(next);
                resetList();
              }}
              options={cityOptions}
              placeholder={state ? "Select your city" : "Select a state first"}
              searchPlaceholder="Search cities…"
              disabled={!state}
              emptyMessage="No cities found for this state"
            />
          </div>

          <button
            type="button"
            disabled={!state || !city || loading}
            onClick={loadContacts}
            className="tracked-label mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-gold-500/70 px-6 text-xs text-gold-400 transition hover:bg-gold-500/10 disabled:cursor-not-allowed disabled:border-navy-700/60 disabled:text-muted disabled:hover:bg-transparent sm:w-auto"
          >
            <MdPhoneInTalk className="h-4 w-4" />
            {loading ? "Loading…" : "Show Contact Numbers"}
          </button>

          {error && <p className="mt-3 text-sm text-gold-300">{error}</p>}

          {result && (
            <div className="mt-5">
              <p className="tracked-label text-xs text-gold-400">
                {result.data.length} {label}
                {result.data.length === 1 ? "" : "s"}
                {result.scope === "city" ? ` in ${city}` : ` across ${state}`}
              </p>

              {result.data.length === 0 ? (
                <p className="mt-3 text-sm text-muted">
                  No verified {label.toLowerCase()} is listed for {state} yet.
                  Try another state or{" "}
                  {callbackSent ? (
                    <>
                      <span className="tracked-label text-xs text-gold-400">Callback request sent</span>.{" "}
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setCallbackOpen(true)}
                    className="text-gold-400 underline transition hover:text-gold-300"
                  >
                    {callbackSent ? "Request again" : "request a callback"}
                  </button>
                  {callbackSent ? "" : "."}
                </p>
              ) : (
                <ul className="mt-3 max-h-80 divide-y divide-navy-800 overflow-y-auto rounded-xl border border-navy-700/60 bg-navy-950">
                  {result.data.map((p) => {
                    const dial = `+91${p.mobile.replace(/\D/g, "")}`;
                    const wa = `https://wa.me/${dial.replace("+", "")}`;
                    return (
                      <li
                        key={p._id}
                        className="flex items-center justify-between gap-3 p-4 transition hover:bg-navy-900"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-cream">
                            {p.fullName}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {[p.city, p.state].filter(Boolean).join(", ")}
                            {p.yearsOfExperience
                              ? ` · ${p.yearsOfExperience} yrs exp`
                              : ""}
                          </p>
                        </div>

                        <div className="flex flex-none items-center gap-2">
                          {/* Mobile: tap to dial straight away */}
                          <a
                            href={`tel:${dial}`}
                            aria-label={`Call ${p.fullName}`}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400 text-navy-950 transition hover:bg-gold-300 sm:hidden"
                          >
                            <MdCall className="h-5 w-5" />
                          </a>
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`WhatsApp ${p.fullName}`}
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/70 text-gold-400 transition hover:bg-gold-500/10 sm:hidden"
                          >
                            <FaWhatsapp className="h-5 w-5" />
                          </a>

                          {/* Web / tablet: show the number with a copy button */}
                          <button
                            type="button"
                            onClick={() => copyNumber(dial)}
                            className="tracked-label hidden h-11 items-center gap-2 rounded-full border border-gold-500/70 px-4 text-xs text-gold-400 transition hover:bg-gold-500/10 sm:flex"
                          >
                            {copied === dial ? (
                              <MdCheck className="h-4 w-4" />
                            ) : (
                              <MdContentCopy className="h-4 w-4" />
                            )}
                            {dial}
                          </button>
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`WhatsApp ${p.fullName}`}
                            className="hidden h-11 w-11 items-center justify-center rounded-full bg-gold-400 text-navy-950 transition hover:bg-gold-300 sm:flex"
                          >
                            <FaWhatsapp className="h-5 w-5" />
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      <CallbackRequestModal
        isOpen={callbackOpen}
        onClose={() => setCallbackOpen(false)}
        serviceType={serviceType}
        onSubmitted={() => setCallbackSent(true)}
      />
    </div>
  );
}
