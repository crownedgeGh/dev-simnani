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
import {
  FREELANCER_LEADS,
  FREELANCER_PROPERTIES,
  CP_LEADS,
  CP_NETWORK,
  CP_CAMPAIGN_VIDEOS,
  CP_COMMISSIONS,
  CP_PROMOTION_ASSETS,
  BROKER_COMMISSIONS,
} from "./demoPortal";
import { EMPLOYEE_LEADS } from "./demoEmployeePortal";

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
// Demo callback data (seeded on first load)
// ---------------------------------------------------------------------------
const DEMO_CALLBACKS = [
  {
    id: "CB-2026-001",
    name: "Arjun Sharma",
    phone: "+91 98765 43210",
    email: "arjun.sharma@email.com",
    topic: "3 BHK Apartment in Indiranagar",
    message: "I'm interested in viewing the luxury 3 BHK apartment. Please call me between 10 AM - 12 PM.",
    date: "Sep 5, 2026",
    status: "Pending",
    assignedTo: "",
    adminNotes: "",
  },
  {
    id: "CB-2026-002",
    name: "Priya Mehta",
    phone: "+91 91234 56789",
    email: "priya.mehta@gmail.com",
    topic: "Investment opportunities",
    message: "Looking to invest ₹2 Cr in commercial real estate. Need guidance on best options.",
    date: "Sep 6, 2026",
    status: "In Progress",
    assignedTo: "Karthik Iyer",
    adminNotes: "Called twice, will follow up Friday.",
  },
  {
    id: "CB-2026-003",
    name: "Mohammed Rafi",
    phone: "+91 90080 22334",
    email: "mohammedrafi@outlook.com",
    topic: "Villa in Devanahalli",
    message: "Saw the villa listing online. Want a site visit this weekend if possible.",
    date: "Sep 7, 2026",
    status: "Handled",
    assignedTo: "Rohan Deshpande",
    adminNotes: "Site visit scheduled for Sep 12.",
  },
  {
    id: "CB-2026-004",
    name: "Sana Qureshi",
    phone: "+91 99456 33210",
    email: "sana.q@company.com",
    topic: "Commercial space enquiry",
    message: "Looking for 5000 sq.ft. office space in BKC or Andheri for a 5-year lease.",
    date: "Sep 7, 2026",
    status: "Pending",
    assignedTo: "",
    adminNotes: "",
  },
  {
    id: "CB-2026-005",
    name: "Kavya Nair",
    phone: "+91 97401 55667",
    email: "kavya.nair@email.in",
    topic: "Farming land near Pune",
    message: "Interested in agricultural land investment. Budget around ₹50 Lakh.",
    date: "Sep 8, 2026",
    status: "Pending",
    assignedTo: "",
    adminNotes: "",
  },
];

// ---------------------------------------------------------------------------
// Demo users (simulated registered accounts)
// ---------------------------------------------------------------------------
const DEMO_USERS = [
  {
    accountId: "SE-BUY-100001",
    fullName: "Priya Nair",
    mobile: "+91 98765 12345",
    email: "priya.nair@email.com",
    accountType: "buyer",
    city: "Bangalore",
    status: "Active",
    registeredDate: "Oct 10, 2025",
  },
  {
    accountId: "SE-BRK-200012",
    fullName: "Rohan Mehta",
    mobile: "+91 91234 56789",
    email: "rohan.mehta@brokerfirm.com",
    accountType: "broker",
    city: "Mumbai",
    status: "Active",
    registeredDate: "Oct 15, 2025",
  },
  {
    accountId: "SE-INV-300008",
    fullName: "Ayesha Khan",
    mobile: "+91 99887 66554",
    email: "ayesha.khan@investor.com",
    accountType: "investor",
    city: "Hyderabad",
    status: "Active",
    registeredDate: "Oct 20, 2025",
  },
  {
    accountId: "SE-FRL-400021",
    fullName: "Aarav Shah",
    mobile: "+91 90001 11223",
    email: "aarav.shah@freelance.in",
    accountType: "freelancer",
    city: "Bangalore",
    cpType: "digital",
    status: "Active",
    registeredDate: "Oct 25, 2025",
  },
  {
    accountId: "SE-FRL-400022",
    fullName: "Diya Kapoor",
    mobile: "+91 90002 22334",
    email: "diya.kapoor@freelance.in",
    accountType: "freelancer",
    city: "Pune",
    cpType: "digital",
    status: "Active",
    registeredDate: "Oct 28, 2025",
  },
  {
    accountId: "SE-FRL-400023",
    fullName: "Rohan Deshpande",
    mobile: "+91 90003 33445",
    email: "rohan.d@freelance.in",
    accountType: "freelancer",
    city: "Bangalore",
    cpType: "field",
    status: "Active",
    registeredDate: "Nov 1, 2025",
  },
  {
    accountId: "SE-COM-500005",
    fullName: "Vikram Rao",
    mobile: "+91 90000 11223",
    email: "vikram.rao@gmail.com",
    accountType: "common-person",
    city: "Bangalore",
    status: "Active",
    registeredDate: "Nov 5, 2025",
  },
  {
    accountId: "SE-EMP-600003",
    fullName: "Fatima Sheikh",
    mobile: "+91 98862 77889",
    email: "fatima.sheikh@simnani.com",
    accountType: "employee",
    city: "Bangalore",
    district: "Bangalore",
    status: "Active",
    registeredDate: "Aug 1, 2026",
  },
];

// ---------------------------------------------------------------------------
// Unified leads seed (freelancer + CP + employee with portalSource tag)
// ---------------------------------------------------------------------------
function buildUnifiedLeads() {
  const freelancerMapped = FREELANCER_LEADS.map((l) => ({
    ...l,
    portalSource: "Freelancer",
    customer: l.customer,
    property: l.project,
    submittedBy: "Freelancer Portal",
  }));

  const cpMapped = CP_LEADS.map((l) => ({
    ...l,
    portalSource: `CP-${l.submittedBy?.cpType || "digital"}`,
    customer: l.customer,
    property: l.project,
    submittedBy: `${l.submittedBy?.name || "—"} (${l.submittedBy?.cpType || "—"} CP)`,
    phone: l.phone || "",
  }));

  const empMapped = EMPLOYEE_LEADS.map((l) => ({
    id: l.id,
    customer: l.name,
    phone: l.phone,
    property: l.property,
    project: l.property,
    source: l.source,
    date: l.date,
    status: l.status,
    assignedTo: "Employee Portal",
    commission: "—",
    portalSource: "Employee",
    submittedBy: "Employee Portal",
    notes: l.notes?.join("; ") || "",
  }));

  return [...freelancerMapped, ...cpMapped, ...empMapped];
}

// ---------------------------------------------------------------------------
// Combined commissions seed
// ---------------------------------------------------------------------------
function buildCommissions() {
  const cp = CP_COMMISSIONS.map((c) => ({ ...c, source: "CP", type: "channel-partner" }));
  const broker = BROKER_COMMISSIONS.map((c) => ({ ...c, source: "Broker", type: "broker" }));
  return [...cp, ...broker];
}

// ---------------------------------------------------------------------------
// Main seed function — idempotent
// ---------------------------------------------------------------------------
export function seedAdminData() {
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
  seed(ADMIN_KEYS.users, DEMO_USERS);
  seed(ADMIN_KEYS.callbacks, DEMO_CALLBACKS);
  seed(ADMIN_KEYS.freelancerLeads, FREELANCER_LEADS.map((l) => ({ ...l })));
  seed(ADMIN_KEYS.freelancerProperties, FREELANCER_PROPERTIES.map((p) => ({ ...p })));
  seed(ADMIN_KEYS.cpLeads, CP_LEADS.map((l) => ({ ...l })));
  seed(
    ADMIN_KEYS.cpNetwork,
    CP_NETWORK.map((n) => ({ ...n, status: "Active" }))
  );
  seed(ADMIN_KEYS.campaignVideos, CP_CAMPAIGN_VIDEOS.map((v) => ({ ...v })));
  seed(ADMIN_KEYS.commissions, buildCommissions());
  seed(ADMIN_KEYS.promotionAssets, CP_PROMOTION_ASSETS.map((a) => ({ ...a })));
  seed(ADMIN_KEYS.leads, buildUnifiedLeads());
  seed(ADMIN_KEYS.activityLog, []);
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
