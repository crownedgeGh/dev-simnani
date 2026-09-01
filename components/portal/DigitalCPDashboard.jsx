"use client";

import { useState } from "react";
import Image from "next/image";
import { FiDownload, FiPlus } from "react-icons/fi";
import Tabs from "./Tabs";
import StatCard from "./StatCard";
import EmptyState from "./EmptyState";
import LeadCard from "./channel-partner/LeadCard";
import ChipGroup from "@/components/auth/ChipGroup";
import FormField from "@/components/auth/FormField";
import { inputClass, selectClass } from "@/components/auth/inputStyles";
import { generateAccountId } from "@/lib/auth";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "assets", label: "Projects & Assets" },
  { key: "leads", label: "My Leads" },
  { key: "earnings", label: "Earnings" },
];

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "other", label: "Other" },
];

const INITIAL_LEAD_FORM = { customer: "", phone: "", project: "", platform: "", link: "" };

export default function DigitalCPDashboard({ stats, projects, assets, leads: initialLeads }) {
  const [tab, setTab] = useState("overview");
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "");
  const [leads, setLeads] = useState(initialLeads);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState(INITIAL_LEAD_FORM);
  const [leadError, setLeadError] = useState("");

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedAssets = assets.find((a) => a.projectId === selectedProjectId);

  function updateLeadForm(field, value) {
    setLeadForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmitLead(e) {
    e.preventDefault();
    if (!leadForm.customer.trim() || !leadForm.phone.trim() || !leadForm.project || !leadForm.platform) {
      setLeadError("Please fill in customer name, phone, project and platform.");
      return;
    }
    setLeadError("");
    const project = projects.find((p) => p.id === leadForm.project);
    setLeads((prev) => [
      {
        id: generateAccountId("LED"),
        customer: leadForm.customer.trim(),
        phone: leadForm.phone.trim(),
        project: project ? project.name : leadForm.project,
        source: PLATFORMS.find((p) => p.value === leadForm.platform)?.label || "Other",
        sourceLink: leadForm.link.trim(),
        status: "Pending Verification",
        commission: "Pending",
        date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      },
      ...prev,
    ]);
    setLeadForm(INITIAL_LEAD_FORM);
    setShowLeadForm(false);
  }

  return (
    <div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-8">
        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard label="Leads Submitted" value={stats.leadsSubmitted} />
            <StatCard label="Deals Converted" value={stats.dealsConverted} />
            <StatCard label="Commission Earned" value={stats.commissionEarned} />
          </div>
        )}

        {tab === "assets" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProjectId(p.id)}
                  aria-pressed={selectedProjectId === p.id}
                  className={`tracked-label border px-4 py-2 text-xs transition ${
                    selectedProjectId === p.id
                      ? "border-gold-400 bg-gold-400 text-navy-950"
                      : "border-navy-700/60 text-muted hover:text-cream"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {selectedProject && selectedAssets && (
              <div className="border border-navy-700/60 bg-navy-900 p-5">
                <h3 className="font-display text-lg text-cream">{selectedProject.name}</h3>
                <p className="mt-1 text-xs text-muted">{selectedProject.location}</p>

                <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <p className="tracked-label text-xs text-gold-400">Photos</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {selectedAssets.photos.map((src) => (
                        <div key={src} className="relative h-20 w-full overflow-hidden rounded-sm">
                          <Image
                            src={src}
                            alt={`${selectedProject.name} photo`}
                            fill
                            sizes="(max-width: 640px) 50vw, 200px"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="tracked-label text-xs text-gold-400">Videos</p>
                    <div className="mt-3 flex flex-col gap-2">
                      {selectedAssets.videos.map((name) => (
                        <span
                          key={name}
                          className="flex items-center justify-between gap-2 border border-navy-700/60 px-3 py-2 text-xs text-muted"
                        >
                          {name}
                          <FiDownload className="h-3.5 w-3.5 shrink-0 text-gold-400" />
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="tracked-label text-xs text-gold-400">Brochure</p>
                    <div className="mt-3">
                      <span className="flex items-center justify-between gap-2 border border-navy-700/60 px-3 py-2 text-xs text-muted">
                        {selectedAssets.brochureUrl}
                        <FiDownload className="h-3.5 w-3.5 shrink-0 text-gold-400" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "leads" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-xl text-cream">My Leads</h2>
              {!showLeadForm && (
                <button
                  type="button"
                  onClick={() => setShowLeadForm(true)}
                  className="tracked-label flex items-center justify-center gap-2 bg-gold-400 px-4 py-3 text-xs text-navy-950 transition hover:bg-gold-300"
                >
                  <FiPlus className="h-4 w-4" />
                  Submit Lead
                </button>
              )}
            </div>

            {showLeadForm && (
              <form
                onSubmit={handleSubmitLead}
                className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-4 sm:p-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Customer Name" htmlFor="dcp-customer" required>
                    <input
                      id="dcp-customer"
                      type="text"
                      placeholder="e.g. Ritika Sharma"
                      value={leadForm.customer}
                      onChange={(e) => updateLeadForm("customer", e.target.value)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Phone" htmlFor="dcp-phone" required>
                    <input
                      id="dcp-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={leadForm.phone}
                      onChange={(e) => updateLeadForm("phone", e.target.value)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Project" htmlFor="dcp-project" required>
                    <select
                      id="dcp-project"
                      value={leadForm.project}
                      onChange={(e) => updateLeadForm("project", e.target.value)}
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
                  <FormField label="Content Link" htmlFor="dcp-link" optional>
                    <input
                      id="dcp-link"
                      type="text"
                      placeholder="Link to the reel/post/video"
                      value={leadForm.link}
                      onChange={(e) => updateLeadForm("link", e.target.value)}
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <FormField label="Source Platform" required>
                  <ChipGroup
                    options={PLATFORMS}
                    value={leadForm.platform}
                    onChange={(value) => updateLeadForm("platform", value)}
                  />
                </FormField>

                {leadError && <p className="text-xs text-red-400">{leadError}</p>}

                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowLeadForm(false)}
                    className="tracked-label border border-navy-700/60 px-6 py-3 text-xs text-cream transition hover:border-gold-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="tracked-label bg-gold-400 px-6 py-3 text-xs text-navy-950 transition hover:bg-gold-300"
                  >
                    Submit Lead
                  </button>
                </div>
              </form>
            )}

            {leads.length === 0 ? (
              <EmptyState title="No leads yet" message="Submit a lead with its source platform to start tracking it through to commission." />
            ) : (
              <div className="flex flex-col gap-3">
                {leads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "earnings" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Commission Earned" value={stats.commissionEarned} />
            <StatCard label="Deals Converted" value={stats.dealsConverted} />
            <StatCard label="Leads Submitted" value={stats.leadsSubmitted} />
          </div>
        )}
      </div>
    </div>
  );
}
