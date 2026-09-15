"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MdCall,
  MdContentCopy,
  MdCheck,
  MdPersonAddAlt1,
  MdTaskAlt,
  MdOutlineStickyNote2,
  MdDeleteOutline,
  MdOpenInNew,
} from "react-icons/md";
import { BiBuildingHouse } from "react-icons/bi";
import Tabs from "./Tabs";
import StatCard from "./StatCard";
import Badge from "./Badge";
import PropertyGrid from "@/components/property/PropertyGrid";
import ConfirmDialog from "./ConfirmDialog";

const BASE_TABS = [
  { key: "overview", label: "Overview" },
  { key: "listings", label: "My Listings" },
  { key: "leads", label: "Leads" },
  { key: "clients", label: "Clients" },
];

const COMMISSIONS_TAB = { key: "commissions", label: "Commissions" };

export default function OwnerDashboard({
  stats,
  listings,
  leads,
  clients,
  commissions = [],
  addPropertyHref = "/portal/broker/add-property",
  showCommissions = true,
}) {
  const TABS = showCommissions ? [...BASE_TABS, COMMISSIONS_TAB] : BASE_TABS;
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

  async function handleAddLeadNote(leadId, note) {
    const res = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, callDone: true }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setLeadList((prev) => prev.map((l) => (l.id === leadId ? { ...l, ...data.data } : l)));
  }

  async function handleToggleLeadCallDone(leadId, callDone) {
    const res = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callDone }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setLeadList((prev) => prev.map((l) => (l.id === leadId ? { ...l, ...data.data } : l)));
  }

  async function handleToggleClientCallDone(clientId, callDone) {
    const res = await fetch(`/api/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callDone }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setClientList((prev) => prev.map((c) => (c.id === clientId ? { ...c, ...data.data } : c)));
  }

  async function handleAddClientNote(clientId, note) {
    const res = await fetch(`/api/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setClientList((prev) => prev.map((c) => (c.id === clientId ? { ...c, ...data.data } : c)));
  }

  async function handleClearLeadNotes(leadId) {
    const res = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearNotes: true }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setLeadList((prev) => prev.map((l) => (l.id === leadId ? { ...l, ...data.data } : l)));
  }

  async function handleClearClientNotes(clientId) {
    const res = await fetch(`/api/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearNotes: true }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setClientList((prev) => prev.map((c) => (c.id === clientId ? { ...c, ...data.data } : c)));
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
                  ownerView
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
                href={addPropertyHref}
                className="tracked-label bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
              >
                Add Property
              </Link>
            </div>
            <PropertyGrid properties={listings} emptyMessage="You don't have any listings yet." ownerView />
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
                onAddNote={(note) => handleAddLeadNote(lead.id, note)}
                onToggleCallDone={(callDone) => handleToggleLeadCallDone(lead.id, callDone)}
                onClearNotes={() => handleClearLeadNotes(lead.id)}
              />
            ))}
          </div>
        )}

        {tab === "clients" && (
          <div className="flex flex-col gap-3">
            {clientList.length === 0 && <EmptyState message="No clients yet." />}
            {clientList.map((client) => (
              <ClientCard
                key={client.id || client.name}
                client={client}
                onAddNote={(note) => handleAddClientNote(client.id, note)}
                onToggleCallDone={(callDone) => handleToggleClientCallDone(client.id, callDone)}
                onClearNotes={() => handleClearClientNotes(client.id)}
              />
            ))}
          </div>
        )}

        {showCommissions && tab === "commissions" && (
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

function LeadCard({ lead, converting, onConvert, onAddNote, onToggleCallDone, onClearNotes }) {
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
        <PropertyLink propertyId={lead.propertyId} title={lead.interest} prefix="Interested in" />
        {lead.address && <p className="mt-1 break-words text-xs text-muted">{lead.address}</p>}
        <p className="tracked-label mt-1 text-[10px] text-muted">
          {lead.source} · {lead.date}
        </p>

        <NoteSection
          callDone={lead.callDone}
          notes={lead.notes}
          onAddNote={onAddNote}
          onToggleCallDone={() => onToggleCallDone(!lead.callDone)}
          onClearNotes={onClearNotes}
        />
      </div>

      <div className="flex flex-row items-center justify-between gap-2 sm:flex-col sm:items-end">
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

function ClientCard({ client, onAddNote, onToggleCallDone, onClearNotes }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(client.phone);
    } catch {
      // Clipboard API unavailable — silently ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-cream">{client.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted">{client.phone}</span>
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
            href={`tel:${client.phone.replace(/\s+/g, "")}`}
            aria-label="Call now"
            className="flex h-9 min-w-[44px] items-center justify-center gap-1.5 rounded-sm border border-navy-700/60 px-3 text-xs text-gold-400 transition hover:border-gold-400 sm:hidden"
          >
            <MdCall className="h-4 w-4 shrink-0" />
            Call Now
          </a>
        </div>
        {client.address && <p className="mt-1 break-words text-xs text-muted">{client.address}</p>}
        <PropertyLink propertyId={client.propertyId} title={client.property} prefix="Deal on" />

        <NoteSection
          callDone={client.callDone}
          notes={client.notes}
          onAddNote={onAddNote}
          onToggleCallDone={() => onToggleCallDone(!client.callDone)}
          onClearNotes={onClearNotes}
        />
      </div>

      <div className="flex flex-row items-center justify-between gap-2 sm:flex-col sm:items-end">
        <a
          href={`tel:${client.phone.replace(/\s+/g, "")}`}
          className="tracked-label hidden min-h-[44px] items-center justify-center gap-1.5 border border-navy-700/60 px-3 py-2 text-[10px] text-gold-400 transition hover:border-gold-400 sm:inline-flex sm:min-h-0"
        >
          <MdCall className="h-4 w-4 shrink-0" />
          Call
        </a>
        <Badge tone="gold">{client.status}</Badge>
        <p className="text-xs text-muted">{client.lastActivity}</p>
      </div>
    </div>
  );
}

function NoteSection({ callDone, notes, onAddNote, onToggleCallDone, onClearNotes }) {
  const noteList = Array.isArray(notes) ? notes : [];
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleAdd() {
    const text = draft.trim();
    if (!text || saving) return;
    setSaving(true);
    try {
      await onAddNote(text);
      setDraft("");
    } catch {
      // best-effort — keep the draft so the user can retry
    } finally {
      setSaving(false);
    }
  }

  async function handleClearAll() {
    if (clearing) return;
    setClearing(true);
    try {
      await onClearNotes();
      setConfirmOpen(false);
    } catch {
      // best-effort — leave the notes in place if the clear failed
    } finally {
      setClearing(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <button
        type="button"
        onClick={onToggleCallDone}
        className={`tracked-label inline-flex w-fit items-center gap-1.5 border px-2.5 py-1.5 text-[10px] transition ${
          callDone
            ? "border-gold-400 bg-gold-400/10 text-gold-400"
            : "border-navy-700/60 text-muted hover:border-navy-600"
        }`}
      >
        <MdTaskAlt className="h-3.5 w-3.5 shrink-0" />
        {callDone ? "Call Done" : "Mark Call Done"}
      </button>

      {noteList.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="tracked-label text-[10px] text-gold-400">Follow-ups</p>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={clearing}
              className="tracked-label inline-flex items-center gap-1 text-[10px] text-muted transition hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MdDeleteOutline className="h-3.5 w-3.5 shrink-0" />
              {clearing ? "Deleting…" : "Delete All"}
            </button>
          </div>
          <div
            className={`mt-1.5 flex flex-col gap-1.5 ${
              noteList.length > 5 ? "max-h-36 overflow-y-auto pr-1" : ""
            }`}
          >
            {noteList.map((n, i) => (
              <p key={i} className="break-words text-sm text-muted">
                <span className="text-cream">{n.date}</span> — {n.text}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-stretch gap-2">
        <div className="relative flex-1">
          <MdOutlineStickyNote2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a follow-up note…"
            className="h-10 w-full border border-navy-700/60 bg-navy-950 pl-9 pr-3 text-sm text-cream placeholder:text-muted outline-none transition focus:border-gold-400"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving || !draft.trim()}
          className="tracked-label shrink-0 border border-gold-500/70 px-4 text-[10px] text-gold-400 transition hover:bg-gold-500/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "…" : "Add"}
        </button>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleClearAll}
        isLoading={clearing}
        title="Delete all follow-ups?"
        message="This will permanently remove every follow-up note on this record. This cannot be undone."
        confirmLabel="Delete All"
      />
    </div>
  );
}

function PropertyLink({ propertyId, title, prefix }) {
  if (!title) return null;

  if (!propertyId) {
    return (
      <p className="mt-1.5 break-words text-xs text-muted">
        {prefix} {title}
      </p>
    );
  }

  return (
    <Link
      href={`/property/${propertyId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 inline-flex max-w-full items-center gap-1.5 border border-navy-700/60 bg-navy-950/60 px-2.5 py-1.5 text-xs text-gold-400 transition hover:border-gold-400 hover:bg-gold-400/5"
    >
      <BiBuildingHouse className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{title}</span>
      <MdOpenInNew className="h-3 w-3 shrink-0 opacity-70" />
    </Link>
  );
}

function EmptyState({ message }) {
  return (
    <div className="border border-navy-700/60 bg-navy-900 px-6 py-16 text-center">
      <p className="text-muted">{message}</p>
    </div>
  );
}
