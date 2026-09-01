"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import Tabs from "./Tabs";
import StatCard from "./StatCard";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import LeadCard from "./channel-partner/LeadCard";
import { VISIT_STATUS_TONE } from "./channel-partner/tones";
import FormField from "@/components/auth/FormField";
import { inputClass, selectClass } from "@/components/auth/inputStyles";
import { generateAccountId } from "@/lib/auth";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "assigned", label: "Assigned Leads" },
  { key: "visits", label: "Site Visits" },
  { key: "direct", label: "Add Direct Lead" },
  { key: "earnings", label: "Earnings" },
];

const INITIAL_DIRECT_FORM = { customer: "", phone: "", project: "" };

export default function FieldCPDashboard({ stats, leads: initialLeads, siteVisits: initialSiteVisits, projects }) {
  const [tab, setTab] = useState("overview");
  const [leads, setLeads] = useState(initialLeads);
  const [siteVisits, setSiteVisits] = useState(initialSiteVisits);
  const [followUpDrafts, setFollowUpDrafts] = useState({});
  const [directForm, setDirectForm] = useState(INITIAL_DIRECT_FORM);
  const [directError, setDirectError] = useState("");

  const assignedLeads = leads.filter((l) => l.assignedTo);

  function updateVisitStatus(leadId, status) {
    setSiteVisits((prev) =>
      prev.map((v) => (v.leadId === leadId ? { ...v, status } : v))
    );
  }

  function addFollowUp(leadId) {
    const note = (followUpDrafts[leadId] || "").trim();
    if (!note) return;
    setSiteVisits((prev) =>
      prev.map((v) =>
        v.leadId === leadId
          ? {
              ...v,
              followUps: [
                ...v.followUps,
                { note, at: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) },
              ],
            }
          : v
      )
    );
    setFollowUpDrafts((prev) => ({ ...prev, [leadId]: "" }));
  }

  function handleDirectSubmit(e) {
    e.preventDefault();
    if (!directForm.customer.trim() || !directForm.phone.trim() || !directForm.project) {
      setDirectError("Please fill in customer name, phone and project.");
      return;
    }
    setDirectError("");
    const project = projects.find((p) => p.id === directForm.project);
    setLeads((prev) => [
      {
        id: generateAccountId("LED"),
        customer: directForm.customer.trim(),
        phone: directForm.phone.trim(),
        project: project ? project.name : directForm.project,
        source: "Personal Network",
        status: "Pending Verification",
        commission: "Pending",
        date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      },
      ...prev,
    ]);
    setDirectForm(INITIAL_DIRECT_FORM);
  }

  return (
    <div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-8">
        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Assigned Leads" value={stats.assignedLeads} />
            <StatCard label="Site Visits Scheduled" value={stats.siteVisitsScheduled} />
            <StatCard label="Deals Closed" value={stats.dealsClosed} />
            <StatCard label="Commission Earned" value={stats.commissionEarned} />
          </div>
        )}

        {tab === "assigned" && (
          <div className="flex flex-col gap-3">
            {assignedLeads.length === 0 ? (
              <EmptyState title="No leads assigned yet" message="Leads assigned to you by a Company Channel Partner will appear here." />
            ) : (
              assignedLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
            )}
          </div>
        )}

        {tab === "visits" && (
          <div className="flex flex-col gap-3">
            {siteVisits.length === 0 ? (
              <EmptyState title="No site visits yet" message="Schedule and track site visits for your assigned leads here." />
            ) : (
              siteVisits.map((visit) => {
                const lead = leads.find((l) => l.id === visit.leadId);
                return (
                  <div key={visit.leadId} className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-cream">{lead ? lead.customer : visit.leadId}</p>
                        <p className="mt-1 text-xs text-muted">{lead?.project}</p>
                        <p className="mt-1 text-xs text-gold-400">{visit.scheduledAt}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge tone={VISIT_STATUS_TONE[visit.status] || "muted"}>{visit.status}</Badge>
                        <select
                          aria-label={`Update visit status for ${lead ? lead.customer : visit.leadId}`}
                          value={visit.status}
                          onChange={(e) => updateVisitStatus(visit.leadId, e.target.value)}
                          className={`${selectClass} h-11 w-full min-w-[9rem] text-xs sm:w-auto`}
                        >
                          {["Scheduled", "Completed", "No Show"].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-navy-700/60 pt-4">
                      <p className="tracked-label text-xs text-gold-400">Follow-ups</p>
                      <div className="mt-2 flex flex-col gap-2">
                        {visit.followUps.map((f, i) => (
                          <p key={i} className="text-xs text-muted">
                            <span className="text-cream">{f.at}</span> — {f.note}
                          </p>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          placeholder="Add a follow-up note..."
                          value={followUpDrafts[visit.leadId] || ""}
                          onChange={(e) =>
                            setFollowUpDrafts((prev) => ({ ...prev, [visit.leadId]: e.target.value }))
                          }
                          className={`${inputClass} h-11`}
                        />
                        <button
                          type="button"
                          onClick={() => addFollowUp(visit.leadId)}
                          className="tracked-label border border-gold-400/70 px-4 py-2 text-xs text-gold-400 transition hover:bg-gold-400/10 sm:shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "direct" && (
          <form
            onSubmit={handleDirectSubmit}
            className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-4 sm:p-6"
          >
            <h3 className="font-display text-lg text-cream">Add a Direct Lead</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Customer Name" htmlFor="fcp-customer" required>
                <input
                  id="fcp-customer"
                  type="text"
                  placeholder="e.g. Vivek Nair"
                  value={directForm.customer}
                  onChange={(e) => setDirectForm((prev) => ({ ...prev, customer: e.target.value }))}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Phone" htmlFor="fcp-phone" required>
                <input
                  id="fcp-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={directForm.phone}
                  onChange={(e) => setDirectForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Project" htmlFor="fcp-project" required>
                <select
                  id="fcp-project"
                  value={directForm.project}
                  onChange={(e) => setDirectForm((prev) => ({ ...prev, project: e.target.value }))}
                  className={selectClass}
                >
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            {directError && <p className="text-xs text-red-400">{directError}</p>}

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="submit"
                className="tracked-label flex items-center justify-center gap-2 bg-gold-400 px-6 py-3 text-xs text-navy-950 transition hover:bg-gold-300"
              >
                <FiPlus className="h-4 w-4" />
                Add Lead
              </button>
            </div>
          </form>
        )}

        {tab === "earnings" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Commission Earned" value={stats.commissionEarned} />
            <StatCard label="Deals Closed" value={stats.dealsClosed} />
            <StatCard label="Site Visits Scheduled" value={stats.siteVisitsScheduled} />
          </div>
        )}
      </div>
    </div>
  );
}
