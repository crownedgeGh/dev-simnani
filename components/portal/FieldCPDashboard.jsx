"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiPlus, FiCheck, FiSend, FiNavigation, FiCamera, FiUser, FiPhone, FiArrowRight, FiX, FiEdit2, FiChevronDown } from "react-icons/fi";
import { MdContentCopy, MdCheck, MdCall } from "react-icons/md";
import Tabs from "./Tabs";
import StatCard from "./StatCard";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import PropertyGrid from "@/components/property/PropertyGrid";
import { VISIT_STATUS_TONE } from "./channel-partner/tones";
import FormField from "@/components/auth/FormField";
import { inputClass, selectClass, textareaClass } from "@/components/auth/inputStyles";
import { uploadFileToR2 } from "@/lib/uploadToR2";
import RefreshButton from "./RefreshButton";
import { usePersistentTab } from "@/lib/usePersistentTab";
import { toast } from "sonner";

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

function TimelineRow({ icon: Icon, label, time }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="flex items-center gap-2 text-cream">
        <Icon className="h-3.5 w-3.5 shrink-0 text-gold-400" />
        {label}
      </span>
      <span className="shrink-0 text-muted">{time || "—"}</span>
    </div>
  );
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
        className={`hidden h-6 w-6 shrink-0 items-center justify-center rounded-sm border transition active:scale-95 sm:inline-flex ${
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
        className="flex h-9 min-w-[44px] items-center justify-center gap-1.5 rounded-sm border border-navy-700/60 px-3 text-xs text-gold-400 transition hover:border-gold-400 sm:hidden"
      >
        <MdCall className="h-4 w-4 shrink-0" />
        Call
      </a>
    </span>
  );
}

function VisitTimelineStep({ icon: Icon, label, state, onClick, htmlFor, disabled, loading, timestamp, locked }) {
  const circleClass =
    state === "done"
      ? "border-gold-400 bg-gold-400 text-navy-950"
      : state === "active"
      ? "border-gold-400 bg-navy-950 text-gold-400 shadow-[0_0_0_4px_rgba(255,198,51,0.15)]"
      : "border-navy-700/60 bg-navy-950 text-muted";

  const content = (
    <div className="flex flex-col items-center gap-2">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${circleClass}`}>
        {loading ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : state === "done" ? (
          <FiCheck className="h-4 w-4" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
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

  if (locked) {
    return <div className="flex flex-col items-center">{content}</div>;
  }

  if (htmlFor) {
    return (
      <label
        htmlFor={htmlFor}
        className={`flex flex-col items-center ${disabled ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
      >
        {content}
      </label>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center ${disabled ? "cursor-default" : "cursor-pointer"}`}
    >
      {content}
    </button>
  );
}

function VisitTimelineConnector({ done }) {
  return <span className={`mt-5 h-0.5 flex-1 shrink transition ${done ? "bg-gold-400" : "bg-navy-700/60"}`} />;
}

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "assigned", label: "Assigned Projects" },
  { key: "visits", label: "Site Visits" },
  { key: "direct", label: "Add Direct Lead" },
  { key: "earnings", label: "Earnings" },
  { key: "listings", label: "My Listings" },
];

const INITIAL_DIRECT_FORM = { customer: "", phone: "", project: "", notes: "" };

export default function FieldCPDashboard({ stats, leads: initialLeads, siteVisits: initialSiteVisits, projects, partner, myListings = [] }) {
  const [tab, setTab] = usePersistentTab(
    "cp_tab_field",
    TABS.map((t) => t.key),
    "overview"
  );
  const [leads] = useState(initialLeads);
  const [siteVisits, setSiteVisits] = useState(initialSiteVisits);
  const [followUpDrafts, setFollowUpDrafts] = useState({});
  const [visitDrafts, setVisitDrafts] = useState({});
  const [expandedReports, setExpandedReports] = useState({});
  const [delegatedProjects, setDelegatedProjects] = useState([]);

  useEffect(() => {
    if (!partner?.accountId) return;
    let active = true;
    fetch(`/api/assignments?level=company-to-field&assignedToAccountId=${partner.accountId}`)
      .then((res) => res.json())
      .then((json) => {
        if (active) setDelegatedProjects(json.success ? json.data : []);
      })
      .catch(() => {
        if (active) setDelegatedProjects([]);
      });
    return () => { active = false; };
  }, [partner]);

  const [directForm, setDirectForm] = useState(INITIAL_DIRECT_FORM);
  const [directError, setDirectError] = useState("");
  const [directLeads, setDirectLeads] = useState([]);
  const [directSaving, setDirectSaving] = useState({});

  const loadDirectLeads = useCallback(() => {
    if (!partner?.accountId) return;
    fetch(`/api/cp-leads?submittedByAccountId=${partner.accountId}`)
      .then((res) => res.json())
      .then((json) => setDirectLeads(json.success ? json.data.filter((l) => !l.adLinkId) : []))
      .catch(() => setDirectLeads([]));
  }, [partner]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadDirectLeads();
    });
    return () => { active = false; };
  }, [loadDirectLeads]);

  const [showAddVisit, setShowAddVisit] = useState(false);
  const [newVisitProject, setNewVisitProject] = useState("");
  const [newVisitContact, setNewVisitContact] = useState(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [convertingPhoto, setConvertingPhoto] = useState({});

  useEffect(() => {
    if (!newVisitProject) return;
    let active = true;
    fetch(`/api/properties/${newVisitProject}`)
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        const contact = json.success ? json.data?.contact : null;
        setNewVisitContact(contact?.fullName || contact?.mobile ? contact : null);
      })
      .catch(() => {
        if (active) setNewVisitContact(null);
      })
      .finally(() => {
        if (active) setLoadingContact(false);
      });
    return () => { active = false; };
  }, [newVisitProject]);

  // Per-section refresh keys
  const [refreshKeys, setRefreshKeys] = useState({
    overview: 0,
    assigned: 0,
    visits: 0,
    direct: 0,
    earnings: 0,
  });

  const refreshSection = useCallback(
    (section) => {
      setRefreshKeys((prev) => ({ ...prev, [section]: prev[section] + 1 }));
      if (section === "visits") {
        setFollowUpDrafts({});
        setVisitDrafts({});
        if (partner?.accountId) {
          fetch(`/api/site-visits?fieldCpAccountId=${partner.accountId}`)
            .then((res) => res.json())
            .then((json) => {
              if (json.success) {
                setSiteVisits(json.data.map((doc) => ({ ...doc, leadId: doc.id })));
              }
            })
            .catch(() => {});
        }
      }
      if (section === "direct") {
        setDirectForm(INITIAL_DIRECT_FORM);
        setDirectError("");
        loadDirectLeads();
      }
    },
    [partner, loadDirectLeads]
  );

  const assignedLeads = leads.filter((l) => l.assignedTo);

  const assignedProjects = projects
    .map((project) => ({
      project,
      leads: assignedLeads.filter((l) => l.project === project.name),
    }))
    .filter((group) => group.leads.length > 0);

  const assignedProjectOptions = [
    ...assignedProjects.map(({ project }) => ({ id: project.id, name: project.name })),
    ...delegatedProjects.map((a) => ({ id: a.propertyId || a.id, name: a.propertyTitle })),
  ].filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);

  // Persists a partial update for one visit to the database, then reconciles
  // local state from the server's response — the single source of truth, so
  // a refresh mid-visit never loses progress (everything already round-trips
  // through Mongo before the next paint).
  async function patchVisit(leadId, patch) {
    try {
      const res = await fetch(`/api/site-visits/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save");
      setSiteVisits((prev) =>
        prev.map((v) => (v.leadId === leadId ? { ...json.data, leadId: json.data.id } : v))
      );
      return json.data;
    } catch (error) {
      toast.error(error.message || "Couldn't save — check your connection and try again");
      return null;
    }
  }

  async function handleAddSiteVisit(e) {
    e.preventDefault();
    if (!newVisitProject) return;
    const project = assignedProjectOptions.find((p) => p.id === newVisitProject);
    try {
      const res = await fetch("/api/site-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: project ? project.name : "",
          projectId: newVisitProject,
          customer: newVisitContact?.fullName || "",
          phone: newVisitContact?.mobile || "",
          scheduledAt: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to schedule visit");
      setSiteVisits((prev) => [{ ...json.data, leadId: json.data.id }, ...prev]);
      setNewVisitProject("");
      setNewVisitContact(null);
      setShowAddVisit(false);
    } catch (error) {
      toast.error(error.message || "Couldn't schedule the visit — please try again");
    }
  }

  function updateVisitStatus(leadId, status) {
    const now = new Date().toISOString();
    const patch = { status };
    if (status === "Moving") patch.movingAt = now;
    if (status === "Visit Done") patch.doneAt = now;
    if (status === "No Show") patch.noShowAt = now;
    setSiteVisits((prev) => prev.map((v) => (v.leadId === leadId ? { ...v, ...patch } : v)));
    patchVisit(leadId, patch);
  }

  async function uploadLivePhotos(leadId, fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setConvertingPhoto((prev) => ({ ...prev, [leadId]: true }));
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => ({
          name: `${file.name.replace(/\.[^.]+$/, "") || "photo"}.webp`,
          url: await uploadFileToR2(file, "site-visits"),
        }))
      );
      const current = siteVisits.find((v) => v.leadId === leadId)?.livePhotos || [];
      const livePhotos = [...current, ...uploaded];
      const photoAt = new Date().toISOString();
      setSiteVisits((prev) => prev.map((v) => (v.leadId === leadId ? { ...v, livePhotos, photoAt } : v)));
      await patchVisit(leadId, { livePhotos, photoAt });
    } catch (error) {
      toast.error(error.message || "Couldn't upload the photo — please try again");
    } finally {
      setConvertingPhoto((prev) => ({ ...prev, [leadId]: false }));
    }
  }

  function addFollowUp(leadId) {
    const note = (followUpDrafts[leadId] || "").trim();
    if (!note) return;
    const at = new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    const current = siteVisits.find((v) => v.leadId === leadId)?.followUps || [];
    const followUps = [...current, { note, at }];
    setSiteVisits((prev) => prev.map((v) => (v.leadId === leadId ? { ...v, followUps } : v)));
    patchVisit(leadId, { followUps });
    setFollowUpDrafts((prev) => ({ ...prev, [leadId]: "" }));
  }

  function updateVisitDraft(leadId, field, value) {
    setVisitDrafts((prev) => ({
      ...prev,
      [leadId]: { ...prev[leadId], [field]: value },
    }));
  }

  function submitVisit(leadId) {
    const visit = siteVisits.find((v) => v.leadId === leadId);
    const draft = visitDrafts[leadId] || {};
    const patch = {
      customer: (draft.name ?? visit?.customer ?? "").trim(),
      phone: (draft.phone ?? visit?.phone ?? "").trim(),
      notes: (draft.notes ?? visit?.notes ?? "").trim(),
      submitted: true,
      submittedAt: new Date().toISOString(),
    };
    setSiteVisits((prev) => prev.map((v) => (v.leadId === leadId ? { ...v, ...patch } : v)));
    patchVisit(leadId, patch);
  }

  function editVisit(leadId) {
    setSiteVisits((prev) => prev.map((v) => (v.leadId === leadId ? { ...v, submitted: false } : v)));
    patchVisit(leadId, { submitted: false });
  }

  function toggleReportExpanded(leadId) {
    setExpandedReports((prev) => ({ ...prev, [leadId]: !prev[leadId] }));
  }

  async function handleDirectSubmit(e) {
    e.preventDefault();
    if (!directForm.customer.trim() || !directForm.phone.trim() || !directForm.project) {
      setDirectError("Please fill in customer name, phone and project.");
      return;
    }
    setDirectError("");
    const project = projects.find((p) => p.id === directForm.project);
    try {
      const res = await fetch("/api/cp-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: directForm.customer.trim(),
          phone: directForm.phone.trim(),
          project: project ? project.name : directForm.project,
          projectId: directForm.project,
          source: "Field CP Direct Lead",
          notes: directForm.notes.trim(),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to add lead");
      setDirectLeads((prev) => [json.data, ...prev]);
      setDirectForm(INITIAL_DIRECT_FORM);
    } catch (error) {
      setDirectError(error.message || "Couldn't add the lead — please try again.");
    }
  }

  async function handleForwardDirectLead(id) {
    const lead = directLeads.find((l) => l.id === id);
    if (!lead || lead.forwarded) return;
    setDirectSaving((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/cp-leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forward: true }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to forward lead");
      setDirectLeads((prev) => prev.map((l) => (l.id === id ? json.data : l)));
      toast.success("Lead forwarded to Head CP");
    } catch (error) {
      toast.error(error.message || "Couldn't forward the lead — please try again");
    } finally {
      setDirectSaving((prev) => ({ ...prev, [id]: false }));
    }
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
              <StatCard label="Assigned Leads" value={stats.assignedLeads} />
              <StatCard label="Site Visits Scheduled" value={stats.siteVisitsScheduled} />
              <StatCard label="Deals Closed" value={stats.dealsClosed} />
              <StatCard label="Commission Earned" value={stats.commissionEarned} />
            </div>
          </div>
        )}

        {tab === "assigned" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <p className="tracked-label text-xs text-gold-400">Assigned Projects</p>
              <RefreshButton onRefresh={() => refreshSection("assigned")} label="Refresh assigned projects" />
            </div>
            <div key={refreshKeys.assigned} className="flex flex-col gap-6">
            {delegatedProjects.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="tracked-label text-xs text-gold-400">Properties Delegated by Company CP</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {delegatedProjects.map((a) => {
                    const propHref = `/property/${a.propertyId || a.id}?campaign=1`;
                    return (
                      <Link
                        key={a.id}
                        href={propHref}
                        className="group flex flex-col justify-between border border-navy-700/60 bg-navy-900 p-4 transition hover:border-gold-500/60"
                      >
                        {a.propertyImage && (
                          <div className="relative mb-3 h-36 w-full overflow-hidden rounded-sm">
                            <Image
                              src={a.propertyImage}
                              alt={a.propertyTitle || "Property"}
                              fill
                              sizes="(max-width: 640px) 100vw, 33vw"
                              className="object-cover transition duration-300 group-hover:scale-105"
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-cream transition group-hover:text-gold-400">{a.propertyTitle}</p>
                          <p className="mt-1 text-xs text-muted">{a.propertyLocation}</p>
                          <p className="mt-2 text-xs text-muted">
                            Forwarded by {formatCpLabel(a.assignedByName, a.assignedByCity, a.assignedByState)}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-navy-700/60 pt-3">
                          {a.propertyStatus === "Sold" ? (
                            <Badge tone="error">Sold Out</Badge>
                          ) : (
                            <Badge tone="gold">{a.status}</Badge>
                          )}
                          <span className="flex items-center gap-1 text-xs text-gold-400">
                            View Property <FiArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            {assignedProjects.length === 0 ? (
              <EmptyState title="No projects assigned yet" message="Projects with leads assigned to you by a Company Channel Partner will appear here." />
            ) : (
              assignedProjects.map(({ project, leads: projectLeads }) => {
                const propHref = `/property/${project.id}?campaign=1`;
                return (
                  <div key={project.id} className="border border-navy-700/60 bg-navy-900 p-5 transition hover:border-navy-600">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-[220px_1fr]">
                      <Link href={propHref} className="group relative h-48 w-full overflow-hidden rounded-sm sm:h-full block">
                        <Image
                          src={project.image}
                          alt={project.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 220px"
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      </Link>
                      <div className="flex flex-col">
                        <Link href={propHref} className="group">
                          <h3 className="font-display text-lg text-cream transition group-hover:text-gold-400">{project.name}</h3>
                        </Link>
                        <p className="mt-1 text-xs text-muted">{project.location}</p>
                        <p className="mt-1 text-xs text-muted">
                          {project.startingPrice} · {project.developer}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <span className="tracked-label flex w-fit items-center gap-1 border border-gold-500/70 px-3 py-1 text-xs text-gold-400">
                            {project.status}
                          </span>
                          <Link
                            href={propHref}
                            className="tracked-label flex items-center gap-1.5 text-xs text-gold-400 transition hover:text-gold-300"
                          >
                            <span>View Property Details</span>
                            <FiArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
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
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span className="text-xs text-muted">{lead.phone}</span>
                                <PhoneActions phone={lead.phone} />
                              </div>
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
                );
              })
            )}
            </div>
          </div>
        )}

        {tab === "visits" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="tracked-label text-xs text-gold-400">Site Visits</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddVisit((prev) => !prev)}
                  className="tracked-label flex items-center gap-2 bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
                >
                  <FiPlus className="h-3.5 w-3.5" />
                  Add Site Visit
                </button>
                <RefreshButton onRefresh={() => refreshSection("visits")} label="Refresh site visits" />
              </div>
            </div>

            {showAddVisit && (
              <form
                onSubmit={handleAddSiteVisit}
                className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <FormField label="Assigned Project" htmlFor="fcp-visit-project" required>
                      <select
                        id="fcp-visit-project"
                        value={newVisitProject}
                        onChange={(e) => {
                          setNewVisitProject(e.target.value);
                          setNewVisitContact(null);
                          setLoadingContact(Boolean(e.target.value));
                        }}
                        className={selectClass}
                      >
                        <option value="">Select assigned project</option>
                        {assignedProjectOptions.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                  <button
                    type="submit"
                    disabled={!newVisitProject}
                    className="tracked-label flex items-center justify-center gap-2 bg-gold-400 px-6 py-3 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FiPlus className="h-4 w-4" />
                    Schedule Visit
                  </button>
                </div>
                {newVisitProject && (
                  <p className="text-xs text-muted">
                    {loadingContact
                      ? "Fetching contact from project…"
                      : newVisitContact
                      ? `Customer will be auto-filled: ${newVisitContact.fullName || "—"} · ${newVisitContact.mobile || "—"}`
                      : "No contact found on this project — you can add customer details after scheduling."}
                  </p>
                )}
              </form>
            )}

            <div key={refreshKeys.visits} className="flex flex-col gap-3">
            {siteVisits.length === 0 ? (
              <EmptyState title="No site visits yet" message="Schedule and track site visits for your assigned leads here." />
            ) : (
              siteVisits.map((visit) => {
                const lead = leads.find((l) => l.id === visit.leadId);
                const readyDone = visit.status === "Moving" || visit.status === "Visit Done";
                const photoDone = (visit.livePhotos?.length || 0) > 0;
                const doneDone = visit.status === "Visit Done";
                const draft = {
                  name: visitDrafts[visit.leadId]?.name ?? (lead ? lead.customer : visit.customer) ?? "",
                  phone: visitDrafts[visit.leadId]?.phone ?? (lead ? lead.phone : visit.phone) ?? "",
                  notes: visitDrafts[visit.leadId]?.notes ?? visit.notes ?? "",
                };
                return (
                  <div key={visit.leadId} className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-cream">{lead ? lead.customer : visit.customer || "New Site Visit"}</p>
                        <p className="mt-1 text-xs text-muted">{lead ? lead.project : visit.project}</p>
                        <p className="mt-1 text-xs text-gold-400">{visit.scheduledAt}</p>
                      </div>
                      <Badge tone={VISIT_STATUS_TONE[visit.status] || "muted"}>{visit.status}</Badge>
                    </div>

                    {!visit.submitted && (
                    <div className="border-t border-navy-700/60 pt-5">
                      {visit.status === "No Show" ? (
                        <div className="flex items-center justify-between">
                          <span className="tracked-label flex items-center gap-2 text-xs text-red-400">
                            <FiX className="h-3.5 w-3.5" />
                            Visit Marked No Show
                            {visit.noShowAt && (
                              <span className="text-[10px] text-muted">· {formatDateTime(visit.noShowAt)}</span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateVisitStatus(visit.leadId, "Scheduled")}
                            className="tracked-label text-xs text-muted transition hover:text-gold-400"
                          >
                            Reopen
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start">
                            <VisitTimelineStep
                              icon={FiNavigation}
                              label="Ready to Move"
                              state={readyDone ? "done" : "active"}
                              onClick={() => updateVisitStatus(visit.leadId, "Moving")}
                              disabled={readyDone}
                              locked={visit.submitted}
                              timestamp={readyDone ? formatDateTime(visit.movingAt) : ""}
                            />
                            <VisitTimelineConnector done={readyDone} />
                            <VisitTimelineStep
                              icon={FiCamera}
                              label={photoDone ? `Live Photo (${visit.livePhotos.length})` : "Live Photo"}
                              state={photoDone ? "done" : readyDone ? "active" : "upcoming"}
                              htmlFor={`live-photo-${visit.leadId}`}
                              loading={convertingPhoto[visit.leadId]}
                              locked={visit.submitted}
                              timestamp={photoDone ? formatDateTime(visit.photoAt) : ""}
                            />
                            <VisitTimelineConnector done={photoDone} />
                            <VisitTimelineStep
                              icon={FiCheck}
                              label="Visit Done"
                              state={doneDone ? "done" : photoDone ? "active" : "upcoming"}
                              onClick={() => updateVisitStatus(visit.leadId, "Visit Done")}
                              disabled={doneDone}
                              locked={visit.submitted}
                              timestamp={doneDone ? formatDateTime(visit.doneAt) : ""}
                            />
                          </div>
                          {!visit.submitted && (
                            <>
                              <input
                                id={`live-photo-${visit.leadId}`}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                multiple
                                disabled={convertingPhoto[visit.leadId]}
                                onChange={(e) => {
                                  uploadLivePhotos(visit.leadId, e.target.files);
                                  e.target.value = "";
                                }}
                                className="hidden"
                              />
                              <div className="mt-4 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => updateVisitStatus(visit.leadId, "No Show")}
                                  className="tracked-label text-xs text-muted transition hover:text-red-400"
                                >
                                  Mark No Show
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                    )}

                    {!visit.submitted && visit.livePhotos?.length > 0 && (
                      <div className="border-t border-navy-700/60 pt-4">
                        <p className="tracked-label text-xs text-gold-400">Live Photos ({visit.livePhotos.length})</p>
                        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                          {visit.livePhotos.map((photo, i) => (
                            <div
                              key={i}
                              className="relative aspect-square overflow-hidden rounded-sm border border-navy-700/60 bg-navy-950"
                            >
                              <Image
                                src={photo.url}
                                alt={photo.name}
                                fill
                                sizes="(max-width: 640px) 33vw, 16vw"
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {visit.submitted ? (
                      <div className="border-t border-gold-500/30 bg-gold-400/5 p-4">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleReportExpanded(visit.leadId)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") toggleReportExpanded(visit.leadId);
                          }}
                          className="flex w-full cursor-pointer items-start justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-400 bg-gold-400 text-navy-950">
                              <FiCheck className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="tracked-label text-xs text-gold-400">Visit Report</p>
                              <p className="mt-0.5 text-[10px] text-muted">
                                Submitted {formatDateTime(visit.submittedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                editVisit(visit.leadId);
                              }}
                              className="tracked-label flex items-center gap-1.5 border border-gold-500/70 px-3 py-1.5 text-[10px] text-gold-400 transition hover:bg-gold-500/10"
                            >
                              <FiEdit2 className="h-3 w-3" />
                              Edit
                            </button>
                            <FiChevronDown
                              className={`h-4 w-4 text-muted transition-transform ${
                                expandedReports[visit.leadId] ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>

                        {!expandedReports[visit.leadId] && (
                          <p className="mt-3 truncate text-xs text-muted">
                            {visit.customer || "—"} · {visit.phone || "—"}
                            {visit.notes ? ` · ${visit.notes}` : ""}
                          </p>
                        )}

                        {expandedReports[visit.leadId] && (
                          <>
                            <div className="mt-5 grid grid-cols-1 gap-4 border-t border-navy-700/60 pt-4 sm:grid-cols-2">
                              <div>
                                <p className="tracked-label flex items-center gap-1.5 text-[10px] text-muted">
                                  <FiUser className="h-3 w-3" />
                                  Customer Name
                                </p>
                                <p className="mt-1 text-sm text-cream">{visit.customer || "—"}</p>
                              </div>
                              <div>
                                <p className="tracked-label flex items-center gap-1.5 text-[10px] text-muted">
                                  <FiPhone className="h-3 w-3" />
                                  Phone Number
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                  <p className="text-sm text-cream">{visit.phone || "—"}</p>
                                  {visit.phone && <PhoneActions phone={visit.phone} />}
                                </div>
                              </div>
                            </div>

                            {visit.notes && (
                              <div className="mt-4">
                                <p className="tracked-label text-[10px] text-muted">Notes</p>
                                <p className="mt-1 text-sm leading-relaxed text-cream">{visit.notes}</p>
                              </div>
                            )}

                            {visit.livePhotos?.length > 0 && (
                              <div className="mt-4">
                                <p className="tracked-label text-[10px] text-muted">
                                  Live Photos ({visit.livePhotos.length})
                                </p>
                                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                                  {visit.livePhotos.map((photo, i) => (
                                    <div
                                      key={i}
                                      className="relative aspect-square overflow-hidden rounded-sm border border-navy-700/60 bg-navy-950"
                                    >
                                      <Image
                                        src={photo.url}
                                        alt={photo.name}
                                        fill
                                        sizes="(max-width: 640px) 33vw, 16vw"
                                        unoptimized
                                        className="object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-5 flex flex-col gap-2 border-t border-navy-700/60 pt-4">
                              <p className="tracked-label text-[10px] text-muted">Timeline</p>
                              <TimelineRow icon={FiNavigation} label="Ready to Move" time={formatDateTime(visit.movingAt)} />
                              <TimelineRow
                                icon={FiCamera}
                                label={`Live Photo${visit.livePhotos?.length ? ` (${visit.livePhotos.length})` : ""}`}
                                time={formatDateTime(visit.photoAt)}
                              />
                              <TimelineRow icon={FiCheck} label="Visit Done" time={formatDateTime(visit.doneAt)} />
                              <TimelineRow icon={FiSend} label="Visit Submitted" time={formatDateTime(visit.submittedAt)} />
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="border-t border-navy-700/60 pt-4">
                        <p className="tracked-label text-xs text-gold-400">Customer Details</p>
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="flex items-center gap-2 border border-navy-700/60 bg-navy-950 px-4 py-3">
                            <FiUser className="h-4 w-4 shrink-0 text-gold-400" />
                            <input
                              type="text"
                              placeholder="Customer name"
                              value={draft.name}
                              onChange={(e) => updateVisitDraft(visit.leadId, "name", e.target.value)}
                              className="w-full bg-transparent text-sm text-cream outline-none placeholder:text-muted"
                            />
                          </div>
                          <div className="flex items-center gap-2 border border-navy-700/60 bg-navy-950 px-4 py-3">
                            <FiPhone className="h-4 w-4 shrink-0 text-gold-400" />
                            <input
                              type="tel"
                              placeholder="Phone number"
                              value={draft.phone}
                              onChange={(e) => updateVisitDraft(visit.leadId, "phone", e.target.value)}
                              className="w-full bg-transparent text-sm text-cream outline-none placeholder:text-muted"
                            />
                          </div>
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Notes about the customer..."
                          value={draft.notes}
                          onChange={(e) => updateVisitDraft(visit.leadId, "notes", e.target.value)}
                          className={`${textareaClass} mt-3`}
                        />
                        <div className="mt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => submitVisit(visit.leadId)}
                            className="tracked-label flex items-center gap-1.5 bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
                          >
                            <FiCheck className="h-3.5 w-3.5" />
                            Submit Visit
                          </button>
                        </div>
                      </div>
                    )}

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
          </div>
        )}

        {tab === "direct" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <p className="tracked-label text-xs text-gold-400">Direct Leads</p>
              <RefreshButton onRefresh={() => refreshSection("direct")} label="Refresh direct leads" />
            </div>
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
              <EmptyState title="No direct leads yet" message="Add a lead's name, phone, project and notes, then forward it to the Head CP." />
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
                        Forwarded to Head CP
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={directSaving[lead.id]}
                        onClick={() => handleForwardDirectLead(lead.id)}
                        className="tracked-label flex shrink-0 items-center justify-center gap-2 bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300 disabled:opacity-60"
                      >
                        <FiSend className="h-3.5 w-3.5" />
                        {directSaving[lead.id] ? "Forwarding…" : "Forward to Head CP"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "earnings" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="tracked-label text-xs text-gold-400">My Earnings</p>
              <RefreshButton onRefresh={() => refreshSection("earnings")} label="Refresh earnings" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" key={refreshKeys.earnings}>
              <StatCard label="Commission Earned" value={stats.commissionEarned} />
              <StatCard label="Deals Closed" value={stats.dealsClosed} />
              <StatCard label="Site Visits Scheduled" value={stats.siteVisitsScheduled} />
            </div>
          </div>
        )}

        {tab === "listings" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="tracked-label text-xs text-gold-400">My Listings</p>
              <Link
                href="/post-property"
                className="tracked-label flex items-center gap-2 bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
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
