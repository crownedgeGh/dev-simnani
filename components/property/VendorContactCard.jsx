"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { MdCall, MdClose, MdLocationOn, MdMyLocation } from "react-icons/md";
import SearchableSelect from "@/components/auth/SearchableSelect";
import { RTO_STATES, getCitiesForState, normalizeCityState } from "@/lib/cityRto";
import { getServiceTypeLabel } from "@/lib/serviceProviders";
import { formatMobile, isMobileValid, generateAccountId } from "@/lib/auth";
import { inputClass } from "@/components/auth/inputStyles";
import { trackEvent } from "@/lib/gtag";
import { useAuth } from "@/context/AuthContext";
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
  const { user } = useAuth();

  // A logged-in user's saved profile city/state is a trusted source — skip
  // IP/GPS detection entirely and use it directly when present.
  const profileLocation = useMemo(
    () => normalizeCityState(user?.city, user?.state),
    [user],
  );

  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [editingLocation, setEditingLocation] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [geoGranted, setGeoGranted] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [siteLocation, setSiteLocation] = useState(null);

  // The home page's own "Use your current location?" prompt (LocationPrompt)
  // already asked for and saved se_user_city/se_user_state once the visitor
  // allowed it — reuse that directly instead of asking again here.
  useEffect(() => {
    Promise.resolve()
      .then(() => {
        const matched = normalizeCityState(
          localStorage.getItem("se_user_city"),
          localStorage.getItem("se_user_state"),
        );
        if (matched) setSiteLocation(matched);
      })
      .catch(() => {});
  }, []);

  const knownLocation = siteLocation || profileLocation;

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState("");

  const cityOptions = useMemo(
    () => (state ? getCitiesForState(state).map((c) => c.city) : []),
    [state],
  );

  // Once the browser already has a granted geolocation permission for this
  // site, the "Current City" button has nothing left to do — hide it. The
  // Permissions API gives a live read where supported; Safari doesn't
  // support querying "geolocation" there, so a flag saved after our own
  // successful grant (below) covers it on the next visit too.
  useEffect(() => {
    const localGranted = localStorage.getItem("se_geo_granted") === "true";
    let status;
    const query = navigator.permissions?.query
      ? navigator.permissions.query({ name: "geolocation" })
      : Promise.resolve(null);
    query
      .then((s) => {
        status = s;
        if (status) {
          setGeoGranted(status.state === "granted");
          status.onchange = () => setGeoGranted(status.state === "granted");
        } else if (localGranted) {
          setGeoGranted(true);
        }
      })
      .catch(() => {
        if (localGranted) setGeoGranted(true);
      });
    return () => {
      if (status) status.onchange = null;
    };
  }, []);

  // GPS resolves in one step once permission is already granted — no popup,
  // so it's cheap enough to run automatically instead of making the visitor
  // click a button for something the browser can already answer silently.
  function fetchGpsLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationError("Location is not supported on this browser.");
        resolve(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`,
            );
            const json = await res.json();
            const matched = normalizeCityState(
              json.city || json.locality,
              json.principalSubdivision,
            );
            if (matched) {
              setCity(matched.city);
              setState(matched.state);
              setGeoGranted(true);
              localStorage.setItem("se_geo_granted", "true");
              resolve(true);
            } else {
              setLocationError("Could not match your location to a known city.");
              resolve(false);
            }
          } catch {
            setLocationError("Could not look up your location. Try again.");
            resolve(false);
          }
        },
        () => {
          setLocationError("Location permission denied.");
          resolve(false);
        },
        { timeout: 8000 },
      );
    });
  }

  // IP lookup only gets the ISP's registered city, which is unreliable on
  // mobile data — used only as the fallback when GPS permission isn't
  // already granted, to avoid popping the browser's permission prompt.
  function fetchIpLocation() {
    return fetch("/api/geolocate")
      .then((res) => res.json())
      .then((loc) => {
        if (loc?.city && loc?.state) {
          setCity(loc.city);
          setState(loc.state);
        }
      })
      .catch(() => {});
  }

  // First "Call Now" click resolves location once: a location already
  // granted/saved elsewhere on the site (home page prompt, or the logged-in
  // profile) wins outright, otherwise silently via GPS if permission is
  // already granted, otherwise via the no-popup IP lookup.
  async function handleToggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && !city && !state) {
      if (knownLocation) {
        setCity(knownLocation.city);
        setState(knownLocation.state);
        return;
      }
      setFetchingLocation(true);
      setLocationError("");
      await (geoGranted ? fetchGpsLocation() : fetchIpLocation());
      setFetchingLocation(false);
    }
  }

  async function handleUseExactLocation() {
    setLocating(true);
    setLocationError("");
    const ok = await fetchGpsLocation();
    if (ok) setEditingLocation(false);
    setLocating(false);
  }

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
          onClick={handleToggleOpen}
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
                  <div className="mt-3 rounded-xl border border-navy-700/60 bg-navy-950 p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    <button
                      type="button"
                      onClick={() => setEditingLocation(false)}
                      disabled={!city || !state}
                      className="tracked-label mt-3 text-xs text-gold-400 transition hover:text-gold-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-700/60 bg-navy-950 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm text-cream">
                      <MdLocationOn className="h-5 w-5 flex-none text-gold-400" />
                      <span className="font-medium text-gold-400">
                        {fetchingLocation
                          ? "Fetching location…"
                          : `${city || "…"}, ${state || "…"}`}
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      {!geoGranted && !knownLocation && (
                        <button
                          type="button"
                          onClick={handleUseExactLocation}
                          disabled={locating}
                          className="tracked-label flex items-center gap-1.5 rounded-full border border-gold-500/70 px-3 py-2 text-[10px] text-gold-400 transition hover:bg-gold-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <MdMyLocation className="h-3.5 w-3.5" />
                          {locating ? "Locating…" : "Current City"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingLocation(true)}
                        className="tracked-label rounded-full border border-navy-700/60 px-3 py-2 text-[10px] text-muted transition hover:border-gold-500/70 hover:text-gold-400"
                      >
                        Change
                      </button>
                    </span>
                  </div>
                )}
                {locationError && (
                  <p className="mt-2 text-xs text-gold-300">{locationError}</p>
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
