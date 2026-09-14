"use client";

import { useState } from "react";
import Link from "next/link";
import { MdCall, MdContentCopy, MdCheck, MdPersonAddAlt1 } from "react-icons/md";
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
  const [leadList, setLeadList] = useState(leads);
  const [clientList, setClientList] = useState(clients);
  const [convertingId, setConvertingId] = useState(null);

  async function handleConvertToClient(lead) {
    if (convertingId) return;
    setConvertingId(lead.id);
    try {
      const res = await fetch(`/api/leads/${lead.id}/convert`, { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setLeadList((prev) => prev.filter((l) => l.id !== lead.id));
      setClientList((prev) => [data.data, ...prev]);
    } catch {
      // best-effort — leave the lead in place if the conversion failed
    } finally {
      setConvertingId(null);
    }
  }

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
                <PropertyGrid
                  properties={listings}
                  emptyMessage="You don't have any listings yet."
                  hideContactButton
                />
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
            {leadList.length === 0 && <EmptyState message="No leads yet." />}
            {leadList.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                converting={convertingId === lead.id}
                onConvert={() => handleConvertToClient(lead)}
              />
            ))}
          </div>
        )}

        {tab === "clients" && (
          <div className="flex flex-col gap-3">
            {clientList.length === 0 && <EmptyState message="No clients yet." />}
            {clientList.map((client) => (
              <div
                key={client.id || client.name}
                className="flex flex-col gap-2 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm text-cream">{client.name}</p>
                  <p className="mt-1 break-words text-xs text-muted">{client.phone}</p>
                  {client.address && <p className="mt-1 break-words text-xs text-muted">{client.address}</p>}
                  <p className="mt-1 break-words text-xs text-muted">{client.property}</p>
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
            {commissions.length === 0 && <EmptyState message="No commissions recorded yet." />}
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

function LeadCard({ lead, converting, onConvert }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(lead.phone);
    } catch {
      // Clipboard API unavailable — silently ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-cream">{lead.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted">{lead.phone}</span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy phone number"
            className={`hidden h-6 w-6 shrink-0 items-center justify-center rounded-sm border transition active:scale-95 sm:inline-flex ${
              copied
                ? "border-gold-400 bg-gold-400 text-navy-950"
                : "border-navy-700/60 text-gold-400 hover:border-gold-400"
            }`}
          >
            {copied ? <MdCheck className="h-3.5 w-3.5" /> : <MdContentCopy className="h-3.5 w-3.5" />}
          </button>
          <a
            href={`tel:${lead.phone.replace(/\s+/g, "")}`}
            aria-label="Call now"
            className="flex h-9 min-w-[44px] items-center justify-center gap-1.5 rounded-sm border border-navy-700/60 px-3 text-xs text-gold-400 transition hover:border-gold-400 sm:hidden"
          >
            <MdCall className="h-4 w-4 shrink-0" />
            Call Now
          </a>
        </div>
        <p className="mt-1 break-words text-xs text-muted">Interested in {lead.interest}</p>
        {lead.address && <p className="mt-1 break-words text-xs text-muted">{lead.address}</p>}
        <p className="tracked-label mt-1 text-[10px] text-muted">
          {lead.source} · {lead.date}
        </p>
      </div>

      <div className="flex flex-row items-center justify-between gap-2 sm:flex-col sm:items-end">
        <Badge tone={LEAD_TONE[lead.status] || "muted"}>{lead.status}</Badge>
        <button
          type="button"
          onClick={onConvert}
          disabled={converting}
          className="tracked-label flex min-h-[44px] items-center justify-center gap-1.5 border border-gold-500/70 px-3 py-2 text-[10px] text-gold-400 transition hover:bg-gold-500/10 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-0 sm:py-2"
        >
          <MdPersonAddAlt1 className="h-4 w-4 shrink-0" />
          {converting ? "Converting…" : "Convert to Client"}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="border border-navy-700/60 bg-navy-900 px-6 py-16 text-center">
      <p className="text-muted">{message}</p>
    </div>
  );
}
