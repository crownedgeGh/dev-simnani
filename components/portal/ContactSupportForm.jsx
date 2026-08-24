"use client";

import { useState } from "react";
import { generateAccountId } from "@/lib/auth";
import { selectClass, textareaClass } from "@/components/auth/inputStyles";

const SUBJECTS = [
  "General Inquiry",
  "Schedule Viewing",
  "Portfolio Management",
  "Technical Support",
];

export default function ContactSupportForm({ onSubmitted }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    if (!subject || !message.trim()) {
      setError("Please select a subject and enter your message.");
      return;
    }
    setError("");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const newTicket = { id: generateAccountId("TKT"), subject, date: "Just now", status: "open" };
      setTicket(newTicket);
      onSubmitted?.(newTicket);
    }, 900);
  }

  if (ticket) {
    return (
      <div className="flex flex-col items-center gap-4 border border-navy-700/60 bg-navy-900 p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-400 text-2xl text-gold-400">
          ✓
        </span>
        <h3 className="font-display text-xl text-cream">Request Received</h3>
        <p className="text-sm text-muted">Our concierge team will respond shortly.</p>
        <p className="tracked-label text-xs text-gold-400">Ticket ID: {ticket.id}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="subject" className="tracked-label text-xs text-cream/80">
          Subject
        </label>
        <select
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={selectClass}
        >
          <option value="">Select a subject</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="tracked-label text-xs text-cream/80">
          Message
        </label>
        <textarea
          id="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={textareaClass}
          placeholder="How can we help?"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="tracked-label bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
