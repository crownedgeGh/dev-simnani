"use client";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import EmployeeBadge from "./EmployeeBadge";
import { inputClass, selectClass, textareaClass } from "./inputStyles";

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
  Scheduled: "accent",
  Done: "solid",
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
          <h2 className="font-display text-xl text-gray-900">Today&rsquo;s Site Visits</h2>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="tracked-label bg-cyan-600 px-4 py-2 text-xs text-white transition hover:bg-cyan-500"
          >
            {showForm ? "Close" : "Schedule Visit"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSchedule}
            className="mb-6 grid grid-cols-1 gap-4 rounded-sm border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="relative">
              <select
                required
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className={`${selectClass} rounded-sm pr-9`}
                aria-label="Select customer"
              >
                <option value="">Select customer</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} — {lead.property}
                  </option>
                ))}
              </select>
              <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${inputClass} rounded-sm`}
              aria-label="Visit date"
            />
            <input
              required
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`${inputClass} rounded-sm`}
              aria-label="Visit time"
            />
            <button
              type="submit"
              className="tracked-label bg-cyan-600 px-4 py-2 text-xs text-white transition hover:bg-cyan-500"
            >
              Confirm Schedule
            </button>
          </form>
        )}

        {todaysVisits.length === 0 ? (
          <div className="rounded-sm border border-gray-200 bg-white px-6 py-10 text-center">
            <p className="text-gray-500">No site visits scheduled for today.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {todaysVisits.map((visit) => (
              <div
                key={visit.id}
                className="rounded-sm border border-gray-200 bg-white p-4 transition hover:border-cyan-400"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 min-w-16 shrink-0 items-center justify-center rounded-sm bg-cyan-100 px-2 font-display text-sm text-cyan-700">
                      {visit.time}
                    </span>
                    <div>
                      <p className="text-sm text-gray-900">{visit.customer}</p>
                      <p className="text-xs text-gray-500">{visit.property}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <EmployeeBadge tone={VISIT_TONE[visit.status] || "neutral"}>{visit.status}</EmployeeBadge>
                    {visit.status === "Scheduled" && (
                      <button
                        type="button"
                        onClick={() => openOutcome(visit)}
                        className="tracked-label border border-cyan-500 px-3 py-2 text-xs text-cyan-600 transition hover:bg-cyan-50"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>

                {outcomeOpenId === visit.id && (
                  <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-4">
                      <span className="tracked-label text-xs text-gray-500">Customer attended?</span>
                      <label className="flex items-center gap-2 text-xs text-gray-900">
                        <input
                          type="radio"
                          name={`attended-${visit.id}`}
                          checked={outcomeDraft.attended === "yes"}
                          onChange={() => setOutcomeDraft((d) => ({ ...d, attended: "yes" }))}
                          className="h-4 w-4 accent-cyan-600"
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-2 text-xs text-gray-900">
                        <input
                          type="radio"
                          name={`attended-${visit.id}`}
                          checked={outcomeDraft.attended === "no"}
                          onChange={() => setOutcomeDraft((d) => ({ ...d, attended: "no" }))}
                          className="h-4 w-4 accent-cyan-600"
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
                        className="tracked-label border border-gray-300 px-4 py-2 text-xs text-gray-700 transition hover:border-cyan-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveOutcome(visit.id)}
                        className="tracked-label bg-cyan-600 px-4 py-2 text-xs text-white transition hover:bg-cyan-500"
                      >
                        Save Outcome
                      </button>
                    </div>
                  </div>
                )}

                {visit.status === "Done" && visit.feedback && (
                  <div className="mt-3 border-t border-gray-200 pt-3 text-xs text-gray-500">
                    <p>
                      {visit.attended ? "Attended" : "No-show"} · {visit.feedback}
                    </p>
                    {visit.nextAction && <p className="mt-1 text-cyan-700">Next: {visit.nextAction}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {upcomingVisits.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-gray-900">Upcoming Visits</h2>
          <div className="mt-4 flex flex-col gap-3">
            {upcomingVisits.map((visit) => (
              <div
                key={visit.id}
                className="flex flex-col gap-2 rounded-sm border border-gray-200 bg-white p-4 transition hover:border-cyan-400 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm text-gray-900">{visit.customer}</p>
                  <p className="mt-1 text-xs text-gray-500">{visit.property}</p>
                </div>
                <EmployeeBadge tone="accent">{visit.time}</EmployeeBadge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
