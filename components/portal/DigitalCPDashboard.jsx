"use client";

import { useState } from "react";
import Image from "next/image";
import { FiDownload, FiPlus, FiUpload, FiLink, FiCheck, FiSend, FiShield } from "react-icons/fi";
import Tabs from "./Tabs";
import StatCard from "./StatCard";
import EmptyState from "./EmptyState";
import ChipGroup from "@/components/auth/ChipGroup";
import FormField from "@/components/auth/FormField";
import { inputClass, selectClass, textareaClass } from "@/components/auth/inputStyles";
import { generateAccountId } from "@/lib/auth";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "myLeads", label: "My Leads" },
  { key: "campaign", label: "Campaign" },
  { key: "addProject", label: "Add Project" },
  { key: "earnings", label: "My Earnings" },
  { key: "links", label: "My Links" },
];

const MEDIA_TYPES = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
];

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "other", label: "Other" },
];

const INITIAL_MEDIA_FORM = { project: "", mediaType: "image", name: "", file: null };
const INITIAL_LINK_FORM = { platform: "", link: "" };
const INITIAL_LEAD_FORM = { name: "", contact: "", notes: "" };

function slugify(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function DigitalCPDashboard({ stats, projects, assets }) {
  const [tab, setTab] = useState("overview");
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "");

  const [mediaForm, setMediaForm] = useState(INITIAL_MEDIA_FORM);
  const [mediaError, setMediaError] = useState("");
  const [mediaSubmissions, setMediaSubmissions] = useState([]);

  const [linkForm, setLinkForm] = useState(INITIAL_LINK_FORM);
  const [linkError, setLinkError] = useState("");
  const [socialLinks, setSocialLinks] = useState([]);

  const [joinedCampaigns, setJoinedCampaigns] = useState([]);

  const [leadForm, setLeadForm] = useState(INITIAL_LEAD_FORM);
  const [leadError, setLeadError] = useState("");
  const [myLeads, setMyLeads] = useState([]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedAssets = assets.find((a) => a.projectId === selectedProjectId);

  function toggleJoinCampaign(projectId) {
    setJoinedCampaigns((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  }

  function updateLeadForm(field, value) {
    setLeadForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmitLead(e) {
    e.preventDefault();
    if (!leadForm.name.trim() || !leadForm.contact.trim()) {
      setLeadError("Please fill in the name and contact number.");
      return;
    }
    setLeadError("");
    setMyLeads((prev) => [
      {
        id: generateAccountId("LED"),
        name: leadForm.name.trim(),
        contact: leadForm.contact.trim(),
        notes: leadForm.notes.trim(),
        forwarded: false,
        date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      },
      ...prev,
    ]);
    setLeadForm(INITIAL_LEAD_FORM);
  }

  function handleForwardLead(id) {
    setMyLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, forwarded: true } : lead)));
  }

  function updateMediaForm(field, value) {
    setMediaForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmitMedia(e) {
    e.preventDefault();
    if (!mediaForm.project || !mediaForm.name.trim()) {
      setMediaError("Please select a project and give the media a name.");
      return;
    }
    setMediaError("");
    const project = projects.find((p) => p.id === mediaForm.project);
    setMediaSubmissions((prev) => [
      {
        id: generateAccountId("MED"),
        project: project ? project.name : mediaForm.project,
        mediaType: mediaForm.mediaType,
        name: mediaForm.name.trim(),
        fileName: mediaForm.file?.name || "",
        status: "Pending Review",
        date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      },
      ...prev,
    ]);
    setMediaForm(INITIAL_MEDIA_FORM);
  }

  function updateLinkForm(field, value) {
    setLinkForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmitLink(e) {
    e.preventDefault();
    if (!linkForm.platform || !linkForm.link.trim()) {
      setLinkError("Please select a platform and paste the link.");
      return;
    }
    setLinkError("");
    setSocialLinks((prev) => [
      {
        id: generateAccountId("LNK"),
        platform: PLATFORMS.find((p) => p.value === linkForm.platform)?.label || "Other",
        link: linkForm.link.trim(),
        date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      },
      ...prev,
    ]);
    setLinkForm(INITIAL_LINK_FORM);
  }

  return (
    <div>
      {/* Role Highlight Badge */}
      <div className="mb-6 flex items-center gap-3">
        <span className="inline-flex items-center gap-2 border border-gold-500/70 bg-gold-500/10 px-4 py-2 text-sm font-medium text-gold-400">
          <FiShield className="h-4 w-4" />
          Digital Channel Partner
        </span>
        <span className="tracked-label text-[10px] text-muted">Your Portal Role</span>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-8">
        {tab === "overview" && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatCard label="Leads Submitted" value={stats.leadsSubmitted} />
              <StatCard label="Deals Converted" value={stats.dealsConverted} />
              <StatCard label="Commission Earned" value={stats.commissionEarned} />
            </div>

            <div>
              <h2 className="font-display text-xl text-cream">My Campaigns</h2>
              {joinedCampaigns.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    title="No campaigns joined yet"
                    message="Head to the Campaign tab and join a project campaign to see it here."
                  />
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {projects
                    .filter((p) => joinedCampaigns.includes(p.id))
                    .map((p) => (
                      <div key={p.id} className="border border-navy-700/60 bg-navy-900 p-4">
                        <div className="relative h-32 w-full overflow-hidden rounded-sm">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                        <h3 className="mt-3 font-display text-base text-cream">{p.name}</h3>
                        <p className="mt-1 text-xs text-muted">{p.location}</p>
                        <span className="tracked-label mt-3 flex w-fit items-center gap-1 border border-gold-500/70 px-3 py-1 text-xs text-gold-400">
                          <FiCheck className="h-3.5 w-3.5" />
                          Joined
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "myLeads" && (
          <div className="flex flex-col gap-6">
            <form
              onSubmit={handleSubmitLead}
              className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-4 sm:p-6"
            >
              <h2 className="font-display text-xl text-cream">Add Lead</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Name" htmlFor="dcp-lead-name" required>
                  <input
                    id="dcp-lead-name"
                    type="text"
                    placeholder="e.g. Ritika Sharma"
                    value={leadForm.name}
                    onChange={(e) => updateLeadForm("name", e.target.value)}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Contact" htmlFor="dcp-lead-contact" required>
                  <input
                    id="dcp-lead-contact"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={leadForm.contact}
                    onChange={(e) => updateLeadForm("contact", e.target.value)}
                    className={inputClass}
                  />
                </FormField>
              </div>
              <FormField label="Notes" htmlFor="dcp-lead-notes" optional>
                <textarea
                  id="dcp-lead-notes"
                  rows={3}
                  placeholder="Any details about the lead"
                  value={leadForm.notes}
                  onChange={(e) => updateLeadForm("notes", e.target.value)}
                  className={textareaClass}
                />
              </FormField>

              {leadError && <p className="text-xs text-red-400">{leadError}</p>}

              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="tracked-label flex items-center justify-center gap-2 bg-gold-400 px-6 py-3 text-xs text-navy-950 transition hover:bg-gold-300"
                >
                  <FiPlus className="h-4 w-4" />
                  Add Lead
                </button>
              </div>
            </form>

            {myLeads.length === 0 ? (
              <EmptyState title="No leads yet" message="Add a lead's name, contact and notes, then forward it to the Company CP." />
            ) : (
              <div className="flex flex-col gap-3">
                {myLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex flex-col gap-3 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-cream">{lead.name}</p>
                      <p className="mt-1 text-xs text-muted">{lead.contact}</p>
                      {lead.notes && <p className="mt-1 text-xs text-muted">{lead.notes}</p>}
                    </div>
                    {lead.forwarded ? (
                      <span className="tracked-label flex w-fit shrink-0 items-center gap-2 border border-gold-500/70 px-4 py-2 text-xs text-gold-400">
                        <FiCheck className="h-3.5 w-3.5" />
                        Forwarded to Company CP
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleForwardLead(lead.id)}
                        className="tracked-label flex shrink-0 items-center justify-center gap-2 bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
                      >
                        <FiSend className="h-3.5 w-3.5" />
                        Forward to Company CP
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "campaign" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProjectId(p.id)}
                  aria-pressed={selectedProjectId === p.id}
                  className={`tracked-label border px-4 py-2 text-xs transition ${
                    selectedProjectId === p.id
                      ? "border-gold-400 bg-gold-400 text-navy-950"
                      : "border-navy-700/60 text-muted hover:text-cream"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {selectedProject && selectedAssets && (
              <div className="border border-navy-700/60 bg-navy-900 p-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-[220px_1fr]">
                  <div className="relative h-48 w-full overflow-hidden rounded-sm sm:h-full">
                    <Image
                      src={selectedProject.image}
                      alt={selectedProject.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 220px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-display text-lg text-cream">{selectedProject.name}</h3>
                    <p className="mt-1 text-xs text-muted">{selectedProject.location}</p>
                    <p className="mt-1 text-xs text-muted">
                      {selectedProject.startingPrice} · {selectedProject.status}
                    </p>

                    <button
                      type="button"
                      onClick={() => toggleJoinCampaign(selectedProject.id)}
                      className={`tracked-label mt-4 flex w-fit items-center justify-center gap-2 px-5 py-3 text-xs transition ${
                        joinedCampaigns.includes(selectedProject.id)
                          ? "border border-gold-500/70 text-gold-400 hover:bg-gold-500/10"
                          : "bg-gold-400 text-navy-950 hover:bg-gold-300"
                      }`}
                    >
                      {joinedCampaigns.includes(selectedProject.id) ? (
                        <>
                          <FiCheck className="h-4 w-4" />
                          Joined Campaign
                        </>
                      ) : (
                        "Join Campaign"
                      )}
                    </button>
                  </div>
                </div>

                <p className="tracked-label mt-5 text-xs text-gold-400">Campaign Videos</p>
                <div className="mt-3 flex flex-col gap-3">
                  {selectedAssets.videos.map((name) => {
                    const videoLink = `https://cdn.simnaniestates.com/campaign-videos/${slugify(name)}`;
                    return (
                      <div
                        key={name}
                        className="flex flex-col gap-3 border border-navy-700/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-cream">{name}</p>
                          <a
                            href={videoLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 block truncate text-xs text-gold-400 hover:text-gold-300"
                          >
                            {videoLink}
                          </a>
                        </div>
                        <a
                          href={videoLink}
                          download
                          className="tracked-label flex shrink-0 items-center justify-center gap-2 border border-gold-500/70 px-4 py-2 text-xs text-gold-400 transition hover:bg-gold-500/10"
                        >
                          <FiDownload className="h-3.5 w-3.5" />
                          Download Video
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "addProject" && (
          <div className="flex flex-col gap-6">
            <form
              onSubmit={handleSubmitMedia}
              className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-4 sm:p-6"
            >
              <h2 className="font-display text-xl text-cream">Submit Media</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Project" htmlFor="dcp-media-project" required>
                  <select
                    id="dcp-media-project"
                    value={mediaForm.project}
                    onChange={(e) => updateMediaForm("project", e.target.value)}
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
                <FormField label="Media Name" htmlFor="dcp-media-name" required>
                  <input
                    id="dcp-media-name"
                    type="text"
                    placeholder="e.g. Clubhouse Walkthrough Reel"
                    value={mediaForm.name}
                    onChange={(e) => updateMediaForm("name", e.target.value)}
                    className={inputClass}
                  />
                </FormField>
              </div>

              <FormField label="Media Type" required>
                <ChipGroup
                  options={MEDIA_TYPES}
                  value={mediaForm.mediaType}
                  onChange={(value) => updateMediaForm("mediaType", value)}
                />
              </FormField>

              <FormField label="Upload File" htmlFor="dcp-media-file" optional>
                <label
                  htmlFor="dcp-media-file"
                  className="flex h-14 cursor-pointer items-center gap-2 border border-navy-700/60 bg-navy-950 px-4 text-sm text-muted transition hover:border-gold-400"
                >
                  <FiUpload className="h-4 w-4 text-gold-400" />
                  {mediaForm.file ? mediaForm.file.name : "Add Video / Image"}
                </label>
                <input
                  id="dcp-media-file"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => updateMediaForm("file", e.target.files?.[0] || null)}
                  className="hidden"
                />
              </FormField>

              {mediaError && <p className="text-xs text-red-400">{mediaError}</p>}

              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="tracked-label bg-gold-400 px-6 py-3 text-xs text-navy-950 transition hover:bg-gold-300"
                >
                  Submit Media
                </button>
              </div>
            </form>

            {mediaSubmissions.length === 0 ? (
              <EmptyState title="No media submitted yet" message="Submit a project video or image to have it reviewed and added to your campaigns." />
            ) : (
              <div className="flex flex-col gap-3">
                {mediaSubmissions.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm text-cream">{item.name}</p>
                      <p className="mt-1 text-xs text-muted">
                        {item.project} · {item.mediaType === "video" ? "Video" : "Image"}
                        {item.fileName ? ` · ${item.fileName}` : ""} · {item.date}
                      </p>
                    </div>
                    <span className="tracked-label w-fit border border-gold-500/70 px-3 py-1 text-xs text-gold-400">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "earnings" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Commission Earned" value={stats.commissionEarned} />
            <StatCard label="Deals Converted" value={stats.dealsConverted} />
            <StatCard label="Leads Submitted" value={stats.leadsSubmitted} />
          </div>
        )}

        {tab === "links" && (
          <div className="flex flex-col gap-6">
            <form
              onSubmit={handleSubmitLink}
              className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-4 sm:p-6"
            >
              <h2 className="font-display text-xl text-cream">Add Social Media Link</h2>

              <FormField label="Platform" required>
                <ChipGroup
                  options={PLATFORMS}
                  value={linkForm.platform}
                  onChange={(value) => updateLinkForm("platform", value)}
                />
              </FormField>

              <FormField label="Link" htmlFor="dcp-social-link" required>
                <input
                  id="dcp-social-link"
                  type="text"
                  placeholder="Paste your post/reel/video link"
                  value={linkForm.link}
                  onChange={(e) => updateLinkForm("link", e.target.value)}
                  className={inputClass}
                />
              </FormField>

              {linkError && <p className="text-xs text-red-400">{linkError}</p>}

              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="tracked-label flex items-center justify-center gap-2 bg-gold-400 px-6 py-3 text-xs text-navy-950 transition hover:bg-gold-300"
                >
                  <FiPlus className="h-4 w-4" />
                  Add Link
                </button>
              </div>
            </form>

            {socialLinks.length === 0 ? (
              <EmptyState title="No links added yet" message="Paste links to your social media posts and reels promoting Simnani projects." />
            ) : (
              <div className="flex flex-col gap-3">
                {socialLinks.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FiLink className="h-4 w-4 shrink-0 text-gold-400" />
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-sm text-cream hover:text-gold-400"
                      >
                        {item.link}
                      </a>
                    </div>
                    <span className="tracked-label w-fit border border-navy-700/60 px-3 py-1 text-xs text-muted">
                      {item.platform} · {item.date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
