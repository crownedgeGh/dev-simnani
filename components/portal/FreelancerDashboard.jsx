"use client";

import { useState } from "react";
import { FiChevronDown, FiPlus } from "react-icons/fi";
import Tabs from "./Tabs";
import StatCard from "./StatCard";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import ProjectGrid from "@/components/project/ProjectGrid";
import AddPropertyForm from "./freelancer/AddPropertyForm";
import AddLeadForm from "./freelancer/AddLeadForm";
import { selectClass } from "@/components/auth/inputStyles";
import { LEAD_STATUSES, REFERRED_BY_OPTIONS } from "@/lib/demoPortal";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "projects", label: "Projects to Promote" },
  { key: "properties", label: "My Properties" },
  { key: "leads", label: "My Leads" },
  { key: "training", label: "Training" },
];

const STATUS_TONE = {
  New: "muted",
  Contacted: "muted",
  Qualified: "gold",
  "Site Visit": "gold",
  Converted: "success",
  Lost: "error",
};

const PROPERTY_STATUS_TONE = {
  "Pending Review": "gold",
  Live: "success",
  Rejected: "error",
};

function referredByLabel(property) {
  const option = REFERRED_BY_OPTIONS.find((o) => o.value === property.referredBy);
  const label = option ? option.label : property.referredBy;
  return property.referredBy === "other" && property.referredByNote
    ? `${label}: ${property.referredByNote}`
    : label;
}

export default function FreelancerDashboard({
  stats,
  projects,
  leads: initialLeads,
  properties: initialProperties,
  trainingModules,
}) {
  const [tab, setTab] = useState("overview");
  const [leads, setLeads] = useState(initialLeads);
  const [properties, setProperties] = useState(initialProperties || []);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);

  const completedModules = trainingModules.filter((m) => m.progress === 100).length;

  function handleAddLead(lead) {
    setLeads((prev) => [lead, ...prev]);
    setShowLeadForm(false);
  }

  function handleLeadStatusChange(id, status) {
    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
  }

  function handleAddProperty(property) {
    setProperties((prev) => [property, ...prev]);
    setShowPropertyForm(false);
  }

  function handleRemoveProperty(id) {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-8">
        {tab === "overview" && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Projects Available" value={stats.projectsAvailable} />
              <StatCard label="Leads Submitted" value={leads.length} />
              <StatCard label="Properties Posted" value={properties.length} />
              <StatCard label="Commission Earned" value={stats.commissionEarned} />
            </div>
            <div>
              <h2 className="font-display text-xl text-cream">Active Projects to Promote</h2>
              <div className="mt-4">
                <ProjectGrid projects={projects} />
              </div>
            </div>
          </div>
        )}

        {tab === "projects" && <ProjectGrid projects={projects} />}

        {tab === "properties" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-xl text-cream">My Properties</h2>
              {!showPropertyForm && (
                <button
                  type="button"
                  onClick={() => setShowPropertyForm(true)}
                  className="tracked-label flex items-center justify-center gap-2 bg-gold-400 px-4 py-3 text-xs text-navy-950 transition hover:bg-gold-300"
                >
                  <FiPlus className="h-4 w-4" />
                  Post Property
                </button>
              )}
            </div>

            {showPropertyForm && (
              <AddPropertyForm
                onSubmit={handleAddProperty}
                onCancel={() => setShowPropertyForm(false)}
              />
            )}

            {properties.length === 0 ? (
              <EmptyState
                title="No properties posted yet"
                message="Post a property you're referring and track its review status here."
              />
            ) : (
              <div className="flex flex-col gap-3">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="flex flex-col gap-3 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-cream">{property.title}</p>
                      <p className="mt-1 text-xs text-muted">
                        {property.city} · ₹{property.price}
                        {property.area ? ` · ${property.area} sq.ft.` : ""}
                      </p>
                      <p className="tracked-label mt-1 text-[10px] text-muted">
                        {property.id} · {property.date}
                      </p>
                      {property.description && (
                        <p className="mt-2 max-w-xl text-xs text-muted">{property.description}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                      <Badge tone={PROPERTY_STATUS_TONE[property.status] || "muted"}>
                        {property.status}
                      </Badge>
                      <Badge tone="muted">Referred by: {referredByLabel(property)}</Badge>
                      <button
                        type="button"
                        onClick={() => handleRemoveProperty(property.id)}
                        className="tracked-label text-[10px] text-muted transition hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
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
                  Generate Lead
                </button>
              )}
            </div>

            {showLeadForm && (
              <AddLeadForm
                projects={projects}
                onSubmit={handleAddLead}
                onCancel={() => setShowLeadForm(false)}
              />
            )}

            {leads.length === 0 ? (
              <EmptyState
                title="No leads yet"
                message="Generate a lead to start tracking it through to commission."
              />
            ) : (
              <div className="flex flex-col gap-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-cream">{lead.customer}</p>
                      <p className="mt-1 text-xs text-muted">
                        {lead.phone ? `${lead.phone} · ` : ""}
                        {lead.project} · {lead.date}
                      </p>
                      <p className="tracked-label mt-1 text-[10px] text-muted">
                        {lead.id}
                        {lead.source ? ` · ${lead.source}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:shrink-0 sm:justify-end">
                      <span className="text-sm text-gold-400">{lead.commission}</span>
                      <Badge tone={STATUS_TONE[lead.status] || "muted"}>{lead.status}</Badge>
                      <div className="relative w-full sm:w-auto">
                        <select
                          aria-label={`Update status for ${lead.customer}`}
                          value={lead.status}
                          onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                          className={`${selectClass} h-11 w-full min-w-[10rem] pr-9 text-xs sm:w-auto`}
                        >
                          {LEAD_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "training" && (
          <div>
            <p className="text-sm text-muted">
              {completedModules} of {trainingModules.length} modules completed.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {trainingModules.map((module) => (
                <div key={module.title} className="border border-navy-700/60 bg-navy-900 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-cream">{module.title}</p>
                    <span className="text-xs text-muted">{module.progress}%</span>
                  </div>
                  <div className="mt-3 h-1 w-full bg-navy-700/60">
                    <div
                      className="h-1 bg-gold-400"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
