"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMobile, isMobileValid, generateAccountId } from "@/lib/auth";
import { inputClass, textareaClass } from "@/components/auth/inputStyles";
import ChipGroup from "@/components/auth/ChipGroup";

const TIME_SLOTS = [
  { value: "10:00 AM", label: "10:00 AM" },
  { value: "12:00 PM", label: "12:00 PM" },
  { value: "2:00 PM", label: "2:00 PM" },
  { value: "4:00 PM", label: "4:00 PM" },
  { value: "6:00 PM", label: "6:00 PM" },
];

export default function ScheduleVisitForm({ title: propertyTitle, backHref }) {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [visitId, setVisitId] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!fullName.trim() || !isMobileValid(mobile) || !date || !time) {
      setError("Please fill in your name, mobile number, a date and a time.");
      return;
    }
    setError("");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setVisitId(generateAccountId("VIS"));
    }, 900);
  }

  if (visitId) {
    return (
      <div className="flex flex-col items-center gap-6 border border-navy-700/60 bg-navy-900 p-8 text-center sm:p-10">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-400 text-3xl text-gold-400">
          ✓
        </span>
        <div>
          <h1 className="font-display text-2xl text-cream sm:text-3xl">
            Site Visit Requested Successfully
          </h1>
          <p className="mt-2 text-sm text-muted">Our team will contact you to confirm the visit.</p>
        </div>

        <div className="w-full border border-navy-700/60 bg-navy-950 p-4 text-left">
          <Row label="Property" value={propertyTitle} />
          <Row label="Date" value={date} />
          <Row label="Time" value={time} />
          <Row label="Status" value="Requested" />
          <Row label="Visit ID" value={visitId} />
        </div>

        <div className="flex w-full flex-col gap-3">
          <Link
            href={backHref}
            className="tracked-label bg-gold-400 px-6 py-4 text-center text-xs text-navy-950 transition hover:bg-gold-300"
          >
            Back to Property
          </Link>
          <Link
            href="/account/site-visits"
            className="tracked-label border border-navy-700/60 px-6 py-4 text-center text-xs text-cream transition hover:border-gold-400"
          >
            View My Visits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-8 sm:p-10"
    >
      <div>
        <h1 className="font-display text-2xl text-cream sm:text-3xl">Schedule Site Visit</h1>
        <p className="mt-2 text-sm text-muted">
          Choose a convenient date and time to visit {propertyTitle}.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="date" className="tracked-label text-xs text-cream/80">
          Preferred Date <span className="text-gold-400">*</span>
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="tracked-label text-xs text-cream/80">
          Preferred Time <span className="text-gold-400">*</span>
        </label>
        <ChipGroup options={TIME_SLOTS} value={time} onChange={setTime} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className="tracked-label text-xs text-cream/80">
          Full Name <span className="text-gold-400">*</span>
        </label>
        <input
          id="fullName"
          type="text"
          placeholder="e.g. Alexander Sterling"
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
        <label htmlFor="message" className="tracked-label text-xs text-cream/80">
          Message <span className="normal-case tracking-normal text-muted">(Optional)</span>
        </label>
        <textarea
          id="message"
          rows={3}
          placeholder="Specific requirements or questions..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={textareaClass}
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="tracked-label mt-2 bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Requesting..." : "Confirm Site Visit"}
      </button>
    </form>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-navy-700/60 py-2 last:border-b-0">
      <span className="tracked-label text-xs text-muted">{label}</span>
      <span className="text-sm text-cream">{value}</span>
    </div>
  );
}
