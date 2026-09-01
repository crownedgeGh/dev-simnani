"use client";

import { useState } from "react";
import Image from "next/image";
import { FiPlus, FiCheck, FiSend, FiNavigation, FiCamera, FiUser, FiPhone } from "react-icons/fi";
import Tabs from "./Tabs";
import StatCard from "./StatCard";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import { VISIT_STATUS_TONE } from "./channel-partner/tones";
import FormField from "@/components/auth/FormField";
import { inputClass, selectClass, textareaClass } from "@/components/auth/inputStyles";
import { generateAccountId } from "@/lib/auth";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "assigned", label: "Assigned Projects" },
  { key: "visits", label: "Site Visits" },
  { key: "direct", label: "Add Direct Lead" },
  { key: "earnings", label: "Earnings" },
];

const INITIAL_DIRECT_FORM = { customer: "", phone: "", project: "", notes: "" };

export default function FieldCPDashboard({ stats, leads: initialLeads, siteVisits: initialSiteVisits, projects }) {
  const [tab, setTab] = useState("overview");
  const [leads] = useState(initialLeads);
  const [siteVisits, setSiteVisits] = useState(initialSiteVisits);
  const [followUpDrafts, setFollowUpDrafts] = useState({});
  const [customerNotes, setCustomerNotes] = useState({});

  const [directForm, setDirectForm] = useState(INITIAL_DIRECT_FORM);
  const [directError, setDirectError] = useState("");
  const [directLeads, setDirectLeads] = useState([]);

  const assignedLeads = leads.filter((l) => l.assignedTo);

  const assignedProjects = projects
    .map((project) => ({
      project,
      leads: assignedLeads.filter((l) => l.project === project.name),
    }))
    .filter((group) => group.leads.length > 0);

  function updateVisitStatus(leadId, status) {
    setSiteVisits((prev) =>
      prev.map((v) => (v.leadId === leadId ? { ...v, status } : v))
    );
  }

  function uploadLivePhoto(leadId, file) {
    if (!file) return;
    setSiteVisits((prev) =>
      prev.map((v) => (v.leadId === leadId ? { ...v, livePhoto: file.name } : v))
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
    setDirectLeads((prev) => [
      {
        id: generateAccountId("LED"),
        customer: directForm.customer.trim(),
        phone: directForm.phone.trim(),
        project: project ? project.name : directForm.project,
        notes: directForm.notes.trim(),
        forwarded: false,
        date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      },
      ...prev,
    ]);
    setDirectForm(INITIAL_DIRECT_FORM);
  }

  function handleForwardDirectLead(id) {
    setDirectLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, forwarded: true } : lead)));
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
          <div className="flex flex-col gap-6">
            {assignedProjects.length === 0 ? (
              <EmptyState title="No projects assigned yet" message="Projects with leads assigned to you by a Company Channel Partner will appear here." />
            ) : (
              assignedProjects.map(({ project, leads: projectLeads }) => (
                <div key={project.id} className="border border-navy-700/60 bg-navy-900 p-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-[220px_1fr]">
                    <div className="relative h-48 w-full overflow-hidden rounded-sm sm:h-full">
                      <Image
                        src={project.image}
                        alt={project.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 220px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-display text-lg text-cream">{project.name}</h3>
                      <p className="mt-1 text-xs text-muted">{project.location}</p>
                      <p className="mt-1 text-xs text-muted">
                        {project.startingPrice} · {project.developer}
                      </p>
                      <span className="tracked-label mt-3 flex w-fit items-center gap-1 border border-gold-500/70 px-3 py-1 text-xs text-gold-400">
                        {project.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-navy-700/60 pt-4">
                    <p className="tracked-label text-xs text-gold-400">Assigned Customers ({projectLeads.length})</p>
                    <div className="mt-3 flex flex-col gap-3">
                      {projectLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="flex flex-col gap-2 border border-navy-700/60 bg-navy-950 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-sm text-cream">{lead.customer}</p>
                            <p className="mt-1 text-xs text-muted">{lead.phone}</p>
                          </div>
                          <div className="flex items-center gap-3 sm:shrink-0">
                            {lead.commission && <span className="text-sm text-gold-400">{lead.commission}</span>}
                            <Badge tone={lead.status === "Converted" ? "success" : "gold"}>{lead.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
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
                      <Badge tone={VISIT_STATUS_TONE[visit.status] || "muted"}>{visit.status}</Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 border-t border-navy-700/60 pt-4">
                      <button
                        type="button"
                        onClick={() => updateVisitStatus(visit.leadId, "Moving")}
                        disabled={visit.status !== "Scheduled"}
                        className="tracked-label flex items-center justify-center gap-2 border border-gold-500/70 px-4 py-2 text-xs text-gold-400 transition hover:bg-gold-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <FiNavigation className="h-3.5 w-3.5" />
                        Moving
                      </button>

                      <label
                        htmlFor={`live-photo-${visit.leadId}`}
                        className="tracked-label flex cursor-pointer items-center justify-center gap-2 border border-gold-500/70 px-4 py-2 text-xs text-gold-400 transition hover:bg-gold-500/10"
                      >
                        <FiCamera className="h-3.5 w-3.5" />
                        {visit.livePhoto ? "Replace Live Photo" : "Live Photo"}
                      </label>
                      <input
                        id={`live-photo-${visit.leadId}`}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => uploadLivePhoto(visit.leadId, e.target.files?.[0])}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => updateVisitStatus(visit.leadId, "Visit Done")}
                        disabled={visit.status === "Visit Done" || visit.status === "No Show"}
                        className="tracked-label flex items-center justify-center gap-2 bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <FiCheck className="h-3.5 w-3.5" />
                        Visit Done
                      </button>

                      {visit.status !== "No Show" && (
                        <button
                          type="button"
                          onClick={() => updateVisitStatus(visit.leadId, "No Show")}
                          className="tracked-label text-xs text-muted transition hover:text-red-400"
                        >
                          Mark No Show
                        </button>
                      )}

                      {visit.livePhoto && (
                        <span className="tracked-label ml-auto flex items-center gap-1.5 text-[10px] text-muted">
                          <FiCamera className="h-3 w-3" />
                          {visit.livePhoto}
                        </span>
                      )}
                    </div>

                    <div className="border-t border-navy-700/60 pt-4">
                      <p className="tracked-label text-xs text-gold-400">Customer Details</p>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2 border border-navy-700/60 bg-navy-950 px-4 py-3">
                          <FiUser className="h-4 w-4 shrink-0 text-gold-400" />
                          <span className="text-sm text-cream">{lead ? lead.customer : "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 border border-navy-700/60 bg-navy-950 px-4 py-3">
                          <FiPhone className="h-4 w-4 shrink-0 text-gold-400" />
                          <span className="text-sm text-cream">{lead ? lead.phone : "—"}</span>
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Notes about the customer..."
                        value={customerNotes[visit.leadId] ?? ""}
                        onChange={(e) =>
                          setCustomerNotes((prev) => ({ ...prev, [visit.leadId]: e.target.value }))
                        }
                        className={`${textareaClass} mt-3`}
                      />
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
          <div className="flex flex-col gap-6">
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
              <FormField label="Notes" htmlFor="fcp-notes" optional>
                <textarea
                  id="fcp-notes"
                  rows={3}
                  placeholder="Any details about the lead"
                  value={directForm.notes}
                  onChange={(e) => setDirectForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className={textareaClass}
                />
              </FormField>

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

            {directLeads.length === 0 ? (
              <EmptyState title="No direct leads yet" message="Add a lead's name, phone, project and notes, then forward it to the Company CP." />
            ) : (
              <div className="flex flex-col gap-3">
                {directLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex flex-col gap-3 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-cream">{lead.customer}</p>
                      <p className="mt-1 text-xs text-muted">
                        {lead.phone} · {lead.project}
                      </p>
                      {lead.notes && <p className="mt-1 text-xs text-muted">{lead.notes}</p>}
                    </div>
                    {lead.forwarded ? (
                      <span className="tracked-label flex w-fit shrink-0 items-center gap-2 border border-gold-500/70 px-4 py-2 text-xs text-gold-400">
                        <FiCheck className="h-3.5 w-3.5" />
                        Forwarded to Company CP
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleForwardDirectLead(lead.id)}
                        className="tracked-label flex shrink-0 items-center justify-center gap-2 bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
                      >
                        <FiSend className="h-3.5 w-3.5" />
                        Forward to Company CP
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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
