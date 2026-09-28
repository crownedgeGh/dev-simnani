import { PROJECTS } from "@/lib/projects";

export const BROKER_STATS = {
  activeListings: 12,
  totalLeads: 45,
  siteVisits: 8,
  closedDeals: 2,
};

export const BROKER_LEADS = [
  {
    id: "LD-8291",
    name: "Priya Nair",
    phone: "+91 98765 12345",
    status: "New",
    interest: "3 BHK Apartment",
    source: "Website",
    date: "Oct 24, 2025",
  },
  {
    id: "LD-8104",
    name: "Rohan Mehta",
    phone: "+91 91234 56789",
    status: "Contacted",
    interest: "Villa in Whitefield",
    source: "Referral",
    date: "Oct 21, 2025",
  },
  {
    id: "LD-7998",
    name: "Ayesha Khan",
    phone: "+91 99887 66554",
    status: "Site Visit",
    interest: "Commercial Office",
    source: "Website",
    date: "Oct 18, 2025",
  },
];

export const BROKER_CLIENTS = [
  {
    name: "Priya Nair",
    phone: "+91 98765 12345",
    status: "Active Negotiation",
    property: "3 BHK Apartment, Whitefield",
    lastActivity: "2 days ago",
  },
  {
    name: "Vikram Rao",
    phone: "+91 90000 11223",
    status: "Tour Scheduled",
    property: "Villa in Devanahalli",
    lastActivity: "5 days ago",
  },
];

export const BROKER_COMMISSIONS = [
  {
    property: "The Obsidian Penthouse",
    dealStatus: "Closed",
    commissionStatus: "Paid",
    amount: "₹4,50,000",
  },
  {
    property: "Simnani Green Residences",
    dealStatus: "Under Contract",
    commissionStatus: "Pending",
    amount: "₹1,20,000",
  },
];

export const FREELANCER_STATS = {
  projectsAvailable: 24,
  leadsSubmitted: 156,
  dealsClosed: 12,
  commissionEarned: "₹4.2L",
};

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

// Demo campaign assets per project — real files will be uploaded via the
// admin panel; these are placeholder names/images so the download UI has
// something to render.
export const CP_PROMOTION_ASSETS = PROJECTS.map((project) => ({
  projectId: project.id,
  images: [
    project.image,
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80&auto=format&fit=crop",
  ],
  videos: [`${project.name} Walkthrough`, `${project.name} Amenities Tour`],
  brochureUrl: `${project.id}-brochure.pdf`,
}));

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
