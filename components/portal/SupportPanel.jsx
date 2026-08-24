"use client";

import { useState } from "react";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import ContactSupportForm from "./ContactSupportForm";

const STATUS_TONE = {
  open: "gold",
  in_progress: "muted",
  resolved: "success",
};

const STATUS_LABEL = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export default function SupportPanel({ tickets }) {
  const [items, setItems] = useState(tickets);
  const [showForm, setShowForm] = useState(false);

  function handleSubmitted(ticket) {
    setItems((prev) => [ticket, ...prev]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-cream">Support History</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="tracked-label bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
        >
          {showForm ? "Close" : "+ New Request"}
        </button>
      </div>

      {showForm && (
        <div className="border border-navy-700/60 bg-navy-900 p-6">
          <ContactSupportForm onSubmitted={handleSubmitted} />
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="No support requests yet"
          message="Requests you submit to our concierge team will appear here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((ticket) => (
            <div
              key={ticket.id}
              className="flex flex-col gap-2 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm text-cream">{ticket.subject}</p>
                <p className="tracked-label mt-1 text-[10px] text-muted">
                  {ticket.id} · {ticket.date}
                </p>
              </div>
              <Badge tone={STATUS_TONE[ticket.status]}>{STATUS_LABEL[ticket.status]}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
