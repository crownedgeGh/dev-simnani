/**
 * adminStorage.js
 * ---------------
 * Centralised admin-side localStorage data layer.
 *
 * KEYS: every admin collection lives under se_admin_<collection>.
 * SEEDING: call seedAdminData() once in the admin layout (client side).
 *          It is idempotent — it only writes if the key is absent.
 */

import { PROPERTIES, getLocationCity } from "./properties";
import { PROJECTS } from "./projects";

// ---------------------------------------------------------------------------
// Storage key constants
// ---------------------------------------------------------------------------
export const ADMIN_KEYS = {
  properties: "se_admin_properties",
  users: "se_admin_users",
  projects: "se_admin_projects",
  leads: "se_admin_leads",
  callbacks: "se_admin_callbacks",
  freelancerLeads: "se_admin_freelancer_leads",
  freelancerProperties: "se_admin_freelancer_properties",
  cpLeads: "se_admin_cp_leads",
  cpNetwork: "se_admin_cp_network",
  campaignVideos: "se_admin_campaign_videos",
  commissions: "se_admin_commissions",
  promotionAssets: "se_admin_promotion_assets",
  activityLog: "se_admin_activity_log",
  invitationCodes: "se_admin_invitation_codes",
  cpAssignments: "se_admin_cp_assignments",
  cpSiteVisits: "se_admin_cp_site_visits",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function readCollection(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeCollection(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Silently ignore storage quota errors in demo mode
  }
}

// ---------------------------------------------------------------------------
// CP leads — every new lead (however it originates — a Digital CP's campaign,
// a Field CP's direct lead, etc.) lands with Head CP first. `routingStage`
// is the single source of truth for which CP dashboard currently owns a
// lead; `submittedBy.cpType` stays purely as provenance.
// ---------------------------------------------------------------------------
export function addCpLead(lead) {
  const leads = readCollection(ADMIN_KEYS.cpLeads) || [];
  writeCollection(ADMIN_KEYS.cpLeads, [{ routingStage: "head-cp", ...lead }, ...leads]);
}

// Head CP → Company CP: hands a verified lead down to a specific Company CP.
export function forwardLeadToCompanyCp(leadId, companyCpName) {
  const leads = readCollection(ADMIN_KEYS.cpLeads) || [];
  const updated = leads.map((l) =>
    l.id === leadId ? { ...l, routingStage: "company-cp", assignedTo: companyCpName } : l
  );
  writeCollection(ADMIN_KEYS.cpLeads, updated);
  return updated;
}

// Company CP → Field CP / Digital CP: delegates a lead it owns onward.
export function delegateLead(leadId, cpType, cpName) {
  const leads = readCollection(ADMIN_KEYS.cpLeads) || [];
  const updated = leads.map((l) =>
    l.id === leadId
      ? { ...l, routingStage: `${cpType}-cp`, assignedTo: cpName, status: cpName ? "Assigned" : l.status }
      : l
  );
  writeCollection(ADMIN_KEYS.cpLeads, updated);
  return updated;
}

// ---------------------------------------------------------------------------
// CP assignments — top-down property/project delegation:
// Head CP → Company CP (level "head-to-company"), then
// Company CP → Field CP / Digital CP (level "company-to-field" / "company-to-digital").
// ---------------------------------------------------------------------------
export function addCpAssignment(assignment) {
  const assignments = readCollection(ADMIN_KEYS.cpAssignments) || [];
  const record = {
    id: `SG-ASG-${Date.now()}`,
    status: "Assigned",
    createdAt: new Date().toISOString(),
    ...assignment,
  };
  writeCollection(ADMIN_KEYS.cpAssignments, [record, ...assignments]);
  return record;
}

export function getActiveAssignmentFor(propertyId, level) {
  const assignments = readCollection(ADMIN_KEYS.cpAssignments) || [];
  return assignments.find((a) => a.propertyId === propertyId && a.level === level) || null;
}

// ---------------------------------------------------------------------------
// CP site visits — scheduled/logged by a Field CP against an assigned
// project or a lead delegated to them.
// ---------------------------------------------------------------------------
export function addCpSiteVisit(visit) {
  const visits = readCollection(ADMIN_KEYS.cpSiteVisits) || [];
  const record = {
    id: `SG-VST-${Date.now()}`,
    status: "Scheduled",
    createdAt: new Date().toISOString(),
    ...visit,
  };
  writeCollection(ADMIN_KEYS.cpSiteVisits, [record, ...visits]);
  return record;
}

export function updateCpSiteVisit(visitId, patch) {
  const visits = readCollection(ADMIN_KEYS.cpSiteVisits) || [];
  const updated = visits.map((v) => (v.id === visitId ? { ...v, ...patch } : v));
  writeCollection(ADMIN_KEYS.cpSiteVisits, updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Campaign videos — a Digital CP uploads creative for an assigned project.
// ---------------------------------------------------------------------------
export function addCampaignVideo(video) {
  const videos = readCollection(ADMIN_KEYS.campaignVideos) || [];
  const record = {
    id: `SG-VID-${Date.now()}`,
    status: "Pending Review",
    note: "",
    postedLinks: [],
    ...video,
  };
  writeCollection(ADMIN_KEYS.campaignVideos, [record, ...videos]);
  return record;
}

// ---------------------------------------------------------------------------
// Invitation codes — generated in the admin CP workspace, redeemed on the
// public freelancer registration form.
// ---------------------------------------------------------------------------
export function findInvitationCode(code) {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) return null;
  const codes = readCollection(ADMIN_KEYS.invitationCodes) || [];
  return codes.find((c) => c.code.toUpperCase() === normalized) || null;
}

export function markInvitationCodeUsed(code, usedBy) {
  const normalized = (code || "").trim().toUpperCase();
  const codes = readCollection(ADMIN_KEYS.invitationCodes) || [];
  const updated = codes.map((c) =>
    c.code.toUpperCase() === normalized
      ? { ...c, used: true, usedBy, usedAt: new Date().toISOString() }
      : c
  );
  writeCollection(ADMIN_KEYS.invitationCodes, updated);
}

// ---------------------------------------------------------------------------
// Main seed function — idempotent
// ---------------------------------------------------------------------------
const ADMIN_DATA_VERSION = "v2.1"; // bump this to force a migration
const ADMIN_VERSION_KEY = "se_admin_data_version";

export function seedAdminData() {
  // Version migration: if stored version differs, clear only the leads key
  // so that the page no longer shows stale demo leads from a previous session.
  try {
    const stored = localStorage.getItem(ADMIN_VERSION_KEY);
    if (stored !== ADMIN_DATA_VERSION) {
      // Clear only the leads collection to remove the 19 demo leads
      localStorage.removeItem(ADMIN_KEYS.leads);
      localStorage.setItem(ADMIN_VERSION_KEY, ADMIN_DATA_VERSION);
    }
  } catch {
    // localStorage unavailable
  }

  const seed = (key, data) => {
    if (readCollection(key) === null) {
      writeCollection(key, data);
    }
  };

  // Properties — add city and status fields if missing
  seed(
    ADMIN_KEYS.properties,
    PROPERTIES.map((p) => ({
      ...p,
      city: p.city || (p.location ? getLocationCity(p.location) : "") || "Other",
      status: p.status || "Active",
      addedDate: p.addedDate || "Jan 1, 2025",
    }))
  );

  seed(ADMIN_KEYS.projects, PROJECTS.map((p) => ({ ...p })));
  seed(ADMIN_KEYS.users, []);
  seed(ADMIN_KEYS.callbacks, []);
  seed(ADMIN_KEYS.freelancerLeads, []);
  seed(ADMIN_KEYS.freelancerProperties, []);
  seed(ADMIN_KEYS.cpLeads, []);
  seed(ADMIN_KEYS.cpNetwork, []);
  seed(ADMIN_KEYS.campaignVideos, []);
  seed(ADMIN_KEYS.commissions, []);
  seed(ADMIN_KEYS.promotionAssets, []);
  // Leads now come from the real MongoDB database (ContactInquiry collection)
  // — do NOT seed demo data here. The admin Leads page fetches from /api/admin/inquiries.
  seed(ADMIN_KEYS.leads, []);
  seed(ADMIN_KEYS.activityLog, []);
  seed(ADMIN_KEYS.cpAssignments, []);
  seed(ADMIN_KEYS.cpSiteVisits, []);
}


// ---------------------------------------------------------------------------
// Reset — wipe all admin keys and re-seed
// ---------------------------------------------------------------------------
export function resetAdminData() {
  Object.values(ADMIN_KEYS).forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
  seedAdminData();
}
