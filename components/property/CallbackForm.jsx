"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { formatMobile, isMobileValid, generateAccountId } from "@/lib/auth";
import { inputClass, selectClass, textareaClass } from "@/components/auth/inputStyles";
import BackButton from "@/components/layout/BackButton";
import { trackEvent } from "@/lib/gtag";
import Turnstile from "@/components/shared/Turnstile";

const TIME_OPTIONS = [
  { value: "morning", label: "Morning (9AM - 12PM)" },
  { value: "afternoon", label: "Afternoon (12PM - 5PM)" },
  { value: "evening", label: "Evening (5PM - 8PM)" },
];

// `serviceType` is set when the form is opened from a service provider
// section — the request is then persisted as a contractor lead so admin sees
// which role it came from. Without it the form stays the standalone
// /request-callback page and keeps its original local-only behaviour.
export default function CallbackForm({ serviceType = "", onClose, onSubmitted }) {
  const pathname = usePathname();
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [bestTime, setBestTime] = useState("");
  const [requirement, setRequirement] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!fullName.trim() || !isMobileValid(mobile)) {
      setError("Please fill in your name and a valid mobile number.");
      return;
    }
    setError("");
    setSubmitting(true);

    if (!serviceType) {
      setTimeout(() => {
        setSubmitting(false);
        setRequestId(generateAccountId("CB"));
        onSubmitted?.();
        trackEvent("generate_lead", {
          form_name: "request_callback",
          best_time: bestTime || undefined,
        });
      }, 900);
      return;
    }

    try {
      const res = await fetch("/api/contractor-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          phone: mobile,
          bestTime,
          serviceType,
          sourcePath: pathname,
          requirement,
          turnstileToken,
        }),
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.error || "Could not submit your request.");
      setRequestId(json.data.id);
      onSubmitted?.();
      trackEvent("generate_lead", {
        form_name: "request_callback",
        best_time: bestTime || undefined,
        service_type: serviceType,
      });
    } catch (err) {
      setError(err.message || "Could not submit your request.");
    } finally {
      setSubmitting(false);
    }
  }

  if (requestId) {
    return (
      <div
        className={`flex flex-col items-center gap-6 text-center ${
          onClose ? "" : "border border-navy-700/60 bg-navy-900 p-8 sm:p-10"
        }`}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-400 text-3xl text-gold-400">
          ✓
        </span>
        <div>
          <h1 className="font-display text-2xl text-cream sm:text-3xl">
            Callback Requested
          </h1>
          <p className="mt-2 text-sm text-muted">
            An advisor will call you back
            {bestTime ? ` in the ${bestTime}` : " shortly"}.
          </p>
        </div>
        <p className="tracked-label text-xs text-gold-400">
          Reference ID: {requestId}
        </p>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="tracked-label w-full rounded-full bg-gold-400 px-6 py-4 text-center text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 active:scale-[0.98]"
          >
            Done
          </button>
        ) : (
          <Link
            href="/"
            className="tracked-label w-full rounded-full bg-gold-400 px-6 py-4 text-center text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 active:scale-[0.98]"
          >
            Return Home
          </Link>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        onClose
          ? "flex flex-col gap-4"
          : "flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-8 sm:p-10"
      }
    >
      <div className="flex items-center gap-3">
        {!onClose && <BackButton />}
        <div>
          <h1 className="font-display text-2xl text-cream sm:text-3xl">
            Request Callback
          </h1>
          <p className="mt-2 text-sm text-muted">
            Provide your details and an advisor will contact you shortly.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="fullName"
          className="tracked-label text-xs text-cream/80"
        >
          Full Name <span className="text-gold-400">*</span>
        </label>
        <input
          id="fullName"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="mobile" className="tracked-label text-xs text-cream/80">
          Mobile Number <span className="text-gold-400">*</span>
        </label>
        <div className="flex items-center rounded-full border border-navy-700/60 bg-navy-950 px-4 transition focus-within:border-gold-400 focus-within:ring-4 focus-within:ring-gold-400/10">
          <span className="text-sm text-muted">+91</span>
          <input
            id="mobile"
            type="tel"
            inputMode="numeric"
            placeholder="0000 000 000"
            value={mobile}
            onChange={(e) => setMobile(formatMobile(e.target.value))}
            className="h-14 w-full bg-transparent px-3 text-cream placeholder:text-muted focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="bestTime"
          className="tracked-label text-xs text-cream/80"
        >
          Best Time to Call{" "}
          <span className="normal-case tracking-normal text-muted">
            (Optional)
          </span>
        </label>
        <select
          id="bestTime"
          value={bestTime}
          onChange={(e) => setBestTime(e.target.value)}
          className={selectClass}
        >
          <option value="">Select a time</option>
          {TIME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {serviceType && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="requirement"
            className="tracked-label text-xs text-cream/80"
          >
            Your Requirement{" "}
            <span className="normal-case tracking-normal text-muted">
              (Optional)
            </span>
          </label>
          <textarea
            id="requirement"
            rows={3}
            placeholder="Tell us what you need…"
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            maxLength={1000}
            className={textareaClass}
          />
        </div>
      )}

      {serviceType && (
        <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken("")} />
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="tracked-label mt-2 rounded-full bg-gold-400 px-6 py-4 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Request Callback"}
      </button>
      <p className="text-center text-xs text-muted">Your privacy is assured.</p>
    </form>
  );
}
