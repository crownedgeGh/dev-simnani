"use client";

import { useState } from "react";
import Badge from "@/components/portal/Badge";
import { inputClass, selectClass, textareaClass } from "@/components/auth/inputStyles";

function formatTimeLabel(time24) {
  if (!time24) return "";
  const [hourStr, minute] = time24.split(":");
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}

function toSortMinutes(time24) {
  if (!time24) return 1440;
  const [hourStr, minute] = time24.split(":");
  return parseInt(hourStr, 10) * 60 + parseInt(minute, 10);
}

const VISIT_TONE = {
  Scheduled: "gold",
  Done: "success",
};

export default function SiteVisitsTab({ siteVisits, leads, onSchedule, onUpdateOutcome }) {
  const [showForm, setShowForm] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [outcomeOpenId, setOutcomeOpenId] = useState(null);
  const [outcomeDraft, setOutcomeDraft] = useState({ attended: "yes", feedback: "", nextAction: "" });

  const todaysVisits = siteVisits
    .filter((visit) => visit.isToday)
    .slice()
    .sort((a, b) => a.sortMinutes - b.sortMinutes);
  const upcomingVisits = siteVisits.filter((visit) => !visit.isToday && visit.status === "Scheduled");

  function handleSchedule(e) {
    e.preventDefault();
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || !date || !time) return;

    const todayIso = new Date().toISOString().slice(0, 10);
    onSchedule({
      leadId: lead.id,
      customer: lead.name,
      property: lead.property,
      time: formatTimeLabel(time),
      sortMinutes: toSortMinutes(time),
      isToday: date === todayIso,
      status: "Scheduled",
    });

    setLeadId("");
    setDate("");
    setTime("");
    setShowForm(false);
  }

  function openOutcome(visit) {
    setOutcomeOpenId(visit.id);
    setOutcomeDraft({
      attended: visit.attended === false ? "no" : "yes",
      feedback: visit.feedback || "",
      nextAction: visit.nextAction || "",
    });
  }

  function saveOutcome(visitId) {
    onUpdateOutcome(visitId, {
      status: "Done",
      attended: outcomeDraft.attended === "yes",
      feedback: outcomeDraft.feedback,
      nextAction: outcomeDraft.nextAction,
    });
    setOutcomeOpenId(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-cream">Today&rsquo;s Site Visits</h2>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="tracked-label bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
          >
            {showForm ? "Close" : "Schedule Visit"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSchedule}
            className="mb-6 grid grid-cols-1 gap-4 border border-navy-700/60 bg-navy-950 p-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <select
              required
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className={selectClass}
              aria-label="Select customer"
            >
              <option value="">Select customer</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} — {lead.property}
                </option>
              ))}
            </select>
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              aria-label="Visit date"
            />
            <input
              required
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={inputClass}
              aria-label="Visit time"
            />
            <button
              type="submit"
              className="tracked-label bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
            >
              Confirm Schedule
            </button>
          </form>
        )}

        {todaysVisits.length === 0 ? (
          <div className="border border-navy-700/60 bg-navy-900 px-6 py-10 text-center">
            <p className="text-muted">No site visits scheduled for today.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {todaysVisits.map((visit) => (
              <div key={visit.id} className="border border-navy-700/60 bg-navy-900 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-display text-lg text-gold-400">{visit.time}</span>
                    <div>
                      <p className="text-sm text-cream">{visit.customer}</p>
                      <p className="text-xs text-muted">{visit.property}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={VISIT_TONE[visit.status] || "muted"}>{visit.status}</Badge>
                    {visit.status === "Scheduled" && (
                      <button
                        type="button"
                        onClick={() => openOutcome(visit)}
                        className="tracked-label border border-gold-500/70 px-3 py-2 text-xs text-gold-400 transition hover:bg-gold-500/10"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>

                {outcomeOpenId === visit.id && (
                  <div className="mt-4 flex flex-col gap-3 border-t border-navy-700/60 pt-4">
                    <div className="flex items-center gap-4">
                      <span className="tracked-label text-xs text-muted">Customer attended?</span>
                      <label className="flex items-center gap-2 text-xs text-cream">
                        <input
                          type="radio"
                          name={`attended-${visit.id}`}
                          checked={outcomeDraft.attended === "yes"}
                          onChange={() => setOutcomeDraft((d) => ({ ...d, attended: "yes" }))}
                          className="h-4 w-4 accent-gold-400"
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-2 text-xs text-cream">
                        <input
                          type="radio"
                          name={`attended-${visit.id}`}
                          checked={outcomeDraft.attended === "no"}
                          onChange={() => setOutcomeDraft((d) => ({ ...d, attended: "no" }))}
                          className="h-4 w-4 accent-gold-400"
                        />
                        No-show
                      </label>
                    </div>
                    <textarea
                      placeholder="Visit feedback"
                      rows={2}
                      value={outcomeDraft.feedback}
                      onChange={(e) => setOutcomeDraft((d) => ({ ...d, feedback: e.target.value }))}
                      className={textareaClass}
                    />
                    <input
                      type="text"
                      placeholder="Next action (e.g. Send proposal, schedule negotiation call)"
                      value={outcomeDraft.nextAction}
                      onChange={(e) => setOutcomeDraft((d) => ({ ...d, nextAction: e.target.value }))}
                      className={inputClass}
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setOutcomeOpenId(null)}
                        className="tracked-label border border-navy-700/60 px-4 py-2 text-xs text-cream transition hover:border-gold-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveOutcome(visit.id)}
                        className="tracked-label bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
                      >
                        Save Outcome
                      </button>
                    </div>
                  </div>
                )}

                {visit.status === "Done" && visit.feedback && (
                  <div className="mt-3 border-t border-navy-700/60 pt-3 text-xs text-muted">
                    <p>
                      {visit.attended ? "Attended" : "No-show"} · {visit.feedback}
                    </p>
                    {visit.nextAction && <p className="mt-1 text-gold-400">Next: {visit.nextAction}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {upcomingVisits.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-cream">Upcoming Visits</h2>
          <div className="mt-4 flex flex-col gap-3">
            {upcomingVisits.map((visit) => (
              <div
                key={visit.id}
                className="flex flex-col gap-2 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm text-cream">{visit.customer}</p>
                  <p className="mt-1 text-xs text-muted">{visit.property}</p>
                </div>
                <Badge tone="gold">{visit.time}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
