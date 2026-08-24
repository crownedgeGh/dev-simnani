"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMobile, isMobileValid, generateAccountId } from "@/lib/auth";
import { inputClass, selectClass } from "@/components/auth/inputStyles";

const TIME_OPTIONS = [
  { value: "morning", label: "Morning (9AM - 12PM)" },
  { value: "afternoon", label: "Afternoon (12PM - 5PM)" },
  { value: "evening", label: "Evening (5PM - 8PM)" },
];

export default function CallbackForm() {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [bestTime, setBestTime] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!fullName.trim() || !isMobileValid(mobile)) {
      setError("Please fill in your name and a valid mobile number.");
      return;
    }
    setError("");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setRequestId(generateAccountId("CB"));
    }, 900);
  }

  if (requestId) {
    return (
      <div className="flex flex-col items-center gap-6 border border-navy-700/60 bg-navy-900 p-8 text-center sm:p-10">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-400 text-3xl text-gold-400">
          ✓
        </span>
        <div>
          <h1 className="font-display text-2xl text-cream sm:text-3xl">Callback Requested</h1>
          <p className="mt-2 text-sm text-muted">
            An advisor will call you back{bestTime ? ` in the ${bestTime}` : " shortly"}.
          </p>
        </div>
        <p className="tracked-label text-xs text-gold-400">Reference ID: {requestId}</p>
        <Link
          href="/"
          className="tracked-label w-full bg-gold-400 px-6 py-4 text-center text-xs text-navy-950 transition hover:bg-gold-300"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-8 sm:p-10"
    >
      <div>
        <h1 className="font-display text-2xl text-cream sm:text-3xl">Request Callback</h1>
        <p className="mt-2 text-sm text-muted">
          Provide your details and an advisor will contact you shortly.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className="tracked-label text-xs text-cream/80">
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
        <div className="flex items-center border border-navy-700/60 bg-navy-950 px-4 transition focus-within:border-gold-400">
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
        <label htmlFor="bestTime" className="tracked-label text-xs text-cream/80">
          Best Time to Call{" "}
          <span className="normal-case tracking-normal text-muted">(Optional)</span>
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

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="tracked-label mt-2 bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Request Callback"}
      </button>
      <p className="text-center text-xs text-muted">Your privacy is assured.</p>
    </form>
  );
}
