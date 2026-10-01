"use client";

import { useState } from "react";
import { MdPerson, MdPhone, MdEmail, MdMessage, MdCheckCircle, MdSend } from "react-icons/md";
import { formatMobile, isMobileValid } from "@/lib/auth";

const USER_TYPE_OPTIONS = [
  { value: "buyer", label: "I'm a Buyer" },
  { value: "tenant", label: "I'm a Tenant" },
  { value: "agent", label: "I'm an Agent" },
  { value: "investor", label: "I'm an Investor" },
  { value: "other", label: "Other" },
];

export default function ContactForm({
  propertyTitle = "",
  source = "Website",
  compact = false,
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    propertyTitle
      ? `Hello, I am interested in [${propertyTitle}]`
      : "Hello, I am interested in a property."
  );
  const [userType, setUserType] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!isMobileValid(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          message: message.trim(),
          userType: userType || "buyer",
          source,
          propertyTitle,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSubmitted(true);
        onSuccess?.();
      } else {
        setError(json.error || "Submission failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // --- Success state ---
  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center border border-gold-400/60 bg-gold-400/10">
          <MdCheckCircle className="h-7 w-7 text-gold-400" />
        </div>
        <div>
          <p className="font-display text-lg text-cream sm:text-xl">
            Inquiry Received!
          </p>
          <p className="mt-1 text-sm text-muted">
            Our team will call you back shortly.
          </p>
        </div>
        {!compact && (
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setName("");
              setPhone("");
              setEmail("");
              setMessage(
                propertyTitle
                  ? `Hello, I am interested in [${propertyTitle}]`
                  : "Hello, I am interested in a property."
              );
              setUserType("");
            }}
            className="tracked-label text-xs text-gold-400 transition hover:text-gold-300"
          >
            Submit Another Enquiry
          </button>
        )}
      </div>
    );
  }

  // --- Form ---
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
      {/* Name */}
      <div className="relative">
        <MdPerson className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          id="cf-name"
          type="text"
          placeholder="Your Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 w-full border border-navy-700/60 bg-navy-950 pl-10 pr-4 text-sm text-cream placeholder:text-muted transition focus:border-gold-400 focus:outline-none"
        />
      </div>

      {/* Phone */}
      <div className="relative">
        <MdPhone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          id="cf-phone"
          type="tel"
          inputMode="numeric"
          placeholder="Phone Number *"
          value={phone}
          onChange={(e) => setPhone(formatMobile(e.target.value))}
          className="h-12 w-full border border-navy-700/60 bg-navy-950 pl-10 pr-4 text-sm text-cream placeholder:text-muted transition focus:border-gold-400 focus:outline-none"
        />
      </div>

      {/* Email */}
      {!compact && (
        <div className="relative">
          <MdEmail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="cf-email"
            type="email"
            placeholder="Email Address (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full border border-navy-700/60 bg-navy-950 pl-10 pr-4 text-sm text-cream placeholder:text-muted transition focus:border-gold-400 focus:outline-none"
          />
        </div>
      )}

      {/* Message */}
      <div className="relative">
        <MdMessage className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
        <textarea
          id="cf-message"
          rows={compact ? 2 : 3}
          placeholder="Your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full resize-none border border-navy-700/60 bg-navy-950 pb-3 pl-10 pr-4 pt-3 text-sm text-cream placeholder:text-muted transition focus:border-gold-400 focus:outline-none"
        />
      </div>

      {/* User Type */}
      <div className="relative">
        <select
          id="cf-user-type"
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="h-12 w-full appearance-none border border-navy-700/60 bg-navy-950 px-4 text-sm text-cream transition focus:border-gold-400 focus:outline-none"
          style={{ colorScheme: "dark" }}
        >
          <option value="" className="bg-navy-950 text-muted">
            I am a...
          </option>
          {USER_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-navy-950">
              {opt.label}
            </option>
          ))}
        </select>
        {/* Down arrow */}
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted">
          ▾
        </span>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="tracked-label flex w-full items-center justify-center gap-2 bg-gold-400 px-6 py-3.5 text-xs font-semibold text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          "Sending..."
        ) : (
          <>
            <MdSend className="h-3.5 w-3.5" />
            Get a Callback
          </>
        )}
      </button>
    </form>
  );
}
