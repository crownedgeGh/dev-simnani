"use client";

import { useState } from "react";
import EmployeeTabs from "./employee/EmployeeTabs";
import OverviewTab from "./employee/OverviewTab";
import LeadsTab from "./employee/LeadsTab";
import SiteVisitsTab from "./employee/SiteVisitsTab";
import FollowUpsTab from "./employee/FollowUpsTab";
import TerritoryPropertiesTab from "./employee/TerritoryPropertiesTab";
import SalesTab from "./employee/SalesTab";
import PerformanceTab from "./employee/PerformanceTab";
import TerritoryTab from "./employee/TerritoryTab";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "leads", label: "My Leads" },
  { key: "visits", label: "Site Visits" },
  { key: "followups", label: "Follow-ups" },
  { key: "properties", label: "Properties" },
  { key: "sales", label: "Sales" },
  { key: "performance", label: "Performance" },
  { key: "territory", label: "My Territory" },
];

export default function EmployeeDashboard({
  stats,
  leads: initialLeads,
  siteVisits: initialSiteVisits,
  salesTarget,
  performance,
  territory,
  properties,
}) {
  const [tab, setTab] = useState("overview");
  const [leads, setLeads] = useState(initialLeads);
  const [siteVisits, setSiteVisits] = useState(initialSiteVisits);

  function updateLeadStatus(leadId, status) {
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)));
  }

  function addLeadNote(leadId, note) {
    if (!note.trim()) return;
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, notes: [...lead.notes, note.trim()] } : lead
      )
    );
  }

  function rescheduleLead(leadId, nextFollowUp) {
    if (!nextFollowUp.trim()) return;
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, nextFollowUp: nextFollowUp.trim(), dueToday: false }
          : lead
      )
    );
  }

  function scheduleVisit(visit) {
    setSiteVisits((prev) =>
      [
        ...prev,
        {
          id: `SV-EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          status: "Scheduled",
          attended: null,
          feedback: "",
          nextAction: "",
          isToday: true,
          sortMinutes: 1440,
          ...visit,
        },
      ].sort((a, b) => a.sortMinutes - b.sortMinutes)
    );
  }

  function updateVisitOutcome(visitId, outcome) {
    setSiteVisits((prev) =>
      prev.map((visit) => (visit.id === visitId ? { ...visit, ...outcome } : visit))
    );
    if (outcome.status === "Done") {
      const visit = siteVisits.find((v) => v.id === visitId);
      if (visit) {
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === visit.leadId && lead.status === "Site Visit Scheduled"
              ? { ...lead, status: "Site Visit Done" }
              : lead
          )
        );
      }
    }
  }

  const overviewStats = {
    totalAssignedLeads: leads.length,
    newLeads: leads.filter((l) => l.status === "New").length,
    followUpsDueToday: leads.filter((l) => l.dueToday).length,
    siteVisitsScheduled: siteVisits.filter((v) => v.status === "Scheduled").length,
    siteVisitsCompleted: siteVisits.filter((v) => v.status === "Done").length,
    interestedCustomers: leads.filter((l) => l.status === "Interested").length,
    bookings: leads.filter((l) => l.status === "Booked").length,
    pendingFollowUps: leads.filter((l) => !["Booked", "Lost"].includes(l.status) && l.nextFollowUp !== "—")
      .length,
    monthSalesValue: stats.monthSalesValue,
  };

  return (
    <div>
      <EmployeeTabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-8">
        {tab === "overview" && (
          <OverviewTab stats={overviewStats} onViewLeads={() => setTab("leads")} />
        )}
        {tab === "leads" && <LeadsTab leads={leads} onStatusChange={updateLeadStatus} />}
        {tab === "visits" && (
          <SiteVisitsTab
            siteVisits={siteVisits}
            leads={leads}
            onSchedule={scheduleVisit}
            onUpdateOutcome={updateVisitOutcome}
          />
        )}
        {tab === "followups" && (
          <FollowUpsTab leads={leads} onAddNote={addLeadNote} onReschedule={rescheduleLead} />
        )}
        {tab === "properties" && <TerritoryPropertiesTab properties={properties} />}
        {tab === "sales" && <SalesTab salesTarget={salesTarget} />}
        {tab === "performance" && <PerformanceTab performance={performance} leads={leads} />}
        {tab === "territory" && (
          <TerritoryTab territory={territory} leads={leads} siteVisits={siteVisits} properties={properties} />
        )}
      </div>
    </div>
  );
}
