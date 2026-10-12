"use client";

import { useState } from "react";
import { formatMobile, isMobileValid } from "@/lib/auth";
import { inputClass, textareaClass } from "@/components/auth/inputStyles";

export default function HelpdeskForm() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim() || !isMobileValid(mobile) || !query.trim()) {
      setError("Please fill in your name, a valid mobile number, and your query.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/helpdesk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: mobile,
          message: query.trim(),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to send query");
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send query. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 border border-navy-700/60 bg-navy-900 p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-400 text-2xl text-gold-400">
          ✓
        </span>
        <h3 className="font-display text-xl text-cream">Query Sent</h3>
        <p className="text-sm text-muted">Our team will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-8 sm:p-10"
    >
      <div>
        <h2 className="font-display text-2xl text-cream">Helpdesk</h2>
        <p className="mt-2 text-sm text-muted">Have a question? Send us your query.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="help-name" className="tracked-label text-xs text-cream/80">
          Name <span className="text-gold-400">*</span>
        </label>
        <input
          id="help-name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="help-mobile" className="tracked-label text-xs text-cream/80">
          Mobile Number <span className="text-gold-400">*</span>
        </label>
        <div className="flex items-center rounded-full border border-navy-700/60 bg-navy-950 px-4 transition focus-within:border-gold-400 focus-within:ring-4 focus-within:ring-gold-400/10">
          <span className="text-sm text-muted">+91</span>
          <input
            id="help-mobile"
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
        <label htmlFor="help-query" className="tracked-label text-xs text-cream/80">
          Your Query <span className="text-gold-400">*</span>
        </label>
        <textarea
          id="help-query"
          rows={4}
          placeholder="Tell us how we can help..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={textareaClass}
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="tracked-label mt-2 rounded-full bg-gold-400 px-6 py-4 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Send Query"}
      </button>
    </form>
  );
}
