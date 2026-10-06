"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiCheck,
  FiX,
  FiEdit3,
  FiLink,
  FiPlus,
  FiSend,
  FiArrowRight,
  FiNavigation,
  FiCamera,
  FiChevronDown,
  FiSearch,
} from "react-icons/fi";
import { MdSell, MdLockOpen, MdContentCopy, MdCheck, MdCall } from "react-icons/md";
import Tabs from "./Tabs";
import StatCard from "./StatCard";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import PropertyGrid from "@/components/property/PropertyGrid";
import { CP_TYPE_LABEL, VIDEO_STATUS_TONE, VISIT_STATUS_TONE, LEAD_STATUS_TONE, APPROVAL_STATUS_TONE } from "./channel-partner/tones";
import RefreshButton from "./RefreshButton";
import { usePersistentTab } from "@/lib/usePersistentTab";
import { toast } from "sonner";
import StateCitySearchFields from "@/components/shared/StateCitySearchFields";

const PICKER_INPUT_CLASS =
  "h-11 w-full rounded-none border border-navy-700/60 bg-navy-950 px-3 text-sm text-cream placeholder:text-muted outline-none transition focus:border-gold-400 disabled:cursor-not-allowed disabled:opacity-50";
const PICKER_LABEL_CLASS = "tracked-label text-[10px] text-muted";
const PICKER_MENU_CLASS = "border border-navy-700/60 bg-navy-950 text-cream";
const PICKER_OPTION_CLASS = "text-cream hover:bg-gold-500/10 hover:text-gold-400";

function formatCpLabel(name, city, state) {
  const place = [city, state].filter(Boolean).join(", ");
  return place ? `${name} — ${place}` : name;
}

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function PhoneActions({ phone }) {
  const [copied, setCopied] = useState(false);
  if (!phone) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(phone);
    } catch {
      // Clipboard API unavailable — silently ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy phone number"
        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition active:scale-95 ${
          copied
            ? "border-gold-400 bg-gold-400 text-navy-950"
            : "border-navy-700/60 text-gold-400 hover:border-gold-400"
        }`}
      >
        {copied ? <MdCheck className="h-3.5 w-3.5" /> : <MdContentCopy className="h-3.5 w-3.5" />}
      </button>
      <a
        href={`tel:${phone.replace(/\s+/g, "")}`}
        aria-label="Call now"
        className="hidden h-9 min-w-[44px] items-center justify-center gap-1.5 rounded-full border border-navy-700/60 px-3 text-xs text-gold-400 transition hover:border-gold-400 active:scale-[0.98] sm:inline-flex"
      >
        <MdCall className="h-4 w-4 shrink-0" />
        Call
      </a>
    </span>
  );
}

function VisitTimelineStep({ icon: Icon, label, state, timestamp }) {
  const circleClass =
    state === "done"
      ? "border-gold-400 bg-gold-400 text-navy-950"
      : state === "active"
      ? "border-gold-400 bg-navy-950 text-gold-400 shadow-[0_0_0_4px_rgba(255,198,51,0.15)]"
      : "border-navy-700/60 bg-navy-950 text-muted";

  return (
    <div className="flex flex-col items-center gap-2">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${circleClass}`}>
        {state === "done" ? <FiCheck className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </span>
      <span
        className={`tracked-label w-24 text-center text-[10px] leading-tight ${
          state === "upcoming" ? "text-muted" : "text-cream"
        }`}
      >
        {label}
      </span>
      {timestamp && <span className="w-24 text-center text-[9px] leading-tight text-muted">{timestamp}</span>}
    </div>
  );
}

function VisitTimelineConnector({ done }) {
  return <span className={`mt-5 h-0.5 flex-1 shrink transition ${done ? "bg-gold-400" : "bg-navy-700/60"}`} />;
}

function PartnerChip({ label, sub, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 flex-col items-start gap-0.5 rounded-full border px-4 py-2 text-left transition active:scale-[0.98] ${
        active ? "border-gold-400 bg-gold-400/10" : "border-navy-700/60 bg-navy-900 hover:border-gold-500/50"
      }`}
    >
      <span className={`tracked-label text-[10px] ${active ? "text-gold-400" : "text-cream"}`}>{label}</span>
      {sub && <span className="text-[10px] text-muted">{sub}</span>}
    </button>
  );
}

function ShowMoreButton({ remaining, onClick }) {
  if (remaining <= 0) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="tracked-label self-start rounded-full border border-navy-700/60 px-4 py-2 text-[10px] text-muted transition hover:border-gold-400/70 hover:text-gold-400 active:scale-[0.98]"
    >
      Show More ({remaining} more)
    </button>
  );
}

const FIELD_SUBTABS = [
  { key: "visits", label: "Site Visits" },
  { key: "leads", label: "Leads" },
  { key: "commissions", label: "Commissions" },
];

const DIGITAL_SUBTABS = [
  { key: "adLinks", label: "Ad Links" },
  { key: "leads", label: "Leads" },
  { key: "commissions", label: "Commissions" },
];

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "projects", label: "Assigned Projects" },
  { key: "trackField", label: "Track Field CP" },
  { key: "trackDigital", label: "Track Digital CP" },
  { key: "freelancerLeads", label: "Freelancer Leads" },
  { key: "listings", label: "My Listings" },
];

export default function CompanyCPDashboard({
  stats,
  network,
  partner,
  myListings = [],
}) {
  const [tab, setTab] = usePersistentTab(
    "cp_tab_company",
    TABS.map((t) => t.key),
    "overview"
  );
  const [assignments, setAssignments] = useState([]);
  const [openPicker, setOpenPicker] = useState({});
  const [pickerLocation, setPickerLocation] = useState({ state: "", city: "" });
  const [soldBusyId, setSoldBusyId] = useState(null);
  const [videos, setVideos] = useState([]);
  const [leads, setLeads] = useState([]);
  const [siteVisits, setSiteVisits] = useState([]);
  const [delegatedLeads, setDelegatedLeads] = useState([]);
  const [cpCommissions, setCpCommissions] = useState([]);
  const [adLinks, setAdLinks] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");

  // Track Field CP / Track Digital CP — partner picker, sub-section tabs,
  // expanded live-tracking row, and "show more" pagination so the view
  // stays scannable as the network grows past a handful of partners.
  const [fieldFilterId, setFieldFilterId] = useState("all");
  const [digitalFilterId, setDigitalFilterId] = useState("all");
  const [fieldPartnerQuery, setFieldPartnerQuery] = useState("");
  const [digitalPartnerQuery, setDigitalPartnerQuery] = useState("");
  const [fieldShowAllPartners, setFieldShowAllPartners] = useState(false);
  const [digitalShowAllPartners, setDigitalShowAllPartners] = useState(false);
  const [fieldSubTab, setFieldSubTab] = useState("visits");
  const [digitalSubTab, setDigitalSubTab] = useState("adLinks");
  const [expandedVisitId, setExpandedVisitId] = useState(null);
  const [shownCounts, setShownCounts] = useState({});

  function shownFor(key) {
    return shownCounts[key] ?? 8;
  }
  function showMoreFor(key) {
    setShownCounts((prev) => ({ ...prev, [key]: shownFor(key) + 8 }));
  }

  // Per-section refresh keys — incrementing these resets the section's local state
  const [refreshKeys, setRefreshKeys] = useState({
    overview: 0,
    projects: 0,
    trackField: 0,
    trackDigital: 0,
    freelancerLeads: 0,
  });

  const loadAssignments = useCallback(async () => {
    if (!partner?.accountId) return;
    try {
      const [receivedRes, delegatedRes] = await Promise.all([
        fetch(`/api/assignments?assignedToAccountId=${partner.accountId}`),
        fetch(`/api/assignments?assignedByAccountId=${partner.accountId}`),
      ]);
      const [receivedJson, delegatedJson] = await Promise.all([receivedRes.json(), delegatedRes.json()]);
      const received = receivedJson.success ? receivedJson.data : [];
      const delegated = delegatedJson.success ? delegatedJson.data : [];
      const byId = new Map([...received, ...delegated].map((a) => [a.id, a]));
      setAssignments([...byId.values()]);
    } catch {
      toast.error("Failed to load assigned projects");
    }
  }, [partner]);

  const digitalPartnerAccountIds = useMemo(
    () => new Set(network.filter((p) => p.cpType === "digital").map((p) => p.accountId)),
    [network]
  );

  const loadVideos = useCallback(async () => {
    try {
      const res = await fetch("/api/campaign-videos");
      const json = await res.json();
      setVideos(json.success ? json.data.filter((v) => digitalPartnerAccountIds.has(v.partnerAccountId)) : []);
    } catch {
      setVideos([]);
    }
  }, [digitalPartnerAccountIds]);

  const loadLeads = useCallback(async () => {
    if (!partner?.accountId) return;
    try {
      const res = await fetch(`/api/cp-leads?routingStage=company-cp`);
      const json = await res.json();
      setLeads(json.success ? json.data.filter((l) => l.assignedToAccountId === partner.accountId) : []);
    } catch {
      setLeads([]);
    }
  }, [partner]);

  // Real-time tracking of every Field/Digital CP this company has delegated
  // a project to — mirrors what the admin panel's Head CP tracking shows.
  const loadTracking = useCallback(async () => {
    if (!partner?.accountId) return;
    try {
      const [visitsRes, leadsRes, commRes, adLinksRes] = await Promise.all([
        fetch(`/api/site-visits?delegatedByAccountId=${partner.accountId}`),
        fetch(`/api/cp-leads?delegatedByAccountId=${partner.accountId}`),
        fetch(`/api/commissions?delegatedByAccountId=${partner.accountId}`),
        fetch(`/api/ad-links?delegatedByAccountId=${partner.accountId}`),
      ]);
      const [visitsJson, leadsJson, commJson, adLinksJson] = await Promise.all([
        visitsRes.json(),
        leadsRes.json(),
        commRes.json(),
        adLinksRes.json(),
      ]);
      setSiteVisits(visitsJson.success ? visitsJson.data : []);
      setDelegatedLeads(leadsJson.success ? leadsJson.data : []);
      setCpCommissions(commJson.success ? commJson.data : []);
      setAdLinks(adLinksJson.success ? adLinksJson.data : []);
    } catch {
      setSiteVisits([]);
      setDelegatedLeads([]);
      setCpCommissions([]);
      setAdLinks([]);
    }
  }, [partner]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      loadAssignments();
      loadVideos();
      loadLeads();
      loadTracking();
    });
    return () => { active = false; };
  }, [loadAssignments, loadVideos, loadLeads, loadTracking]);

  const refreshSection = useCallback(
    (section) => {
      setRefreshKeys((prev) => ({ ...prev, [section]: prev[section] + 1 }));
      // Reset section-specific local state
      if (section === "projects") loadAssignments();
      if (section === "trackField") {
        setExpandedVisitId(null);
        loadTracking();
      }
      if (section === "trackDigital") {
        setEditingNoteId(null);
        setNoteDraft("");
        loadVideos();
        loadTracking();
      }
      if (section === "freelancerLeads") loadLeads();
    },
    [loadAssignments, loadVideos, loadLeads, loadTracking]
  );

  const fieldPartners = network.filter((p) => p.cpType === "field");
  const digitalPartners = network.filter((p) => p.cpType === "digital");

  function visitsForPartner(accountId) {
    return siteVisits.filter((v) => v.fieldCpAccountId === accountId);
  }
  function leadsForPartner(accountId) {
    return delegatedLeads.filter((l) => l.submittedBy?.accountId === accountId);
  }
  function commissionsForPartner(accountId) {
    return cpCommissions.filter((c) => c.cpAccountId === accountId);
  }
  function adLinksForPartner(accountId) {
    return adLinks.filter((l) => l.digitalCpAccountId === accountId);
  }
  function dealsClosedForPartner(accountId) {
    return leadsForPartner(accountId).filter((l) => l.status === "Converted").length;
  }
  function partnerName(accountId) {
    return network.find((p) => p.accountId === accountId)?.name || accountId || "—";
  }
  function fieldLastActivityAt(accountId) {
    const timestamps = [...visitsForPartner(accountId), ...leadsForPartner(accountId)]
      .map((r) => (r.createdAt ? new Date(r.createdAt).getTime() : 0))
      .filter(Boolean);
    return timestamps.length ? Math.max(...timestamps) : 0;
  }
  function digitalLastActivityAt(accountId) {
    const timestamps = [...adLinksForPartner(accountId), ...leadsForPartner(accountId)]
      .map((r) => (r.createdAt ? new Date(r.createdAt).getTime() : 0))
      .filter(Boolean);
    return timestamps.length ? Math.max(...timestamps) : 0;
  }

  const fieldLeadsAll = delegatedLeads.filter((l) => l.submittedBy?.cpType === "field");
  const digitalLeadsAll = delegatedLeads.filter((l) => l.submittedBy?.cpType === "digital");
  const fieldCommissionsAll = cpCommissions.filter((c) => c.cpType === "field");
  const digitalCommissionsAll = cpCommissions.filter((c) => c.cpType === "digital");

  const sortedFieldPartners = [...fieldPartners]
    .filter((p) => {
      const q = fieldPartnerQuery.trim().toLowerCase();
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    })
    .sort((a, b) => fieldLastActivityAt(b.accountId) - fieldLastActivityAt(a.accountId));
  const filteredFieldPartners =
    fieldShowAllPartners || fieldPartnerQuery.trim() ? sortedFieldPartners : sortedFieldPartners.slice(0, 5);

  const sortedDigitalPartners = [...digitalPartners]
    .filter((p) => {
      const q = digitalPartnerQuery.trim().toLowerCase();
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    })
    .sort((a, b) => digitalLastActivityAt(b.accountId) - digitalLastActivityAt(a.accountId));
  const filteredDigitalPartners =
    digitalShowAllPartners || digitalPartnerQuery.trim() ? sortedDigitalPartners : sortedDigitalPartners.slice(0, 5);

  const visibleFieldVisits = fieldFilterId === "all" ? siteVisits : visitsForPartner(fieldFilterId);
  const visibleFieldLeads = fieldFilterId === "all" ? fieldLeadsAll : leadsForPartner(fieldFilterId);
  const visibleFieldCommissions = fieldFilterId === "all" ? fieldCommissionsAll : commissionsForPartner(fieldFilterId);

  const visibleDigitalAdLinks = digitalFilterId === "all" ? adLinks : adLinksForPartner(digitalFilterId);
  const visibleDigitalLeads = digitalFilterId === "all" ? digitalLeadsAll : leadsForPartner(digitalFilterId);
  const visibleDigitalCommissions = digitalFilterId === "all" ? digitalCommissionsAll : commissionsForPartner(digitalFilterId);

  const delegationsByParent = useMemo(() => {
    const map = new Map();
    for (const a of assignments) {
      if (!a.parentAssignmentId) continue;
      if (!map.has(a.parentAssignmentId)) map.set(a.parentAssignmentId, new Set());
      map.get(a.parentAssignmentId).add(a.assignedToAccountId);
    }
    return map;
  }, [assignments]);

  function delegatedAccountIds(projectId) {
    return delegationsByParent.get(projectId) || new Set();
  }

  // Properties Head CP has handed down to this Company CP.
  const assignedProjects = assignments.filter(
    (a) => a.level === "head-to-company" && a.assignedToAccountId === partner?.accountId
  );

  async function handleDelegate(assignmentId, cpType, accountId) {
    if (!accountId) return;
    const parent = assignedProjects.find((a) => a.id === assignmentId);
    if (!parent) return;
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: parent.propertyId,
          propertyTitle: parent.propertyTitle,
          propertyImage: parent.propertyImage,
          propertyLocation: parent.propertyLocation,
          level: cpType === "field" ? "company-to-field" : "company-to-digital",
          assignedToAccountId: accountId,
          parentAssignmentId: assignmentId,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delegate");
      toast.success(`Delegated to ${json.data.assignedToName}`);
      setOpenPicker((prev) => ({ ...prev, [assignmentId]: null }));
      loadAssignments();
    } catch (err) {
      toast.error(err.message || "Failed to delegate");
    }
  }

  async function toggleSold(project) {
    const nextSold = project.propertyStatus !== "Sold";
    setSoldBusyId(project.id);
    try {
      const res = await fetch(`/api/properties/${project.propertyId}/mark-sold`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sold: nextSold }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update property");
      toast.success(nextSold ? "Property marked as sold" : "Property reopened");
      setAssignments((prev) =>
        prev.map((a) =>
          a.propertyId === project.propertyId
            ? { ...a, propertyStatus: nextSold ? "Sold" : "Active" }
            : a
        )
      );
    } catch (err) {
      toast.error(err.message || "Failed to update property");
    } finally {
      setSoldBusyId(null);
    }
  }

  function togglePicker(projectId, cpType) {
    setOpenPicker((prev) => ({
      ...prev,
      [projectId]: prev[projectId] === cpType ? null : cpType,
    }));
    setPickerLocation({ state: "", city: "" });
  }

  const hasPickerLocation = !!(pickerLocation.state && pickerLocation.city);
  function filterPartnersByLocation(list) {
    if (!hasPickerLocation) return [];
    return list.filter(
      (p) =>
        p.state?.trim().toLowerCase() === pickerLocation.state.trim().toLowerCase() &&
        p.city?.trim().toLowerCase() === pickerLocation.city.trim().toLowerCase()
    );
  }

  async function updateVideoStatus(id, status, note = "") {
    setEditingNoteId(null);
    setNoteDraft("");
    try {
      const res = await fetch(`/api/campaign-videos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update video");
      setVideos((prev) => prev.map((v) => (v.id === id ? json.data : v)));
    } catch (error) {
      toast.error(error.message || "Couldn't update the video — please try again");
    }
  }

  function startSuggestEdit(video) {
    setEditingNoteId(video.id);
    setNoteDraft(video.note || "");
  }

  function submitSuggestEdit(id) {
    if (!noteDraft.trim()) return;
    updateVideoStatus(id, "Suggested Edit", noteDraft.trim());
  }

  return (
    <div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-8">
        {tab === "overview" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="tracked-label text-xs text-gold-400">Performance Overview</p>
              <RefreshButton onRefresh={() => refreshSection("overview")} label="Refresh overview" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4" key={refreshKeys.overview}>
              <StatCard label="Total Leads" value={stats.totalLeads} />
              <StatCard label="Pending Verification" value={stats.pendingVerification} />
              <StatCard label="Active Assignments" value={stats.activeAssignments} />
              <StatCard label="Commission Pending Approval" value={stats.commissionPendingApproval} />
            </div>
          </div>
        )}

        {tab === "projects" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <p className="tracked-label text-xs text-gold-400">Assigned Projects</p>
              <RefreshButton onRefresh={() => refreshSection("projects")} label="Refresh projects" />
            </div>
            <div key={refreshKeys.projects}>
            {assignedProjects.length === 0 ? (
              <EmptyState title="No projects assigned yet" message="Properties assigned to you by Head CP will appear here — decide whether each goes to a Field CP or a Digital CP." />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {assignedProjects.map((project) => {
                  const propHref = `/property/${project.propertyId || project.id}?campaign=1`;
                  const isSold = project.propertyStatus === "Sold";
                  return (
                    <div key={project.id} className="flex flex-col justify-between border border-navy-700/60 bg-navy-900 p-4 transition hover:border-gold-500/50">
                      <Link href={propHref} className="group flex flex-col">
                        <div className="relative h-40 w-full overflow-hidden rounded-sm">
                          <Image
                            src={project.propertyImage || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80&auto=format&fit=crop"}
                            alt={project.propertyTitle || "Property"}
                            fill
                            sizes="(max-width: 640px) 100vw, 33vw"
                            className="object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                        <h3 className="mt-3 font-display text-base text-cream transition group-hover:text-gold-400">{project.propertyTitle}</h3>
                        <p className="mt-1 text-xs text-muted">{project.propertyLocation}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-gold-400">
                            <span className="font-medium">View Property Details</span>
                            <FiArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                          </div>
                          {isSold && (
                            <span className="tracked-label flex items-center gap-1 rounded-full border border-red-500/70 px-2.5 py-1 text-[10px] text-red-400">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </Link>

                      <div className="mt-4 flex flex-col gap-2 border-t border-navy-700/60 pt-4">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={fieldPartners.length === 0 || isSold}
                            onClick={() => togglePicker(project.id, "field")}
                            className="tracked-label flex h-11 items-center justify-center gap-2 rounded-full border border-gold-500/70 px-3 text-[10px] text-gold-400 transition hover:bg-gold-500/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
                          >
                            <FiSend className="h-3.5 w-3.5" />
                            Forward to Field CP
                          </button>
                          <button
                            type="button"
                            disabled={digitalPartners.length === 0 || isSold}
                            onClick={() => togglePicker(project.id, "digital")}
                            className="tracked-label flex h-11 items-center justify-center gap-2 rounded-full bg-gold-400 px-3 text-[10px] text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
                          >
                            <FiSend className="h-3.5 w-3.5" />
                            Forward to Digital CP
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={soldBusyId === project.id}
                          onClick={() => toggleSold(project)}
                          className={`tracked-label flex h-11 items-center justify-center gap-2 rounded-full px-3 text-[10px] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${
                            isSold
                              ? "border border-navy-700/60 text-cream hover:border-gold-500/50 hover:text-gold-400"
                              : "border border-red-500/70 text-red-400 hover:bg-red-500/10"
                          }`}
                        >
                          {isSold ? (
                            <>
                              <MdLockOpen className="h-3.5 w-3.5" />
                              Reopen Property
                            </>
                          ) : (
                            <>
                              <MdSell className="h-3.5 w-3.5" />
                              Mark as Sold
                            </>
                          )}
                        </button>

                        {!isSold && openPicker[project.id] === "field" && (
                          <div className="flex flex-col gap-3 border border-navy-700/60 bg-navy-950 p-3">
                            <StateCitySearchFields
                              state={pickerLocation.state}
                              city={pickerLocation.city}
                              onChange={setPickerLocation}
                              inputClassName={PICKER_INPUT_CLASS}
                              labelClassName={PICKER_LABEL_CLASS}
                              menuClassName={PICKER_MENU_CLASS}
                              optionClassName={PICKER_OPTION_CLASS}
                            />
                            <div className="flex flex-col gap-1.5">
                              {!hasPickerLocation ? (
                                <p className="px-2 py-2 text-xs text-muted">Select state and city to see Field CPs there.</p>
                              ) : filterPartnersByLocation(fieldPartners).length === 0 ? (
                                <p className="px-2 py-2 text-xs text-muted">No Field CP registered in this location.</p>
                              ) : (
                                filterPartnersByLocation(fieldPartners).map((p) => {
                                  const alreadySent = delegatedAccountIds(project.id).has(p.accountId);
                                  return (
                                    <button
                                      key={p.accountId}
                                      type="button"
                                      disabled={alreadySent}
                                      onClick={() => handleDelegate(project.id, "field", p.accountId)}
                                      className={`flex items-center justify-between px-2 py-2 text-left text-xs transition ${
                                        alreadySent
                                          ? "cursor-not-allowed text-muted opacity-50"
                                          : "text-cream hover:bg-gold-500/10 hover:text-gold-400"
                                      }`}
                                    >
                                      {formatCpLabel(p.name, p.city, p.state)}
                                      {alreadySent ? (
                                        <span className="tracked-label text-[10px] text-muted">Already Sent</span>
                                      ) : (
                                        <FiArrowRight className="h-3.5 w-3.5 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}

                        {!isSold && openPicker[project.id] === "digital" && (
                          <div className="flex flex-col gap-3 border border-navy-700/60 bg-navy-950 p-3">
                            <StateCitySearchFields
                              state={pickerLocation.state}
                              city={pickerLocation.city}
                              onChange={setPickerLocation}
                              inputClassName={PICKER_INPUT_CLASS}
                              labelClassName={PICKER_LABEL_CLASS}
                              menuClassName={PICKER_MENU_CLASS}
                              optionClassName={PICKER_OPTION_CLASS}
                            />
                            <div className="flex flex-col gap-1.5">
                              {!hasPickerLocation ? (
                                <p className="px-2 py-2 text-xs text-muted">Select state and city to see Digital CPs there.</p>
                              ) : filterPartnersByLocation(digitalPartners).length === 0 ? (
                                <p className="px-2 py-2 text-xs text-muted">No Digital CP registered in this location.</p>
                              ) : (
                                filterPartnersByLocation(digitalPartners).map((p) => {
                                  const alreadySent = delegatedAccountIds(project.id).has(p.accountId);
                                  return (
                                    <button
                                      key={p.accountId}
                                      type="button"
                                      disabled={alreadySent}
                                      onClick={() => handleDelegate(project.id, "digital", p.accountId)}
                                      className={`flex items-center justify-between px-2 py-2 text-left text-xs transition ${
                                        alreadySent
                                          ? "cursor-not-allowed text-muted opacity-50"
                                          : "text-cream hover:bg-gold-500/10 hover:text-gold-400"
                                      }`}
                                    >
                                      {formatCpLabel(p.name, p.city, p.state)}
                                      {alreadySent ? (
                                        <span className="tracked-label text-[10px] text-muted">Already Sent</span>
                                      ) : (
                                        <FiArrowRight className="h-3.5 w-3.5 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          </div>
        )}

        {tab === "trackField" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <p className="tracked-label text-xs text-gold-400">Field Channel Partners</p>
              <RefreshButton onRefresh={() => refreshSection("trackField")} label="Refresh field CP tracking" />
            </div>
            <div key={refreshKeys.trackField} className="flex flex-col gap-5">
            {fieldPartners.length === 0 ? (
              <EmptyState title="No Field CPs yet" message="Field Channel Partners in your network will appear here." />
            ) : (
              <>
                {fieldPartners.length > 6 && (
                  <div className="relative">
                    <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      value={fieldPartnerQuery}
                      onChange={(e) => setFieldPartnerQuery(e.target.value)}
                      placeholder="Search Field CPs by name or ID…"
                      className="h-11 w-full border border-navy-700/60 bg-navy-950 pl-9 pr-3 text-sm text-cream outline-none transition placeholder:text-muted focus:border-gold-400"
                    />
                  </div>
                )}

                <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto border border-navy-700/60 bg-navy-950 p-3">
                  <PartnerChip
                    label={`All Partners (${fieldPartners.length})`}
                    active={fieldFilterId === "all"}
                    onClick={() => setFieldFilterId("all")}
                  />
                  {filteredFieldPartners.map((fp) => (
                    <PartnerChip
                      key={fp.accountId}
                      label={fp.name}
                      sub={`${visitsForPartner(fp.accountId).length} visits · ${leadsForPartner(fp.accountId).length} leads`}
                      active={fieldFilterId === fp.accountId}
                      onClick={() => setFieldFilterId(fp.accountId)}
                    />
                  ))}
                  {filteredFieldPartners.length === 0 && (
                    <p className="px-1 py-1 text-xs text-muted">No Field CPs match your search.</p>
                  )}
                </div>

                {!fieldPartnerQuery.trim() && sortedFieldPartners.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setFieldShowAllPartners((prev) => !prev)}
                    className="tracked-label self-start text-[10px] text-gold-400 transition hover:text-gold-300"
                  >
                    {fieldShowAllPartners ? "Show Recent Only" : `View All Partners (${fieldPartners.length})`}
                  </button>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    label="Leads Submitted"
                    value={fieldFilterId === "all" ? fieldLeadsAll.length : leadsForPartner(fieldFilterId).length}
                  />
                  <StatCard
                    label="Site Visits"
                    value={fieldFilterId === "all" ? siteVisits.length : visitsForPartner(fieldFilterId).length}
                  />
                  <StatCard
                    label="Deals Closed"
                    value={
                      fieldFilterId === "all"
                        ? fieldLeadsAll.filter((l) => l.status === "Converted").length
                        : dealsClosedForPartner(fieldFilterId)
                    }
                  />
                </div>

                <Tabs tabs={FIELD_SUBTABS} active={fieldSubTab} onChange={setFieldSubTab} />

                {fieldSubTab === "visits" && (
                  visibleFieldVisits.length === 0 ? (
                    <EmptyState title="No site visits yet" message="Site visits logged by this partner will appear here." />
                  ) : (
                    <div className="flex flex-col gap-2">
                      {visibleFieldVisits.slice(0, shownFor("fieldVisits")).map((v) => {
                        const readyDone = !!v.movingAt;
                        const photoDone = !!v.photoAt;
                        const doneDone = !!v.doneAt;
                        const isOpen = expandedVisitId === v.id;
                        return (
                          <div key={v.id} className="border border-navy-700/60 bg-navy-900">
                            <button
                              type="button"
                              onClick={() => setExpandedVisitId(isOpen ? null : v.id)}
                              className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-navy-950/60"
                            >
                              <div className="min-w-0">
                                <p className="text-xs text-cream">
                                  {v.customer || "—"} <span className="text-muted">· {v.project || "—"}</span>
                                </p>
                                <p className="mt-0.5 text-[10px] text-muted">
                                  {fieldFilterId === "all" ? `${partnerName(v.fieldCpAccountId)} · ` : ""}
                                  {v.scheduledAt || "—"}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-3">
                                <Badge tone={VISIT_STATUS_TONE[v.status] || "muted"}>{v.status}</Badge>
                                <FiChevronDown
                                  className={`h-4 w-4 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                                />
                              </div>
                            </button>

                            {isOpen && (
                              <div className="border-t border-navy-700/60 p-4">
                                <div className="flex items-start">
                                  <VisitTimelineStep
                                    icon={FiNavigation}
                                    label="Ready to Move"
                                    state={readyDone ? "done" : "active"}
                                    timestamp={readyDone ? formatDateTime(v.movingAt) : ""}
                                  />
                                  <VisitTimelineConnector done={readyDone} />
                                  <VisitTimelineStep
                                    icon={FiCamera}
                                    label={photoDone ? `Live Photo (${v.livePhotos?.length || 0})` : "Live Photo"}
                                    state={photoDone ? "done" : readyDone ? "active" : "upcoming"}
                                    timestamp={photoDone ? formatDateTime(v.photoAt) : ""}
                                  />
                                  <VisitTimelineConnector done={photoDone} />
                                  <VisitTimelineStep
                                    icon={FiCheck}
                                    label="Visit Done"
                                    state={doneDone ? "done" : photoDone ? "active" : "upcoming"}
                                    timestamp={doneDone ? formatDateTime(v.doneAt) : ""}
                                  />
                                </div>

                                {v.status === "No Show" && (
                                  <p className="mt-4 text-right text-xs text-red-400">Marked as No Show</p>
                                )}

                                {(v.phone || v.notes) && (
                                  <div className="mt-4 border-t border-navy-700/60 pt-4">
                                    <p className="tracked-label text-xs text-gold-400">Customer Details</p>
                                    {v.phone && (
                                      <div className="mt-2 flex items-center justify-between text-xs text-cream">
                                        <span>{v.phone}</span>
                                        <PhoneActions phone={v.phone} />
                                      </div>
                                    )}
                                    {v.notes && <p className="mt-2 text-xs text-muted">{v.notes}</p>}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <ShowMoreButton
                        remaining={visibleFieldVisits.length - shownFor("fieldVisits")}
                        onClick={() => showMoreFor("fieldVisits")}
                      />
                    </div>
                  )
                )}

                {fieldSubTab === "leads" && (
                  <div className="overflow-x-auto border border-navy-700/60 bg-navy-900">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead>
                        <tr className="tracked-label border-b border-navy-700/60 text-[10px] text-muted">
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3">Project</th>
                          {fieldFilterId === "all" && <th className="px-4 py-3">Partner</th>}
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleFieldLeads.length === 0 ? (
                          <tr>
                            <td colSpan={fieldFilterId === "all" ? 5 : 4} className="px-4 py-10 text-center text-xs text-muted">
                              No leads submitted yet.
                            </td>
                          </tr>
                        ) : (
                          visibleFieldLeads.slice(0, shownFor("fieldLeads")).map((l) => (
                            <tr key={l.id} className="border-b border-navy-700/60 last:border-0">
                              <td className="px-4 py-3 text-cream">{l.customer}</td>
                              <td className="px-4 py-3 text-muted">
                                {l.phone ? (
                                  <div className="flex items-center gap-1.5">
                                    <span>{l.phone}</span>
                                    <PhoneActions phone={l.phone} />
                                  </div>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-4 py-3 text-muted">{l.project || "—"}</td>
                              {fieldFilterId === "all" && (
                                <td className="px-4 py-3 text-muted">{partnerName(l.submittedBy?.accountId)}</td>
                              )}
                              <td className="px-4 py-3">
                                <Badge tone={LEAD_STATUS_TONE[l.status] || "muted"}>{l.status}</Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    {visibleFieldLeads.length > shownFor("fieldLeads") && (
                      <div className="border-t border-navy-700/60 p-3">
                        <ShowMoreButton
                          remaining={visibleFieldLeads.length - shownFor("fieldLeads")}
                          onClick={() => showMoreFor("fieldLeads")}
                        />
                      </div>
                    )}
                  </div>
                )}

                {fieldSubTab === "commissions" && (
                  <div className="overflow-x-auto border border-navy-700/60 bg-navy-900">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead>
                        <tr className="tracked-label border-b border-navy-700/60 text-[10px] text-muted">
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Project</th>
                          {fieldFilterId === "all" && <th className="px-4 py-3">Partner</th>}
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleFieldCommissions.length === 0 ? (
                          <tr>
                            <td colSpan={fieldFilterId === "all" ? 5 : 4} className="px-4 py-10 text-center text-xs text-muted">
                              No commissions yet.
                            </td>
                          </tr>
                        ) : (
                          visibleFieldCommissions.slice(0, shownFor("fieldCommissions")).map((c) => (
                            <tr key={c.id} className="border-b border-navy-700/60 last:border-0">
                              <td className="px-4 py-3 text-cream">{c.customer || "—"}</td>
                              <td className="px-4 py-3 text-muted">{c.project || "—"}</td>
                              {fieldFilterId === "all" && (
                                <td className="px-4 py-3 text-muted">{partnerName(c.cpAccountId)}</td>
                              )}
                              <td className="px-4 py-3 text-gold-400">{c.amount}</td>
                              <td className="px-4 py-3">
                                <Badge tone={APPROVAL_STATUS_TONE[c.approvalStatus] || "muted"}>{c.approvalStatus}</Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    {visibleFieldCommissions.length > shownFor("fieldCommissions") && (
                      <div className="border-t border-navy-700/60 p-3">
                        <ShowMoreButton
                          remaining={visibleFieldCommissions.length - shownFor("fieldCommissions")}
                          onClick={() => showMoreFor("fieldCommissions")}
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            </div>
          </div>
        )}

        {tab === "trackDigital" && (
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <p className="tracked-label text-xs text-gold-400">Digital Channel Partners</p>
              <RefreshButton onRefresh={() => refreshSection("trackDigital")} label="Refresh digital CP tracking" />
            </div>
            <div key={refreshKeys.trackDigital} className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="font-display text-lg text-cream">Digital Channel Partners</h3>
              {digitalPartners.length === 0 ? (
                <EmptyState title="No Digital CPs yet" message="Digital Channel Partners in your network will appear here." />
              ) : (
                <>
                  {digitalPartners.length > 6 && (
                    <div className="relative">
                      <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        type="text"
                        value={digitalPartnerQuery}
                        onChange={(e) => setDigitalPartnerQuery(e.target.value)}
                        placeholder="Search Digital CPs by name or ID…"
                        className="h-11 w-full border border-navy-700/60 bg-navy-950 pl-9 pr-3 text-sm text-cream outline-none transition placeholder:text-muted focus:border-gold-400"
                      />
                    </div>
                  )}

                  <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto border border-navy-700/60 bg-navy-950 p-3">
                    <PartnerChip
                      label={`All Partners (${digitalPartners.length})`}
                      active={digitalFilterId === "all"}
                      onClick={() => setDigitalFilterId("all")}
                    />
                    {filteredDigitalPartners.map((dp) => (
                      <PartnerChip
                        key={dp.accountId}
                        label={dp.name}
                        sub={`${adLinksForPartner(dp.accountId).length} links · ${leadsForPartner(dp.accountId).length} leads`}
                        active={digitalFilterId === dp.accountId}
                        onClick={() => setDigitalFilterId(dp.accountId)}
                      />
                    ))}
                    {filteredDigitalPartners.length === 0 && (
                      <p className="px-1 py-1 text-xs text-muted">No Digital CPs match your search.</p>
                    )}
                  </div>

                  {!digitalPartnerQuery.trim() && sortedDigitalPartners.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setDigitalShowAllPartners((prev) => !prev)}
                      className="tracked-label self-start text-[10px] text-gold-400 transition hover:text-gold-300"
                    >
                      {digitalShowAllPartners ? "Show Recent Only" : `View All Partners (${digitalPartners.length})`}
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <StatCard
                      label="Leads Generated"
                      value={digitalFilterId === "all" ? digitalLeadsAll.length : leadsForPartner(digitalFilterId).length}
                    />
                    <StatCard
                      label="Deals Closed"
                      value={
                        digitalFilterId === "all"
                          ? digitalLeadsAll.filter((l) => l.status === "Converted").length
                          : dealsClosedForPartner(digitalFilterId)
                      }
                    />
                  </div>

                  <Tabs tabs={DIGITAL_SUBTABS} active={digitalSubTab} onChange={setDigitalSubTab} />

                  {digitalSubTab === "adLinks" && (
                    <div className="flex flex-col gap-2">
                      {visibleDigitalAdLinks.length === 0 ? (
                        <EmptyState title="No ad links yet" message="Trackable ad links added by this partner will appear here." />
                      ) : (
                        <>
                          {visibleDigitalAdLinks.slice(0, shownFor("adLinks")).map((link) => (
                            <div key={link.id} className="flex flex-wrap items-center justify-between gap-3 border border-navy-700/60 bg-navy-900 p-4">
                              <div className="flex min-w-0 items-start gap-3">
                                <FiLink className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                                <div className="min-w-0">
                                  <p className="text-xs text-cream">
                                    {link.platform}
                                    {digitalFilterId === "all" && (
                                      <span className="text-muted"> · {partnerName(link.digitalCpAccountId)}</span>
                                    )}
                                  </p>
                                  <a
                                    href={link.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-0.5 block truncate text-xs text-gold-400 hover:text-gold-300"
                                  >
                                    {link.link}
                                  </a>
                                </div>
                              </div>
                              <span className="shrink-0 text-xs text-muted">{link.date}</span>
                            </div>
                          ))}
                          <ShowMoreButton
                            remaining={visibleDigitalAdLinks.length - shownFor("adLinks")}
                            onClick={() => showMoreFor("adLinks")}
                          />
                        </>
                      )}
                    </div>
                  )}

                  {digitalSubTab === "leads" && (
                    <div className="overflow-x-auto border border-navy-700/60 bg-navy-900">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead>
                          <tr className="tracked-label border-b border-navy-700/60 text-[10px] text-muted">
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Source / Phone</th>
                            {digitalFilterId === "all" && <th className="px-4 py-3">Partner</th>}
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleDigitalLeads.length === 0 ? (
                            <tr>
                              <td colSpan={digitalFilterId === "all" ? 4 : 3} className="px-4 py-10 text-center text-xs text-muted">
                                No leads submitted yet.
                              </td>
                            </tr>
                          ) : (
                            visibleDigitalLeads.slice(0, shownFor("digitalLeads")).map((l) => (
                              <tr key={l.id} className="border-b border-navy-700/60 last:border-0">
                                <td className="px-4 py-3 text-cream">
                                  {l.customer}
                                  <span className="tracked-label ml-2 text-[10px] text-muted">{l.project || ""}</span>
                                </td>
                                <td className="px-4 py-3 text-muted">
                                  <div className="flex items-center gap-1.5">
                                    <span>{l.source || "—"}</span>
                                    {l.phone && (
                                      <>
                                        <span>· {l.phone}</span>
                                        <PhoneActions phone={l.phone} />
                                      </>
                                    )}
                                  </div>
                                </td>
                                {digitalFilterId === "all" && (
                                  <td className="px-4 py-3 text-muted">{partnerName(l.submittedBy?.accountId)}</td>
                                )}
                                <td className="px-4 py-3">
                                  <Badge tone={LEAD_STATUS_TONE[l.status] || "muted"}>{l.status}</Badge>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                      {visibleDigitalLeads.length > shownFor("digitalLeads") && (
                        <div className="border-t border-navy-700/60 p-3">
                          <ShowMoreButton
                            remaining={visibleDigitalLeads.length - shownFor("digitalLeads")}
                            onClick={() => showMoreFor("digitalLeads")}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {digitalSubTab === "commissions" && (
                    <div className="overflow-x-auto border border-navy-700/60 bg-navy-900">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead>
                          <tr className="tracked-label border-b border-navy-700/60 text-[10px] text-muted">
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Project</th>
                            {digitalFilterId === "all" && <th className="px-4 py-3">Partner</th>}
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleDigitalCommissions.length === 0 ? (
                            <tr>
                              <td colSpan={digitalFilterId === "all" ? 5 : 4} className="px-4 py-10 text-center text-xs text-muted">
                                No commissions yet.
                              </td>
                            </tr>
                          ) : (
                            visibleDigitalCommissions.slice(0, shownFor("digitalCommissions")).map((c) => (
                              <tr key={c.id} className="border-b border-navy-700/60 last:border-0">
                                <td className="px-4 py-3 text-cream">{c.customer || "—"}</td>
                                <td className="px-4 py-3 text-muted">{c.project || "—"}</td>
                                {digitalFilterId === "all" && (
                                  <td className="px-4 py-3 text-muted">{partnerName(c.cpAccountId)}</td>
                                )}
                                <td className="px-4 py-3 text-gold-400">{c.amount}</td>
                                <td className="px-4 py-3">
                                  <Badge tone={APPROVAL_STATUS_TONE[c.approvalStatus] || "muted"}>{c.approvalStatus}</Badge>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                      {visibleDigitalCommissions.length > shownFor("digitalCommissions") && (
                        <div className="border-t border-navy-700/60 p-3">
                          <ShowMoreButton
                            remaining={visibleDigitalCommissions.length - shownFor("digitalCommissions")}
                            onClick={() => showMoreFor("digitalCommissions")}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-display text-lg text-cream">Campaign Videos</h3>
              {videos.length === 0 ? (
                <EmptyState title="No videos submitted" message="Videos submitted by Digital CPs for review will appear here." />
              ) : (
                videos.map((video) => (
                  <div key={video.id} className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-cream">{video.videoName}</p>
                        <p className="mt-1 text-xs text-muted">
                          {video.partnerName} · {video.project}
                        </p>
                      </div>
                      <Badge tone={VIDEO_STATUS_TONE[video.status] || "muted"}>{video.status}</Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-navy-700/60 pt-4">
                      <button
                        type="button"
                        onClick={() => updateVideoStatus(video.id, "Approved")}
                        className="tracked-label flex items-center gap-1.5 rounded-full border border-gold-400/70 px-3.5 py-2 text-[10px] text-gold-400 transition hover:bg-gold-400/10 active:scale-[0.98]"
                      >
                        <FiCheck className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => startSuggestEdit(video)}
                        className="tracked-label flex items-center gap-1.5 rounded-full border border-navy-700/60 px-3.5 py-2 text-[10px] text-muted transition hover:border-gold-400/70 hover:text-gold-400 active:scale-[0.98]"
                      >
                        <FiEdit3 className="h-3.5 w-3.5" />
                        Suggest Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => updateVideoStatus(video.id, "Rejected")}
                        className="tracked-label flex items-center gap-1.5 rounded-full border border-navy-700/60 px-3.5 py-2 text-[10px] text-muted transition hover:border-red-500/50 hover:text-red-400 active:scale-[0.98]"
                      >
                        <FiX className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>

                    {editingNoteId === video.id && (
                      <div className="flex flex-col gap-2 border-t border-navy-700/60 pt-4">
                        <textarea
                          rows={2}
                          placeholder="What changes are needed before this can be posted?"
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          className="w-full border border-navy-700/60 bg-navy-950 p-3 text-sm text-cream placeholder:text-muted outline-none transition focus:border-gold-400"
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => submitSuggestEdit(video.id)}
                            className="tracked-label rounded-full bg-gold-400 px-4 py-2 text-[10px] text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 active:scale-[0.98]"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    )}

                    {video.status === "Suggested Edit" && video.note && editingNoteId !== video.id && (
                      <p className="border-t border-navy-700/60 pt-4 text-xs text-muted">
                        <span className="text-gold-400">Note: </span>
                        {video.note}
                      </p>
                    )}

                    <div className="border-t border-navy-700/60 pt-4">
                      <p className="tracked-label text-xs text-gold-400">Posted On</p>
                      {video.postedLinks.length === 0 ? (
                        <p className="mt-2 text-xs text-muted">Not posted yet.</p>
                      ) : (
                        <div className="mt-2 flex flex-col gap-2">
                          {video.postedLinks.map((link) => (
                            <div key={link.url} className="flex items-center gap-2">
                              <FiLink className="h-3.5 w-3.5 shrink-0 text-gold-400" />
                              <span className="tracked-label text-[10px] text-muted">{link.platform}</span>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="truncate text-xs text-cream hover:text-gold-400"
                              >
                                {link.url}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            </div>
          </div>
        )}

        {tab === "freelancerLeads" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="tracked-label text-xs text-gold-400">Freelancer Leads</p>
              <RefreshButton onRefresh={() => refreshSection("freelancerLeads")} label="Refresh freelancer leads" />
            </div>
            <div className="overflow-x-auto border border-navy-700/60 bg-navy-900" key={refreshKeys.freelancerLeads}>
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="tracked-label border-b border-navy-700/60 text-[10px] text-muted">
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Given By</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-xs text-muted">
                      No freelancer leads yet.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-navy-700/60 last:border-0">
                      <td className="px-4 py-3 text-cream">{lead.project}</td>
                      <td className="px-4 py-3 text-muted">
                        {lead.customer}
                        <span className="tracked-label ml-2 text-[10px] text-muted">{lead.id}</span>
                      </td>
                      <td className="px-4 py-3 text-cream">{lead.submittedBy?.name || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge tone={lead.submittedBy?.cpType === "field" ? "gold" : "muted"}>
                          {CP_TYPE_LABEL[lead.submittedBy?.cpType] || "—"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">{lead.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {tab === "listings" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="tracked-label text-xs text-gold-400">My Listings</p>
              <Link
                href="/post-property"
                className="tracked-label flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 active:scale-[0.98]"
              >
                <FiPlus className="h-3.5 w-3.5" />
                Post Property
              </Link>
            </div>
            <PropertyGrid properties={myListings} emptyMessage="You haven't posted any properties yet." ownerView />
          </div>
        )}
      </div>
    </div>
  );
}
