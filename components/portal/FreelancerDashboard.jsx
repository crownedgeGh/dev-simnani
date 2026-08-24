"use client";

import { useState } from "react";
import Tabs from "./Tabs";
import StatCard from "./StatCard";
import Badge from "./Badge";
import ProjectGrid from "@/components/project/ProjectGrid";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "projects", label: "Projects to Promote" },
  { key: "leads", label: "My Leads" },
  { key: "training", label: "Training" },
];

const STATUS_TONE = {
  Qualified: "gold",
  Converted: "success",
};

export default function FreelancerDashboard({ stats, projects, leads, trainingModules }) {
  const [tab, setTab] = useState("overview");
  const completedModules = trainingModules.filter((m) => m.progress === 100).length;

  return (
    <div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-8">
        {tab === "overview" && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Projects Available" value={stats.projectsAvailable} />
              <StatCard label="Leads Submitted" value={stats.leadsSubmitted} />
              <StatCard label="Deals Closed" value={stats.dealsClosed} />
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

        {tab === "leads" && (
          <div className="flex flex-col gap-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="flex flex-col gap-2 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm text-cream">{lead.customer}</p>
                  <p className="mt-1 text-xs text-muted">
                    {lead.project} · {lead.date}
                  </p>
                  <p className="tracked-label mt-1 text-[10px] text-muted">{lead.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={STATUS_TONE[lead.status] || "muted"}>{lead.status}</Badge>
                  <span className="text-sm text-gold-400">{lead.commission}</span>
                </div>
              </div>
            ))}
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
