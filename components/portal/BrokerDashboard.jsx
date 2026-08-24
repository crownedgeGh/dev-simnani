"use client";

import { useState } from "react";
import Link from "next/link";
import Tabs from "./Tabs";
import StatCard from "./StatCard";
import Badge from "./Badge";
import PropertyGrid from "@/components/property/PropertyGrid";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "listings", label: "My Listings" },
  { key: "leads", label: "Leads" },
  { key: "clients", label: "Clients" },
  { key: "commissions", label: "Commissions" },
];

const LEAD_TONE = {
  New: "gold",
  Contacted: "muted",
  "Site Visit": "success",
};

export default function BrokerDashboard({ stats, listings, leads, clients, commissions }) {
  const [tab, setTab] = useState("overview");

  return (
    <div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-8">
        {tab === "overview" && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Active Listings" value={stats.activeListings} />
              <StatCard label="Total Leads" value={stats.totalLeads} />
              <StatCard label="Site Visits" value={stats.siteVisits} />
              <StatCard label="Closed Deals" value={stats.closedDeals} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-cream">Recent Listings</h2>
                <button
                  type="button"
                  onClick={() => setTab("listings")}
                  className="tracked-label text-xs text-gold-400 hover:text-gold-300"
                >
                  View All
                </button>
              </div>
              <div className="mt-4">
                <PropertyGrid properties={listings} />
              </div>
            </div>
          </div>
        )}

        {tab === "listings" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl text-cream">My Listings</h2>
              <Link
                href="/portal/broker/add-property"
                className="tracked-label bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
              >
                Add Property
              </Link>
            </div>
            <PropertyGrid properties={listings} emptyMessage="You don't have any listings yet." />
          </div>
        )}

        {tab === "leads" && (
          <div className="flex flex-col gap-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="flex flex-col gap-2 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm text-cream">{lead.name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {lead.phone} · Interested in {lead.interest}
                  </p>
                  <p className="tracked-label mt-1 text-[10px] text-muted">
                    {lead.source} · {lead.date}
                  </p>
                </div>
                <Badge tone={LEAD_TONE[lead.status] || "muted"}>{lead.status}</Badge>
              </div>
            ))}
          </div>
        )}

        {tab === "clients" && (
          <div className="flex flex-col gap-3">
            {clients.map((client) => (
              <div
                key={client.name}
                className="flex flex-col gap-2 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm text-cream">{client.name}</p>
                  <p className="mt-1 text-xs text-muted">{client.phone}</p>
                  <p className="mt-1 text-xs text-muted">{client.property}</p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <Badge tone="gold">{client.status}</Badge>
                  <p className="text-xs text-muted">{client.lastActivity}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "commissions" && (
          <div className="flex flex-col gap-3">
            {commissions.map((c) => (
              <div
                key={c.property}
                className="flex flex-col gap-2 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm text-cream">{c.property}</p>
                  <p className="mt-1 text-xs text-muted">Deal: {c.dealStatus}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={c.commissionStatus === "Paid" ? "success" : "gold"}>
                    {c.commissionStatus}
                  </Badge>
                  <span className="font-display text-sm text-gold-400">{c.amount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
