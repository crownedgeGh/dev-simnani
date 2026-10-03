export const BROKER_COMMISSIONS = [];

export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Site Visit", "Converted", "Lost"];

export const LEAD_SOURCES = ["Website", "Referral", "Social Media", "Walk-in", "Cold Call", "Other"];

export const REFERRED_BY_OPTIONS = [
  { value: "company", label: "Company" },
  { value: "myself", label: "Myself" },
  { value: "other", label: "Other" },
];

export const PROPERTY_STATUSES = ["Pending Review", "Live", "Rejected"];

export const FREELANCER_LEADS = [];

export const FREELANCER_PROPERTIES = [];

export const TRAINING_MODULES = [
  { title: "How Simnani Works", progress: 100 },
  { title: "Finding Projects", progress: 45 },
  { title: "Promotion Guidelines", progress: 0 },
  { title: "Lead Submission", progress: 0 },
  { title: "Tracking & Commissions", progress: 0 },
];

// ---------------------------------------------------------------------------
// Channel Partner network — Company CP / Digital CP / Field CP demo fixtures
// ---------------------------------------------------------------------------

export const CP_LEAD_STATUSES = [
  "Pending Verification",
  "Verified",
  "Assigned",
  "Site Visit Scheduled",
  "Site Visit Completed",
  "Converted",
  "Lost",
];

export const CP_LEADS = [];

export const CP_NETWORK = [];

// ---------------------------------------------------------------------------
// CP project assignments — top-down property/project delegation:
// Head CP → Company CP, then Company CP → Field CP / Digital CP.
// `propertyId` refers to an entry in `lib/properties.js` (PROPERTIES), the
// same collection managed on /admin/properties.
// ---------------------------------------------------------------------------
export const CP_PROJECT_ASSIGNMENTS = [];

export const CP_SITE_VISITS = [];

export const CP_COMMISSIONS = [];

// Real campaign assets are uploaded per-project via the admin panel.
export const CP_PROMOTION_ASSETS = [];

export const CP_FIELD_ACTIVITY_TODAY = [];

export const CP_DIGITAL_CAMPAIGN_JOINS = [];

export const CP_CAMPAIGN_VIDEOS = [];

export const CP_STATS = {
  company: {
    totalLeads: CP_LEADS.length,
    pendingVerification: CP_LEADS.filter((l) => l.status === "Pending Verification").length,
    activeAssignments: CP_LEADS.filter((l) =>
      ["Assigned", "Site Visit Scheduled", "Site Visit Completed"].includes(l.status)
    ).length,
    commissionPendingApproval: CP_COMMISSIONS.filter((c) => c.approvalStatus !== "Approved").length,
  },
  digital: {
    leadsSubmitted: 0,
    dealsConverted: 0,
    commissionEarned: "₹0",
  },
  field: {
    assignedLeads: 0,
    siteVisitsScheduled: 0,
    dealsClosed: 0,
    commissionEarned: "₹0",
  },
};
