"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FiCheck,
  FiX,
  FiEdit3,
  FiMapPin,
  FiCamera,
  FiPhoneCall,
  FiLink,
  FiUserCheck,
  FiShield,
} from "react-icons/fi";
import Tabs from "./Tabs";
import StatCard from "./StatCard";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import { CP_TYPE_LABEL, VIDEO_STATUS_TONE } from "./channel-partner/tones";
import { selectClass } from "@/components/auth/inputStyles";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "projects", label: "All Projects" },
  { key: "trackField", label: "Track Field CP" },
  { key: "trackDigital", label: "Track Digital CP" },
  { key: "freelancerLeads", label: "Freelancer Leads" },
];

const ACTIVITY_ICON = {
  "Property Visit": FiMapPin,
  "Photo Live": FiCamera,
  "Follow-up": FiPhoneCall,
};

export default function CompanyCPDashboard({
  stats,
  leads,
  network,
  projects,
  fieldActivity,
  digitalCampaigns,
  campaignVideos: initialCampaignVideos,
}) {
  const [tab, setTab] = useState("overview");
  const [assignments, setAssignments] = useState({});
  const [videos, setVideos] = useState(initialCampaignVideos);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");

  const fieldPartners = network.filter((p) => p.cpType === "field");
  const digitalPartners = network.filter((p) => p.cpType === "digital");

  function handleAssign(projectId, partnerName) {
    if (!partnerName) return;
    setAssignments((prev) => ({ ...prev, [projectId]: partnerName }));
  }

  function updateVideoStatus(id, status, note = "") {
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, status, note } : v)));
    setEditingNoteId(null);
    setNoteDraft("");
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
      {/* Role Highlight Badge */}
      <div className="mb-6 flex items-center gap-3">
        <span className="inline-flex items-center gap-2 border border-gold-500/70 bg-gold-500/10 px-4 py-2 text-sm font-medium text-gold-400">
          <FiShield className="h-4 w-4" />
          Company Channel Partner
        </span>
        <span className="tracked-label text-[10px] text-muted">Your Portal Role</span>
      </div>

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

        {tab === "projects" && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const assignedTo = assignments[project.id];
              return (
                <div key={project.id} className="flex flex-col border border-navy-700/60 bg-navy-900 p-4">
                  <div className="relative h-40 w-full overflow-hidden rounded-sm">
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="mt-3 font-display text-base text-cream">{project.name}</h3>
                  <p className="mt-1 text-xs text-muted">{project.location}</p>
                  <p className="mt-1 text-xs text-muted">
                    {project.startingPrice} · {project.status}
                  </p>

                  <div className="mt-4 flex flex-col gap-2 border-t border-navy-700/60 pt-4">
                    {assignedTo && (
                      <span className="tracked-label flex w-fit items-center gap-1.5 border border-gold-500/70 px-3 py-1 text-[10px] text-gold-400">
                        <FiUserCheck className="h-3 w-3" />
                        Assigned: {assignedTo}
                      </span>
                    )}
                    <select
                      aria-label={`Assign ${project.name} to a Field Channel Partner`}
                      value={assignedTo || ""}
                      onChange={(e) => handleAssign(project.id, e.target.value)}
                      className={`${selectClass} h-11 text-xs`}
                    >
                      <option value="" disabled>
                        {assignedTo ? "Reassign to Field CP" : "Assign to Field CP"}
                      </option>
                      {fieldPartners.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "trackField" && (
          <div className="flex flex-col gap-5">
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
        )}

        {tab === "trackDigital" && (
          <div className="flex flex-col gap-8">
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
        )}

        {tab === "freelancerLeads" && (
          <div className="overflow-x-auto border border-navy-700/60 bg-navy-900">
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
        )}
      </div>
    </div>
  );
}
