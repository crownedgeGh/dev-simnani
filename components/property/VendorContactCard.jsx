"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { MdCall, MdClose, MdLocationOn } from "react-icons/md";
import SearchableSelect from "@/components/auth/SearchableSelect";
import { RTO_STATES, getCitiesForState } from "@/lib/cityRto";
import { getServiceTypeLabel } from "@/lib/serviceProviders";
import { formatMobile, isMobileValid, generateAccountId } from "@/lib/auth";
import { inputClass } from "@/components/auth/inputStyles";
import { trackEvent } from "@/lib/gtag";
import Turnstile from "@/components/shared/Turnstile";

// Section shown on /farming, /industrial, /properties and /commercial.
// Location is auto-detected via /api/geolocate (falls back to Raipur,
// Chhattisgarh) so the visitor only has to give Name + Mobile — the
// resulting lead is routed to admin with the detected city/state attached.
export default function VendorContactCard({
  serviceType = "civil-contractor",
}) {
  const label = getServiceTypeLabel(serviceType);
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [editingLocation, setEditingLocation] = useState(false);

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/geolocate")
      .then((res) => res.json())
      .then((loc) => {
        if (!cancelled && loc?.city && loc?.state) {
          setCity(loc.city);
          setState(loc.state);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const cityOptions = useMemo(
    () => (state ? getCitiesForState(state).map((c) => c.city) : []),
    [state],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    if (!fullName.trim() || !isMobileValid(mobile)) {
      setError("Please fill in your name and a valid mobile number.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/contractor-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          phone: mobile,
          serviceType,
          sourcePath: pathname,
          city,
          state,
          turnstileToken,
        }),
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.error || "Could not submit your request.");
      setRequestId(json.data.id || generateAccountId("CB"));
      trackEvent("generate_lead", {
        form_name: "vendor_contact",
        service_type: serviceType,
        city,
        state,
      });
    } catch (err) {
      setError(err.message || "Could not submit your request.");
    } finally {
      setSubmitting(false);
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
          {requestId ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-400 text-2xl text-gold-400">
                ✓
              </span>
              <p className="font-display text-xl text-cream">
                Request Received
              </p>
              <p className="text-sm text-muted">
                A verified {label.toLowerCase()} in {city} will call you
                shortly.
              </p>
              <p className="tracked-label text-xs text-gold-400">
                Reference ID: {requestId}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <p className="tracked-label text-xs text-muted">
                  Your Location
                </p>
                {editingLocation ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <SearchableSelect
                      id="vc-state"
                      value={state}
                      onChange={(next) => {
                        setState(next);
                        setCity("");
                      }}
                      options={RTO_STATES}
                      placeholder="Select your state"
                      searchPlaceholder="Search states…"
                    />
                    <SearchableSelect
                      id="vc-city"
                      value={city}
                      onChange={setCity}
                      options={cityOptions}
                      placeholder={
                        state ? "Select your city" : "Select a state first"
                      }
                      searchPlaceholder="Search cities…"
                      disabled={!state}
                      emptyMessage="No cities found for this state"
                    />
                  </div>
                ) : (
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-cream">
                    <MdLocationOn className="h-4 w-4 text-gold-400" />
                    <span className="text-gold-400">
                      {city || "…"}, {state || "…"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingLocation(true)}
                      className="text-xs text-gold-400 underline transition hover:text-gold-300"
                    >
                      Change
                    </button>
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="vc-fullName"
                  className="tracked-label text-xs text-cream/80"
                >
                  Full Name <span className="text-gold-400">*</span>
                </label>
                <input
                  id="vc-fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="vc-mobile"
                  className="tracked-label text-xs text-cream/80"
                >
                  Mobile Number <span className="text-gold-400">*</span>
                </label>
                <div className="flex items-center rounded-full border border-navy-700/60 bg-navy-950 px-4 transition focus-within:border-gold-400 focus-within:ring-4 focus-within:ring-gold-400/10">
                  <span className="text-sm text-muted">+91</span>
                  <input
                    id="vc-mobile"
                    type="tel"
                    inputMode="numeric"
                    placeholder="0000 000 000"
                    value={mobile}
                    onChange={(e) => setMobile(formatMobile(e.target.value))}
                    className="h-14 w-full bg-transparent px-3 text-cream placeholder:text-muted focus:outline-none"
                  />
                </div>
              </div>

              <Turnstile
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken("")}
              />

              {error && <p className="text-sm text-gold-300">{error}</p>}

              <button
                type="submit"
                disabled={submitting || !city || !state}
                className="tracked-label mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-6 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitting ? "Submitting…" : "Request a Call"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
