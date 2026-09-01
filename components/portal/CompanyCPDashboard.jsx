"use client";

import { useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import Tabs from "./Tabs";
import StatCard from "./StatCard";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import LeadCard from "./channel-partner/LeadCard";
import { APPROVAL_STATUS_TONE } from "./channel-partner/tones";
import { selectClass } from "@/components/auth/inputStyles";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "inbox", label: "Lead Inbox" },
  { key: "verification", label: "Verification" },
  { key: "assignment", label: "Assignment" },
  { key: "visits", label: "Site Visits & Deals" },
  { key: "commissions", label: "Commissions" },
  { key: "network", label: "Network" },
];

export default function CompanyCPDashboard({ stats, leads: initialLeads, network, commissions: initialCommissions }) {
  const [tab, setTab] = useState("overview");
  const [leads, setLeads] = useState(initialLeads);
  const [commissions, setCommissions] = useState(initialCommissions);

  const fieldPartners = network.filter((p) => p.cpType === "field");
  const pendingLeads = leads.filter((l) => l.status === "Pending Verification");
  const assignableLeads = leads.filter((l) => l.status === "Verified");
  const inProgressLeads = leads.filter((l) =>
    ["Assigned", "Site Visit Scheduled", "Site Visit Completed"].includes(l.status)
  );

  function handleVerify(id, approve) {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, status: approve ? "Verified" : "Lost" } : lead))
    );
  }

  function handleAssign(id, partnerName) {
    if (!partnerName) return;
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, status: "Assigned", assignedTo: partnerName } : lead))
    );
  }

  function handleCommissionUpdate(leadId, approvalStatus) {
    setCommissions((prev) => prev.map((c) => (c.leadId === leadId ? { ...c, approvalStatus } : c)));
  }

  return (
    <div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-8">
        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Leads" value={stats.totalLeads} />
            <StatCard label="Pending Verification" value={stats.pendingVerification} />
            <StatCard label="Active Assignments" value={stats.activeAssignments} />
            <StatCard label="Commission Pending Approval" value={stats.commissionPendingApproval} />
          </div>
        )}

        {tab === "inbox" && (
          <div className="flex flex-col gap-3">
            {leads.length === 0 ? (
              <EmptyState title="No leads yet" message="Leads submitted by Digital and Field Channel Partners will appear here." />
            ) : (
              leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
            )}
          </div>
        )}

        {tab === "verification" && (
          <div className="flex flex-col gap-3">
            {pendingLeads.length === 0 ? (
              <EmptyState title="Nothing to verify" message="All incoming leads have been reviewed." />
            ) : (
              pendingLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  action={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleVerify(lead.id, true)}
                        className="tracked-label flex items-center gap-1.5 border border-gold-400/70 px-3 py-2 text-[10px] text-gold-400 transition hover:bg-gold-400/10"
                      >
                        <FiCheck className="h-3.5 w-3.5" />
                        Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerify(lead.id, false)}
                        className="tracked-label flex items-center gap-1.5 border border-navy-700/60 px-3 py-2 text-[10px] text-muted transition hover:border-red-500/50 hover:text-red-400"
                      >
                        <FiX className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  }
                />
              ))
            )}
          </div>
        )}

        {tab === "assignment" && (
          <div className="flex flex-col gap-3">
            {assignableLeads.length === 0 ? (
              <EmptyState title="No leads ready for assignment" message="Verified leads awaiting a Field Channel Partner will show up here." />
            ) : (
              assignableLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  action={
                    <select
                      aria-label={`Assign ${lead.customer} to a Field Channel Partner`}
                      defaultValue=""
                      onChange={(e) => handleAssign(lead.id, e.target.value)}
                      className={`${selectClass} h-11 w-full min-w-[11rem] text-xs sm:w-auto`}
                    >
                      <option value="" disabled>
                        Assign to Field CP
                      </option>
                      {fieldPartners.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  }
                />
              ))
            )}
          </div>
        )}

        {tab === "visits" && (
          <div className="flex flex-col gap-3">
            {inProgressLeads.length === 0 ? (
              <EmptyState title="No active site visits or deals" message="Assigned leads moving through site visit and deal stages appear here." />
            ) : (
              inProgressLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
            )}
          </div>
        )}

        {tab === "commissions" && (
          <div className="flex flex-col gap-3">
            {commissions.length === 0 ? (
              <EmptyState title="No commissions yet" message="Converted deals awaiting commission approval will appear here." />
            ) : (
              commissions.map((c) => (
                <div
                  key={c.leadId}
                  className="flex flex-col gap-3 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm text-cream">{c.customer}</p>
                    <p className="mt-1 text-xs text-muted">
                      {c.project} · {c.leadId}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <span className="text-sm text-gold-400">{c.amount}</span>
                    <Badge tone={APPROVAL_STATUS_TONE[c.approvalStatus] || "muted"}>{c.approvalStatus}</Badge>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCommissionUpdate(c.leadId, "Approved")}
                        className="tracked-label border border-gold-400/70 px-3 py-2 text-[10px] text-gold-400 transition hover:bg-gold-400/10"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCommissionUpdate(c.leadId, "On Hold")}
                        className="tracked-label border border-navy-700/60 px-3 py-2 text-[10px] text-muted transition hover:border-red-500/50 hover:text-red-400"
                      >
                        Hold
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "network" && (
          <div className="overflow-x-auto border border-navy-700/60 bg-navy-900">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="tracked-label border-b border-navy-700/60 text-[10px] text-muted">
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Leads Submitted</th>
                  <th className="px-4 py-3">Site Visits</th>
                  <th className="px-4 py-3">Deals Closed</th>
                </tr>
              </thead>
              <tbody>
                {network.map((p) => (
                  <tr key={p.id} className="border-b border-navy-700/60 last:border-0">
                    <td className="px-4 py-3 text-cream">{p.name}</td>
                    <td className="px-4 py-3">
                      <Badge tone={p.cpType === "field" ? "gold" : "muted"}>
                        {p.cpType === "field" ? "Field CP" : "Digital CP"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.leadsSubmitted}</td>
                    <td className="px-4 py-3 text-muted">{p.siteVisits}</td>
                    <td className="px-4 py-3 text-muted">{p.dealsClosed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
