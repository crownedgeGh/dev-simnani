"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiPlus, FiLink, FiCheck, FiArrowRight, FiChevronDown, FiChevronUp, FiUsers, FiX } from "react-icons/fi";
import { MdCampaign } from "react-icons/md";
import { FaInstagram, FaFacebook, FaYoutube, FaWhatsapp } from "react-icons/fa6";
import Tabs from "./Tabs";
import StatCard from "./StatCard";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import ConfirmDialog from "./ConfirmDialog";
import PropertyGrid from "@/components/property/PropertyGrid";
import ChipGroup from "@/components/auth/ChipGroup";
import FormField from "@/components/auth/FormField";
import { inputClass, textareaClass } from "@/components/auth/inputStyles";
import { toast } from "sonner";
import RefreshButton from "./RefreshButton";
import { usePersistentTab } from "@/lib/usePersistentTab";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "campaign", label: "Assigned Projects" },
  { key: "links", label: "My Ad Links" },
  { key: "earnings", label: "My Earnings" },
  { key: "listings", label: "My Listings" },
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

const PLATFORM_ICONS = {
  Instagram: FaInstagram,
  Facebook: FaFacebook,
  YouTube: FaYoutube,
  WhatsApp: FaWhatsapp,
  Other: FiLink,
};

const INITIAL_LINK_FORM = { platform: "", link: "" };
const INITIAL_LEAD_FORM = { name: "", contact: "", notes: "" };

function slugify(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function DigitalCPDashboard({ stats, assets, partner, myListings = [] }) {
  const [tab, setTab] = usePersistentTab(
    "cp_tab_digital",
    TABS.map((t) => t.key),
    "overview"
  );

  const [linkForm, setLinkForm] = useState(INITIAL_LINK_FORM);
  const [linkError, setLinkError] = useState("");
  const [socialLinks, setSocialLinks] = useState([]);
  const [linkSaving, setLinkSaving] = useState(false);

  // Properties forwarded to this Digital CP by their Company CP. "Joined"
  // is persisted as the assignment's own status ("In Progress" = joined).
  const [forwardedProperties, setForwardedProperties] = useState([]);
  const [leaveCampaignId, setLeaveCampaignId] = useState(null);
  const joinedForwardedIds = forwardedProperties.filter((p) => p.status === "In Progress").map((p) => p.id);

  const loadForwardedProperties = useCallback(async () => {
    if (!partner?.accountId) return;
    try {
      const res = await fetch(`/api/assignments?level=company-to-digital&assignedToAccountId=${partner.accountId}`);
      const json = await res.json();
      setForwardedProperties(json.success ? json.data : []);
    } catch {
      setForwardedProperties([]);
    }
  }, [partner]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadForwardedProperties();
    });
    return () => { active = false; };
  }, [loadForwardedProperties]);

  // Leads are tracked per ad link — { [linkId]: [lead, lead, ...] }
  const [leadsByLink, setLeadsByLink] = useState({});
  const [leadDrafts, setLeadDrafts] = useState({});
  const [leadDraftErrors, setLeadDraftErrors] = useState({});
  const [openLeadFormFor, setOpenLeadFormFor] = useState(null);
  const [expandedLinkIds, setExpandedLinkIds] = useState([]);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);

  const loadLinksAndLeads = useCallback(async () => {
    if (!partner?.accountId) return;
    try {
      const [linksRes, leadsRes] = await Promise.all([
        fetch(`/api/ad-links?digitalCpAccountId=${partner.accountId}`),
        fetch(`/api/cp-leads?submittedByAccountId=${partner.accountId}`),
      ]);
      const linksJson = await linksRes.json();
      const leadsJson = await leadsRes.json();
      const links = linksJson.success ? linksJson.data : [];
      const leads = leadsJson.success ? leadsJson.data : [];
      setSocialLinks(links);
      const grouped = {};
      leads.forEach((lead) => {
        if (!lead.adLinkId) return;
        grouped[lead.adLinkId] = [...(grouped[lead.adLinkId] || []), lead];
      });
      setLeadsByLink(grouped);
    } catch {
      // keep whatever was already loaded
    }
  }, [partner]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadLinksAndLeads();
    });
    return () => { active = false; };
  }, [loadLinksAndLeads]);

  // Per-section refresh keys
  const [refreshKeys, setRefreshKeys] = useState({
    overview: 0,
    campaign: 0,
    earnings: 0,
    links: 0,
  });

  const refreshSection = useCallback(
    (section) => {
      setRefreshKeys((prev) => ({ ...prev, [section]: prev[section] + 1 }));
      if (section === "links") {
        setLinkForm(INITIAL_LINK_FORM);
        setLinkError("");
        setLeadDrafts({});
        setLeadDraftErrors({});
        setOpenLeadFormFor(null);
        setExpandedLinkIds([]);
        setIsAddLinkOpen(false);
        loadLinksAndLeads();
      }
      if (section === "campaign") {
        loadForwardedProperties();
      }
    },
    [loadForwardedProperties, loadLinksAndLeads]
  );

  async function setCampaignJoined(id, joined) {
    try {
      const res = await fetch(`/api/assignments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: joined ? "In Progress" : "Assigned" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update campaign");
      setForwardedProperties((prev) => prev.map((p) => (p.id === id ? json.data : p)));
    } catch (error) {
      toast.error(error.message || "Couldn't update the campaign — please try again");
    }
  }

  function handleCampaignButtonClick(id) {
    if (joinedForwardedIds.includes(id)) {
      setLeaveCampaignId(id);
    } else {
      setCampaignJoined(id, true);
    }
  }

  function confirmLeaveCampaign() {
    if (leaveCampaignId) setCampaignJoined(leaveCampaignId, false);
    setLeaveCampaignId(null);
  }

  function updateLeadDraft(linkId, field, value) {
    setLeadDrafts((prev) => ({
      ...prev,
      [linkId]: { ...(prev[linkId] || INITIAL_LEAD_FORM), [field]: value },
    }));
  }

  async function handleAddLeadForLink(linkId, e) {
    e.preventDefault();
    const draft = leadDrafts[linkId] || INITIAL_LEAD_FORM;
    if (!draft.name?.trim() || !draft.contact?.trim()) {
      setLeadDraftErrors((prev) => ({ ...prev, [linkId]: "Please fill in the name and contact number." }));
      return;
    }
    setLeadDraftErrors((prev) => ({ ...prev, [linkId]: "" }));
    const link = socialLinks.find((l) => l.id === linkId);
    try {
      const res = await fetch("/api/cp-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: draft.name.trim(),
          phone: draft.contact.trim(),
          project: link?.platform ? `${link.platform} Link` : "—",
          source: "Digital CP",
          notes: draft.notes ? `${draft.notes} (via ${link?.link})` : `Via ${link?.link}`,
          adLinkId: linkId,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save lead");
      setLeadsByLink((prev) => ({ ...prev, [linkId]: [json.data, ...(prev[linkId] || [])] }));
      setLeadDrafts((prev) => ({ ...prev, [linkId]: INITIAL_LEAD_FORM }));
    } catch (error) {
      setLeadDraftErrors((prev) => ({ ...prev, [linkId]: error.message || "Couldn't save the lead — please try again." }));
    }
  }

  function updateLinkForm(field, value) {
    setLinkForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleExpandedLink(linkId) {
    setExpandedLinkIds((prev) =>
      prev.includes(linkId) ? prev.filter((id) => id !== linkId) : [...prev, linkId]
    );
  }

  async function handleSubmitLink(e) {
    e.preventDefault();
    if (!linkForm.platform || !linkForm.link.trim()) {
      setLinkError("Please select a platform and paste the link.");
      return;
    }
    setLinkError("");
    setLinkSaving(true);
    try {
      const res = await fetch("/api/ad-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: PLATFORMS.find((p) => p.value === linkForm.platform)?.label || "Other",
          link: linkForm.link.trim(),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to add link");
      setExpandedLinkIds((prev) => [...prev, json.data.id]);
      setSocialLinks((prev) => [json.data, ...prev]);
      setLinkForm(INITIAL_LINK_FORM);
      setIsAddLinkOpen(false);
    } catch (error) {
      setLinkError(error.message || "Couldn't add the link — please try again.");
    } finally {
      setLinkSaving(false);
    }
  }

  return (
    <div>
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
              {joinedForwardedIds.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    title="No campaigns joined yet"
                    message="Projects assigned to you by your Company CP will appear here."
                  />
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {forwardedProperties
                    .filter((p) => joinedForwardedIds.includes(p.id))
                    .map((p) => (
                      <Link
                        key={p.id}
                        href={`/property/${p.propertyId || p.id}?campaign=1`}
                        className="group block border border-navy-700/60 bg-navy-900 p-4 transition hover:border-gold-500/60"
                      >
                        <div className="relative h-32 w-full overflow-hidden rounded-sm">
                          <Image
                            src={p.propertyImage || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80&auto=format&fit=crop"}
                            alt={p.propertyTitle || "Property"}
                            fill
                            sizes="(max-width: 640px) 100vw, 33vw"
                            className="object-cover transition group-hover:scale-105"
                          />
                        </div>
                        <h3 className="mt-3 font-display text-base text-cream group-hover:text-gold-400 transition">{p.propertyTitle}</h3>
                        <p className="mt-1 text-xs text-muted">{p.propertyLocation}</p>
                        <div className="mt-3 flex items-center justify-between">
                          {p.propertyStatus === "Sold" ? (
                            <span className="tracked-label flex w-fit items-center gap-1 rounded-full border border-red-500/70 px-3 py-1 text-xs text-red-400">
                              Sold Out
                            </span>
                          ) : (
                            <span className="tracked-label flex w-fit items-center gap-1 rounded-full border border-gold-500/70 px-3 py-1 text-xs text-gold-400">
                              <FiCheck className="h-3.5 w-3.5" />
                              Joined
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-muted opacity-0 transition group-hover:opacity-100">
                            View Property <FiArrowRight className="h-3.5 w-3.5" />
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

        {tab === "campaign" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <p className="tracked-label text-xs text-gold-400">Assigned Projects</p>
              <RefreshButton onRefresh={() => refreshSection("campaign")} label="Refresh assigned projects" />
            </div>

            {/* ── Forwarded by Company CP ──────────────────────── */}
            {forwardedProperties.length > 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="font-display text-xl text-cream">Forwarded by Company CP</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {forwardedProperties.map((property) => {
                    const propHref = `/property/${property.propertyId || property.id}?campaign=1`;
                    const isJoined = joinedForwardedIds.includes(property.id);
                    const isSold = property.propertyStatus === "Sold";
                    return (
                      <div key={property.id} className="flex flex-col justify-between border border-navy-700/60 bg-navy-900 p-4 transition hover:border-gold-500/50">
                        <Link href={propHref} className="group flex flex-col">
                          <div className="relative h-36 w-full overflow-hidden rounded-sm">
                            <Image
                              src={property.propertyImage || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80&auto=format&fit=crop"}
                              alt={property.propertyTitle || "Property"}
                              fill
                              sizes="(max-width: 640px) 100vw, 33vw"
                              className="object-cover transition duration-300 group-hover:scale-105"
                            />
                          </div>
                          <h3 className="mt-3 font-display text-base text-cream transition group-hover:text-gold-400">{property.propertyTitle}</h3>
                          <p className="mt-1 text-xs text-muted">{property.propertyLocation}</p>
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-gold-400">
                            <span className="font-medium">View Property Details</span>
                            <FiArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                          </div>
                        </Link>
                        {isSold ? (
                          <span className="tracked-label mt-3 flex w-fit items-center gap-1.5 rounded-full border border-red-500/70 px-3 py-2 text-[10px] text-red-400">
                            Sold Out
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCampaignButtonClick(property.id)}
                            className={`tracked-label mt-3 flex w-fit items-center gap-1.5 rounded-full px-3.5 py-2 text-[10px] transition active:scale-[0.98] ${
                              isJoined
                                ? "border border-red-500/70 text-red-400 hover:bg-red-500/10"
                                : "bg-gold-400 text-navy-950 shadow-lg shadow-gold-400/10 hover:bg-gold-300"
                            }`}
                          >
                            {isJoined ? (
                              <>
                                <FiX className="h-3.5 w-3.5" />
                                Leave Campaign
                              </>
                            ) : (
                              <>
                                <MdCampaign className="h-3.5 w-3.5" />
                                Join Campaign
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {forwardedProperties.length === 0 && (
              <EmptyState
                title="No projects assigned yet"
                message="Your Company CP will forward project assignments here."
              />
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
              <StatCard label="Deals Converted" value={stats.dealsConverted} />
              <StatCard label="Leads Submitted" value={stats.leadsSubmitted} />
            </div>
          </div>
        )}

        {tab === "links" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <p className="tracked-label text-xs text-gold-400">My Ad Links</p>
              <RefreshButton onRefresh={() => refreshSection("links")} label="Refresh ad links" />
            </div>
            <p className="text-sm text-muted">
              Post a shareable ad or video link for each promotion, then log every lead that link brings in right underneath it —
              no more mixing up which lead came from which post.
            </p>

            {/* ── Add Ad Link ─────────────────────── */}
            <div className="border-2 border-dashed border-gold-500/40 bg-gold-400/[0.04]">
              <button
                type="button"
                onClick={() => setIsAddLinkOpen((prev) => !prev)}
                aria-expanded={isAddLinkOpen}
                className="flex w-full min-h-11 items-center justify-between gap-3 p-4 text-left sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-400/15">
                    <FiLink className="h-4.5 w-4.5 text-gold-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-cream">Add Ad / Video Link</h2>
                    <p className="text-xs text-muted">Create a new trackable link — its own lead list starts below once saved.</p>
                  </div>
                </div>
                {isAddLinkOpen ? (
                  <FiChevronUp className="h-4 w-4 shrink-0 text-gold-400" />
                ) : (
                  <FiChevronDown className="h-4 w-4 shrink-0 text-gold-400" />
                )}
              </button>

              {isAddLinkOpen && (
                <form
                  onSubmit={handleSubmitLink}
                  className="flex flex-col gap-4 border-t border-dashed border-gold-500/40 p-4 sm:p-6"
                >
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
                      placeholder="Paste your ad post / reel / video link"
                      value={linkForm.link}
                      onChange={(e) => updateLinkForm("link", e.target.value)}
                      className={inputClass}
                    />
                  </FormField>

                  {linkError && <p className="text-xs text-red-400">{linkError}</p>}

                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      className="tracked-label flex items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 active:scale-[0.98]"
                    >
                      <FiPlus className="h-4 w-4" />
                      Add Link
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ── Links + their own leads ─────────────────────── */}
            {socialLinks.length === 0 ? (
              <EmptyState title="No ad links added yet" message="Paste your first ad or video link above — leads for that link will show up right here under it." />
            ) : (
              <div className="flex flex-col gap-4">
                {socialLinks.map((item) => {
                  const leads = leadsByLink[item.id] || [];
                  const draft = leadDrafts[item.id] || INITIAL_LEAD_FORM;
                  const isFormOpen = openLeadFormFor === item.id;
                  const isExpanded = expandedLinkIds.includes(item.id);
                  const PlatformIcon = PLATFORM_ICONS[item.platform] || FiLink;
                  return (
                    <div key={item.id} className="border border-navy-700/60 border-l-4 border-l-gold-400 bg-navy-900">
                      <button
                        type="button"
                        onClick={() => toggleExpandedLink(item.id)}
                        aria-expanded={isExpanded}
                        className="flex w-full min-h-11 flex-col gap-3 p-4 text-left transition hover:bg-navy-800/40 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-navy-700/60 bg-navy-950">
                            <PlatformIcon className="h-4 w-4 text-gold-400" />
                          </div>
                          <div className="min-w-0">
                            <span className="block truncate text-sm text-cream">{item.link}</span>
                            <span className="tracked-label text-[10px] text-muted">{item.platform} · {item.date}</span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge tone="gold">
                            <span className="flex items-center gap-1">
                              <FiUsers className="h-3 w-3" />
                              {leads.length} {leads.length === 1 ? "lead" : "leads"}
                            </span>
                          </Badge>
                          {isExpanded ? (
                            <FiChevronUp className="h-4 w-4 shrink-0 text-muted" />
                          ) : (
                            <FiChevronDown className="h-4 w-4 shrink-0 text-muted" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="flex flex-col gap-4 border-t border-navy-700/60 p-4 sm:p-6">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="truncate text-xs text-gold-400 hover:text-gold-300"
                            >
                              Open link ↗
                            </a>
                            <button
                              type="button"
                              onClick={() => setOpenLeadFormFor(isFormOpen ? null : item.id)}
                              className="tracked-label flex items-center gap-1.5 rounded-full border border-gold-500/70 px-3.5 py-2 text-xs text-gold-400 transition hover:bg-gold-500/10 active:scale-[0.98]"
                            >
                              <FiPlus className="h-3.5 w-3.5" />
                              Add Lead
                              {isFormOpen ? <FiChevronUp className="h-3.5 w-3.5" /> : <FiChevronDown className="h-3.5 w-3.5" />}
                            </button>
                          </div>

                          {isFormOpen && (
                            <form
                              onSubmit={(e) => handleAddLeadForLink(item.id, e)}
                              className="flex flex-col gap-4 border border-navy-700/60 bg-navy-950 p-4"
                            >
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField label="Name" htmlFor={`dcp-lead-name-${item.id}`} required>
                                  <input
                                    id={`dcp-lead-name-${item.id}`}
                                    type="text"
                                    placeholder="e.g. Ritika Sharma"
                                    value={draft.name}
                                    onChange={(e) => updateLeadDraft(item.id, "name", e.target.value)}
                                    className={inputClass}
                                  />
                                </FormField>
                                <FormField label="Contact" htmlFor={`dcp-lead-contact-${item.id}`} required>
                                  <input
                                    id={`dcp-lead-contact-${item.id}`}
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    value={draft.contact}
                                    onChange={(e) => updateLeadDraft(item.id, "contact", e.target.value)}
                                    className={inputClass}
                                  />
                                </FormField>
                              </div>
                              <FormField label="Notes" htmlFor={`dcp-lead-notes-${item.id}`} optional>
                                <textarea
                                  id={`dcp-lead-notes-${item.id}`}
                                  rows={2}
                                  placeholder="Any details about the lead"
                                  value={draft.notes}
                                  onChange={(e) => updateLeadDraft(item.id, "notes", e.target.value)}
                                  className={textareaClass}
                                />
                              </FormField>

                              {leadDraftErrors[item.id] && <p className="text-xs text-red-400">{leadDraftErrors[item.id]}</p>}

                              <div className="flex justify-end">
                                <button
                                  type="submit"
                                  className="tracked-label flex items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 active:scale-[0.98]"
                                >
                                  <FiPlus className="h-4 w-4" />
                                  Save Lead
                                </button>
                              </div>
                            </form>
                          )}

                          {leads.length === 0 ? (
                            <p className="text-xs text-muted">No leads logged for this link yet.</p>
                          ) : (
                            <div className="flex max-h-[24rem] flex-col divide-y divide-navy-800 overflow-y-auto pr-1">
                              {leads.map((lead) => (
                                <div
                                  key={lead.id}
                                  className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0"
                                >
                                  <div className="min-w-0">
                                    <p className="text-sm text-cream">{lead.customer}</p>
                                    <p className="mt-1 text-xs text-muted">{lead.phone}</p>
                                    {lead.notes && <p className="mt-1 text-xs text-muted">{lead.notes}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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

      <ConfirmDialog
        isOpen={leaveCampaignId !== null}
        onCancel={() => setLeaveCampaignId(null)}
        onConfirm={confirmLeaveCampaign}
        title="Leave this campaign?"
        message="You will stop promoting this project and lose access to its campaign assets. You can re-join anytime from Assigned Projects."
        confirmLabel="Leave Campaign"
        cancelLabel="Stay Joined"
      />
    </div>
  );
}
