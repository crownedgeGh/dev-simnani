"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMobile, isMobileValid, generateAccountId } from "@/lib/auth";
import { inputClass, textareaClass } from "@/components/auth/inputStyles";

export default function EnquiryForm({ title: propertyTitle, backHref }) {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [enquiryId, setEnquiryId] = useState("");

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
      setEnquiryId(generateAccountId("ENQ"));
    }, 900);
  }

  if (enquiryId) {
    return (
      <div className="flex flex-col items-center gap-6 border border-navy-700/60 bg-navy-900 p-8 text-center sm:p-10">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-400 text-3xl text-gold-400">
          ✓
        </span>
        <div>
          <h1 className="font-display text-2xl text-cream sm:text-3xl">
            Enquiry Submitted Successfully
          </h1>
          <p className="mt-2 text-sm text-muted">
            Our team will contact you soon regarding your interest in {propertyTitle}.
          </p>
        </div>

        <div className="w-full border border-navy-700/60 bg-navy-950 p-4 text-left">
          <Row label="Enquiry ID" value={enquiryId} />
          <Row label="Property" value={propertyTitle} />
          <Row label="Status" value="New" />
        </div>

        <div className="flex w-full flex-col gap-3">
          <Link
            href={backHref}
            className="tracked-label bg-gold-400 px-6 py-4 text-center text-xs text-navy-950 transition hover:bg-gold-300"
          >
            Return to Listing
          </Link>
          <Link
            href="/account/support"
            className="tracked-label border border-navy-700/60 px-6 py-4 text-center text-xs text-cream transition hover:border-gold-400"
          >
            View My Enquiries
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
        <h1 className="font-display text-2xl text-cream sm:text-3xl">Enquire Now</h1>
        <p className="mt-2 text-sm text-muted">
          Register your interest for exclusive access to {propertyTitle}.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="tracked-label text-xs text-cream/80">Property</label>
        <input type="text" readOnly value={propertyTitle} className={`${inputClass} text-muted`} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className="tracked-label text-xs text-cream/80">
          Full Name <span className="text-gold-400">*</span>
        </label>
        <input
          id="fullName"
          type="text"
          placeholder="Jane Doe"
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
          rows={4}
          placeholder="I would like to arrange a private viewing..."
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
        {submitting ? "Submitting..." : "Submit Enquiry"}
      </button>
      <p className="text-center text-xs text-muted">
        By submitting, you agree to our{" "}
        <Link href="/legal/privacy-policy" className="text-gold-400 hover:text-gold-300">
          Privacy Policy
        </Link>
        .
      </p>
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
