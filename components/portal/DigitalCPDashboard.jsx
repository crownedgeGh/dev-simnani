"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiPlus, FiLink, FiCheck, FiSend, FiShield, FiArrowRight } from "react-icons/fi";
import { MdCampaign } from "react-icons/md";
import Tabs from "./Tabs";
import StatCard from "./StatCard";
import EmptyState from "./EmptyState";
import ChipGroup from "@/components/auth/ChipGroup";
import FormField from "@/components/auth/FormField";
import { inputClass, selectClass, textareaClass } from "@/components/auth/inputStyles";
import { generateAccountId } from "@/lib/auth";
import RefreshButton from "./RefreshButton";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "myLeads", label: "My Leads" },
  { key: "campaign", label: "Campaign" },
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

const INITIAL_LINK_FORM = { platform: "", link: "" };
const INITIAL_LEAD_FORM = { name: "", contact: "", notes: "" };
const INITIAL_ADD_CAMPAIGN_FORM = { projectId: "" };

function slugify(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function DigitalCPDashboard({ stats, projects, assets, initialJoinedCampaigns = [] }) {
  const [tab, setTab] = useState("overview");

  const [linkForm, setLinkForm] = useState(INITIAL_LINK_FORM);
  const [linkError, setLinkError] = useState("");
  const [socialLinks, setSocialLinks] = useState([]);

  const [joinedCampaigns, setJoinedCampaigns] = useState(initialJoinedCampaigns);

  const [leadForm, setLeadForm] = useState(INITIAL_LEAD_FORM);
  const [leadError, setLeadError] = useState("");
  const [myLeads, setMyLeads] = useState([]);

  const [addCampaignForm, setAddCampaignForm] = useState(INITIAL_ADD_CAMPAIGN_FORM);
  const [addCampaignError, setAddCampaignError] = useState("");
  const [addCampaignSuccess, setAddCampaignSuccess] = useState("");

  // Per-section refresh keys
  const [refreshKeys, setRefreshKeys] = useState({
    overview: 0,
    myLeads: 0,
    campaign: 0,
    earnings: 0,
    links: 0,
  });

  const refreshSection = useCallback(
    (section) => {
      setRefreshKeys((prev) => ({ ...prev, [section]: prev[section] + 1 }));
      if (section === "myLeads") {
        setMyLeads([]);
        setLeadForm(INITIAL_LEAD_FORM);
        setLeadError("");
      }
      if (section === "links") {
        setSocialLinks([]);
        setLinkForm(INITIAL_LINK_FORM);
        setLinkError("");
        setAddCampaignForm(INITIAL_ADD_CAMPAIGN_FORM);
        setAddCampaignError("");
        setAddCampaignSuccess("");
      }
      if (section === "campaign") {
        setJoinedCampaigns(initialJoinedCampaigns);
      }
    },
    [initialJoinedCampaigns]
  );

  function toggleJoinCampaign(projectId) {
    setJoinedCampaigns((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  }

  function handleAddCampaign(e) {
    e.preventDefault();
    if (!addCampaignForm.projectId) {
      setAddCampaignError("Please select a campaign to join.");
      setAddCampaignSuccess("");
      return;
    }
    if (joinedCampaigns.includes(addCampaignForm.projectId)) {
      setAddCampaignError("You have already joined this campaign.");
      setAddCampaignSuccess("");
      return;
    }
    setJoinedCampaigns((prev) => [...prev, addCampaignForm.projectId]);
    const name = projects.find((p) => p.id === addCampaignForm.projectId)?.name || "";
    setAddCampaignSuccess(`You have joined the "${name}" campaign.`);
    setAddCampaignError("");
    setAddCampaignForm(INITIAL_ADD_CAMPAIGN_FORM);
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
            <div className="flex items-center justify-between">
              <p className="tracked-label text-xs text-gold-400">Performance Overview</p>
              <RefreshButton onRefresh={() => refreshSection("overview")} label="Refresh overview" />
            </div>
            <div key={refreshKeys.overview} className="flex flex-col gap-8">
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
                    message="Head to the Campaign tab or use My Links → Add Campaign to join a project campaign."
                  />
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {projects
                    .filter((p) => joinedCampaigns.includes(p.id))
                    .map((p) => (
                      <Link
                        key={p.id}
                        href={`/portal/freelancer/campaign/${p.id}`}
                        className="group block border border-navy-700/60 bg-navy-900 p-4 transition hover:border-gold-500/60"
                      >
                        <div className="relative h-32 w-full overflow-hidden rounded-sm">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 33vw"
                            className="object-cover transition group-hover:scale-105"
                          />
                        </div>
                        <h3 className="mt-3 font-display text-base text-cream group-hover:text-gold-400 transition">{p.name}</h3>
                        <p className="mt-1 text-xs text-muted">{p.location}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="tracked-label flex w-fit items-center gap-1 border border-gold-500/70 px-3 py-1 text-xs text-gold-400">
                            <FiCheck className="h-3.5 w-3.5" />
                            Joined
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted opacity-0 transition group-hover:opacity-100">
                            View Campaign <FiArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                </div>
              )}
            </div>
            </div>
          </div>
        )}

        {tab === "myLeads" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <p className="tracked-label text-xs text-gold-400">My Leads</p>
              <RefreshButton onRefresh={() => refreshSection("myLeads")} label="Refresh leads" />
            </div>
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
            <div className="flex items-center justify-between">
              <p className="tracked-label text-xs text-gold-400">All Campaigns</p>
              <RefreshButton onRefresh={() => refreshSection("campaign")} label="Refresh campaigns" />
            </div>
            <p className="text-sm text-muted">
              Select a campaign below to view full guidelines, video dos &amp; don&apos;ts, and downloadable assets.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/portal/freelancer/campaign/${p.id}`}
                  className="group flex flex-col gap-0 overflow-hidden border border-navy-700/60 bg-navy-900 transition hover:border-gold-500/60"
                >
                  <div className="relative h-36 w-full overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition group-hover:scale-105"
                    />
                    {joinedCampaigns.includes(p.id) && (
                      <div className="absolute left-2 top-2 flex items-center gap-1 border border-gold-500/70 bg-navy-950/80 px-2 py-1 backdrop-blur-sm">
                        <FiCheck className="h-3 w-3 text-gold-400" />
                        <span className="tracked-label text-[9px] text-gold-400">Joined</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 p-4">
                    <h3 className="font-display text-sm text-cream transition group-hover:text-gold-400">{p.name}</h3>
                    <p className="text-xs text-muted">{p.location}</p>
                    <p className="text-xs text-muted">{p.startingPrice} · {p.status}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-gold-400 opacity-0 transition group-hover:opacity-100">
                      <MdCampaign className="h-3.5 w-3.5" />
                      View Campaign <FiArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
              <StatCard label="Deals Converted" value={stats.dealsConverted} />
              <StatCard label="Leads Submitted" value={stats.leadsSubmitted} />
            </div>
          </div>
        )}

        {tab === "links" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <p className="tracked-label text-xs text-gold-400">My Links</p>
              <RefreshButton onRefresh={() => refreshSection("links")} label="Refresh links" />
            </div>
            {/* ── Add Campaign ──────────────────────────────── */}
            <form
              onSubmit={handleAddCampaign}
              className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-4 sm:p-6"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400/15">
                  <MdCampaign className="h-4 w-4 text-gold-400" />
                </div>
                <h2 className="font-display text-xl text-cream">Add Campaign</h2>
              </div>
              <p className="text-xs text-muted">
                Select a project campaign to join. Once joined, it will appear on your Overview and you&apos;ll unlock campaign assets.
              </p>

              <FormField label="Campaign" htmlFor="dcp-add-campaign-select" required>
                <select
                  id="dcp-add-campaign-select"
                  value={addCampaignForm.projectId}
                  onChange={(e) => setAddCampaignForm({ projectId: e.target.value })}
                  className={selectClass}
                >
                  <option value="">Select campaign</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </FormField>

              {addCampaignError && <p className="text-xs text-red-400">{addCampaignError}</p>}
              {addCampaignSuccess && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <FiCheck className="h-3.5 w-3.5" /> {addCampaignSuccess}
                </p>
              )}

              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {joinedCampaigns.length > 0 && projects
                    .filter((p) => joinedCampaigns.includes(p.id))
                    .map((p) => (
                      <span
                        key={p.id}
                        className="tracked-label flex items-center gap-1 border border-gold-500/70 bg-gold-500/10 px-2 py-1 text-[10px] text-gold-400"
                      >
                        <FiCheck className="h-3 w-3" />
                        {p.name}
                      </span>
                    ))}
                </div>
                <button
                  type="submit"
                  className="tracked-label flex shrink-0 items-center justify-center gap-2 bg-gold-400 px-6 py-3 text-xs text-navy-950 transition hover:bg-gold-300"
                >
                  <MdCampaign className="h-4 w-4" />
                  Add Campaign
                </button>
              </div>
            </form>

            {/* ── Add Social Media Link ─────────────────────── */}
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
