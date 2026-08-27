"use client";

import { useState } from "react";
import { FiPhoneCall } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import Badge from "@/components/portal/Badge";
import { inputClass, textareaClass } from "@/components/auth/inputStyles";
import { STATUS_TONE } from "./tones";

function digitsOnly(phone) {
  return phone.replace(/\D/g, "");
}

export default function FollowUpsTab({ leads, onAddNote, onReschedule }) {
  const [openPanel, setOpenPanel] = useState(null); // { leadId, mode: "note" | "reschedule" }
  const [noteDraft, setNoteDraft] = useState("");
  const [rescheduleDraft, setRescheduleDraft] = useState("");

  const dueToday = leads.filter((lead) => lead.dueToday);

  function togglePanel(leadId, mode) {
    if (openPanel?.leadId === leadId && openPanel?.mode === mode) {
      setOpenPanel(null);
      return;
    }
    setOpenPanel({ leadId, mode });
    setNoteDraft("");
    setRescheduleDraft("");
  }

  function submitNote(leadId) {
    onAddNote(leadId, noteDraft);
    setOpenPanel(null);
  }

  function submitReschedule(leadId) {
    onReschedule(leadId, rescheduleDraft);
    setOpenPanel(null);
  }

  if (dueToday.length === 0) {
    return (
      <div className="border border-navy-700/60 bg-navy-900 px-6 py-16 text-center">
        <p className="text-muted">No follow-ups due today. You&rsquo;re all caught up.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {dueToday.map((lead) => (
        <div key={lead.id} className="border border-navy-700/60 bg-navy-900 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-cream">{lead.name}</p>
              <p className="mt-1 text-xs text-muted">{lead.property}</p>
            </div>
            <div className="text-xs text-muted lg:w-40">Last contact: {lead.lastFollowUp}</div>
            <div className="text-xs text-muted lg:w-40">Next: {lead.nextFollowUp}</div>
            <Badge tone={STATUS_TONE[lead.status] || "muted"}>{lead.status}</Badge>

            <div className="flex flex-wrap gap-2">
              <a
                href={`tel:+91${digitsOnly(lead.phone)}`}
                className="flex h-11 min-w-11 items-center justify-center gap-1.5 border border-navy-700/60 px-3 text-xs text-cream transition hover:border-gold-400"
                aria-label={`Call ${lead.name}`}
              >
                <FiPhoneCall className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/91${digitsOnly(lead.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 min-w-11 items-center justify-center gap-1.5 border border-navy-700/60 px-3 text-xs text-cream transition hover:border-gold-400"
                aria-label={`WhatsApp ${lead.name}`}
              >
                <FaWhatsapp className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => togglePanel(lead.id, "note")}
                className="tracked-label h-11 border border-navy-700/60 px-3 text-xs text-cream transition hover:border-gold-400"
              >
                Add Note
              </button>
              <button
                type="button"
                onClick={() => togglePanel(lead.id, "reschedule")}
                className="tracked-label h-11 border border-gold-500/70 px-3 text-xs text-gold-400 transition hover:bg-gold-500/10"
              >
                Reschedule
              </button>
            </div>
          </div>

          {openPanel?.leadId === lead.id && openPanel.mode === "note" && (
            <div className="mt-4 flex flex-col gap-3 border-t border-navy-700/60 pt-4">
              <textarea
                placeholder="Add a note about this lead"
                rows={2}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                className={textareaClass}
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpenPanel(null)}
                  className="tracked-label border border-navy-700/60 px-4 py-2 text-xs text-cream transition hover:border-gold-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => submitNote(lead.id)}
                  className="tracked-label bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
                >
                  Save Note
                </button>
              </div>
              {lead.notes.length > 0 && (
                <ul className="flex flex-col gap-1 text-xs text-muted">
                  {lead.notes.map((note, i) => (
                    <li key={i}>· {note}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {openPanel?.leadId === lead.id && openPanel.mode === "reschedule" && (
            <div className="mt-4 flex flex-col gap-3 border-t border-navy-700/60 pt-4 sm:flex-row">
              <input
                type="text"
                placeholder="e.g. Tomorrow, 5:00 PM"
                value={rescheduleDraft}
                onChange={(e) => setRescheduleDraft(e.target.value)}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => submitReschedule(lead.id)}
                className="tracked-label shrink-0 bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
              >
                Save New Follow-up
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
