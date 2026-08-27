"use client";

import { useState } from "react";
import { FiPhoneCall } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import EmployeeBadge from "./EmployeeBadge";
import { inputClass, textareaClass } from "./inputStyles";
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
      <div className="rounded-sm border border-gray-200 bg-white px-6 py-16 text-center">
        <p className="text-gray-500">No follow-ups due today. You&rsquo;re all caught up.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {dueToday.map((lead) => (
        <div
          key={lead.id}
          className="rounded-sm border border-gray-200 bg-white p-4 transition hover:border-cyan-400"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-900">{lead.name}</p>
              <p className="mt-1 text-xs text-gray-500">{lead.property}</p>
            </div>
            <div className="text-xs text-gray-500 lg:w-40">Last contact: {lead.lastFollowUp}</div>
            <div className="text-xs text-gray-500 lg:w-40">Next: {lead.nextFollowUp}</div>
            <EmployeeBadge tone={STATUS_TONE[lead.status] || "neutral"}>{lead.status}</EmployeeBadge>

            <div className="flex flex-wrap gap-2">
              <a
                href={`tel:+91${digitsOnly(lead.phone)}`}
                className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-sm border border-gray-300 px-3 text-xs text-gray-700 transition hover:border-cyan-500 hover:text-cyan-600"
                aria-label={`Call ${lead.name}`}
              >
                <FiPhoneCall className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/91${digitsOnly(lead.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-sm border border-gray-300 px-3 text-xs text-gray-700 transition hover:border-cyan-500 hover:text-cyan-600"
                aria-label={`WhatsApp ${lead.name}`}
              >
                <FaWhatsapp className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => togglePanel(lead.id, "note")}
                className="tracked-label h-11 rounded-sm border border-gray-300 px-3 text-xs text-gray-700 transition hover:border-cyan-500 hover:text-cyan-600"
              >
                Add Note
              </button>
              <button
                type="button"
                onClick={() => togglePanel(lead.id, "reschedule")}
                className="tracked-label h-11 rounded-sm border border-cyan-500 px-3 text-xs text-cyan-600 transition hover:bg-cyan-50"
              >
                Reschedule
              </button>
            </div>
          </div>

          {openPanel?.leadId === lead.id && openPanel.mode === "note" && (
            <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4">
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
                  className="tracked-label border border-gray-300 px-4 py-2 text-xs text-gray-700 transition hover:border-cyan-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => submitNote(lead.id)}
                  className="tracked-label bg-cyan-600 px-4 py-2 text-xs text-white transition hover:bg-cyan-500"
                >
                  Save Note
                </button>
              </div>
              {lead.notes.length > 0 && (
                <ul className="flex flex-col gap-1 text-xs text-gray-500">
                  {lead.notes.map((note, i) => (
                    <li key={i}>· {note}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {openPanel?.leadId === lead.id && openPanel.mode === "reschedule" && (
            <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row">
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
                className="tracked-label shrink-0 bg-cyan-600 px-4 py-2 text-xs text-white transition hover:bg-cyan-500"
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
