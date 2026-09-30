"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiCheck,
  FiX,
  FiEdit3,
  FiMapPin,
  FiCamera,
  FiPhoneCall,
  FiLink,
  FiPlus,
  FiSend,
  FiArrowRight,
} from "react-icons/fi";
import { MdSell, MdLockOpen } from "react-icons/md";
import Tabs from "./Tabs";
import StatCard from "./StatCard";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import PropertyGrid from "@/components/property/PropertyGrid";
import { CP_TYPE_LABEL, VIDEO_STATUS_TONE } from "./channel-partner/tones";
import RefreshButton from "./RefreshButton";
import { usePersistentTab } from "@/lib/usePersistentTab";
import { toast } from "sonner";

function formatCpLabel(name, city, state) {
  const place = [city, state].filter(Boolean).join(", ");
  return place ? `${name} — ${place}` : name;
}

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "projects", label: "Assigned Projects" },
  { key: "trackField", label: "Track Field CP" },
  { key: "trackDigital", label: "Track Digital CP" },
  { key: "freelancerLeads", label: "Freelancer Leads" },
  { key: "listings", label: "My Listings" },
];

const ACTIVITY_ICON = {
  "Property Visit": FiMapPin,
  "Photo Live": FiCamera,
  "Follow-up": FiPhoneCall,
};

export default function CompanyCPDashboard({
  stats,
  network,
  fieldActivity,
  digitalCampaigns,
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
  const [soldBusyId, setSoldBusyId] = useState(null);
  const [videos, setVideos] = useState([]);
  const [leads, setLeads] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");

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

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      loadAssignments();
      loadVideos();
      loadLeads();
    });
    return () => { active = false; };
  }, [loadAssignments, loadVideos, loadLeads]);

  const refreshSection = useCallback(
    (section) => {
      setRefreshKeys((prev) => ({ ...prev, [section]: prev[section] + 1 }));
      // Reset section-specific local state
      if (section === "projects") loadAssignments();
      if (section === "trackDigital") {
        setEditingNoteId(null);
        setNoteDraft("");
        loadVideos();
      }
      if (section === "freelancerLeads") loadLeads();
    },
    [loadAssignments, loadVideos, loadLeads]
  );

  const fieldPartners = network.filter((p) => p.cpType === "field");
  const digitalPartners = network.filter((p) => p.cpType === "digital");

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
                            <span className="tracked-label flex items-center gap-1 border border-red-500/70 px-2 py-1 text-[10px] text-red-400">
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
                            className="tracked-label flex h-11 items-center justify-center gap-2 border border-gold-500/70 px-3 text-[10px] text-gold-400 transition hover:bg-gold-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <FiSend className="h-3.5 w-3.5" />
                            Forward to Field CP
                          </button>
                          <button
                            type="button"
                            disabled={digitalPartners.length === 0 || isSold}
                            onClick={() => togglePicker(project.id, "digital")}
                            className="tracked-label flex h-11 items-center justify-center gap-2 bg-gold-400 px-3 text-[10px] text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <FiSend className="h-3.5 w-3.5" />
                            Forward to Digital CP
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={soldBusyId === project.id}
                          onClick={() => toggleSold(project)}
                          className={`tracked-label flex h-11 items-center justify-center gap-2 px-3 text-[10px] transition disabled:cursor-not-allowed disabled:opacity-60 ${
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
                          <div className="flex flex-col gap-1.5 border border-navy-700/60 bg-navy-950 p-2">
                            {fieldPartners.map((p) => {
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
                            })}
                          </div>
                        )}

                        {!isSold && openPicker[project.id] === "digital" && (
                          <div className="flex flex-col gap-1.5 border border-navy-700/60 bg-navy-950 p-2">
                            {digitalPartners.map((p) => {
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
                            })}
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
              fieldPartners.map((partner) => {
                const activity = fieldActivity.find((a) => a.partnerName === partner.name);
                return (
                  <div key={partner.id} className="border border-navy-700/60 bg-navy-900 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-cream">{partner.name}</p>
                        <p className="tracked-label mt-1 text-[10px] text-muted">{partner.id}</p>
                      </div>
                      <Badge tone="gold">{CP_TYPE_LABEL.field}</Badge>
                    </div>

                    <div className="mt-4 border-t border-navy-700/60 pt-4">
                      <p className="tracked-label text-xs text-gold-400">Today&apos;s Activity</p>
                      {!activity || activity.activities.length === 0 ? (
                        <p className="mt-3 text-xs text-muted">No activity logged today.</p>
                      ) : (
                        <div className="mt-3 flex flex-col gap-2">
                          {activity.activities.map((item, i) => {
                            const Icon = ACTIVITY_ICON[item.type] || FiMapPin;
                            return (
                              <div
                                key={i}
                                className="flex items-start gap-3 border border-navy-700/60 bg-navy-950 p-3"
                              >
                                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                                <div className="min-w-0">
                                  <p className="text-xs text-cream">
                                    {item.type} <span className="text-muted">· {item.time}</span>
                                  </p>
                                  <p className="mt-1 text-xs text-muted">{item.detail}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
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
              <h3 className="font-display text-lg text-cream">Campaign Participation</h3>
              {digitalPartners.length === 0 ? (
                <EmptyState title="No Digital CPs yet" message="Digital Channel Partners in your network will appear here." />
              ) : (
                digitalPartners.map((partner) => {
                  const joins = digitalCampaigns.find((c) => c.partnerName === partner.name);
                  return (
                    <div key={partner.id} className="border border-navy-700/60 bg-navy-900 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-cream">{partner.name}</p>
                          <p className="tracked-label mt-1 text-[10px] text-muted">{partner.id}</p>
                        </div>
                        <Badge tone="muted">{CP_TYPE_LABEL.digital}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {joins && joins.campaigns.length > 0 ? (
                          joins.campaigns.map((c) => (
                            <span
                              key={c}
                              className="tracked-label border border-navy-700/60 px-3 py-1 text-[10px] text-muted"
                            >
                              {c}
                            </span>
                          ))
                        ) : (
                          <p className="text-xs text-muted">No campaigns joined yet.</p>
                        )}
                      </div>
                    </div>
                  );
                })
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
                        className="tracked-label flex items-center gap-1.5 border border-gold-400/70 px-3 py-2 text-[10px] text-gold-400 transition hover:bg-gold-400/10"
                      >
                        <FiCheck className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => startSuggestEdit(video)}
                        className="tracked-label flex items-center gap-1.5 border border-navy-700/60 px-3 py-2 text-[10px] text-muted transition hover:border-gold-400/70 hover:text-gold-400"
                      >
                        <FiEdit3 className="h-3.5 w-3.5" />
                        Suggest Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => updateVideoStatus(video.id, "Rejected")}
                        className="tracked-label flex items-center gap-1.5 border border-navy-700/60 px-3 py-2 text-[10px] text-muted transition hover:border-red-500/50 hover:text-red-400"
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
                            className="tracked-label bg-gold-400 px-4 py-2 text-[10px] text-navy-950 transition hover:bg-gold-300"
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
