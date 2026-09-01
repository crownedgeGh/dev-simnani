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

export const FREELANCER_LEADS = [
  {
    id: "SG-LED-88210",
    customer: "Karan Malhotra",
    phone: "+91 98450 11223",
    project: "Simnani Green Residences",
    date: "Oct 22, 2025",
    status: "Qualified",
    source: "Referral",
    commission: "Pending",
    notes: "",
  },
  {
    id: "SG-LED-88104",
    customer: "Neha Bansal",
    phone: "+91 90080 44556",
    project: "Simnani Palm Villas",
    date: "Oct 15, 2025",
    status: "Converted",
    source: "Website",
    commission: "₹85,000",
    notes: "",
  },
];

export const FREELANCER_PROPERTIES = [
  {
    id: "SG-PROP-410287",
    title: "3 BHK Apartment near Whitefield",
    propertyType: "flat",
    city: "Bangalore",
    price: "1.15 Cr",
    area: "1650",
    bedrooms: "3",
    bathrooms: "2.5",
    description: "Well-ventilated apartment close to the tech corridor with clubhouse access.",
    referredBy: "myself",
    referredByNote: "",
    status: "Live",
    date: "Oct 12, 2025",
  },
  {
    id: "SG-PROP-410512",
    title: "Independent Villa, Devanahalli",
    propertyType: "villa",
    city: "Bangalore",
    price: "2.4 Cr",
    area: "3200",
    bedrooms: "4",
    bathrooms: "4",
    description: "Gated community villa with private garden and modular kitchen.",
    referredBy: "company",
    referredByNote: "",
    status: "Pending Review",
    date: "Oct 20, 2025",
  },
];

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

export const CP_LEADS = [
  {
    id: "SG-LED-71042",
    customer: "Ritika Sharma",
    phone: "+91 98220 55110",
    project: "Simnani Green Residences",
    source: "Instagram",
    sourceLink: "instagram.com/p/reel-green-residences",
    submittedBy: { cpType: "digital", name: "Aarav Shah" },
    status: "Pending Verification",
    assignedTo: null,
    commission: "Pending",
    date: "Oct 26, 2025",
  },
  {
    id: "SG-LED-71018",
    customer: "Manish Iyer",
    phone: "+91 90031 22987",
    project: "Simnani Business Park",
    source: "WhatsApp",
    sourceLink: "",
    submittedBy: { cpType: "digital", name: "Diya Kapoor" },
    status: "Verified",
    assignedTo: null,
    commission: "Pending",
    date: "Oct 24, 2025",
  },
  {
    id: "SG-LED-70988",
    customer: "Sana Qureshi",
    phone: "+91 99456 33210",
    project: "Simnani Meadow Plots",
    source: "YouTube",
    sourceLink: "youtube.com/watch?v=meadow-plots-tour",
    submittedBy: { cpType: "digital", name: "Aarav Shah" },
    status: "Assigned",
    assignedTo: "Rohan Deshpande",
    commission: "Pending",
    date: "Oct 20, 2025",
  },
  {
    id: "SG-LED-70921",
    customer: "Vivek Nair",
    phone: "+91 98765 44120",
    project: "Simnani Orchard Farms",
    source: "Personal Network",
    sourceLink: "",
    submittedBy: { cpType: "field", name: "Rohan Deshpande" },
    status: "Site Visit Scheduled",
    assignedTo: "Rohan Deshpande",
    commission: "Pending",
    date: "Oct 17, 2025",
  },
  {
    id: "SG-LED-70875",
    customer: "Priyanka Menon",
    phone: "+91 90210 88342",
    project: "Simnani Green Residences",
    source: "Facebook",
    sourceLink: "facebook.com/simnani/posts/green-residences",
    submittedBy: { cpType: "digital", name: "Diya Kapoor" },
    status: "Site Visit Completed",
    assignedTo: "Karthik Iyer",
    commission: "Pending",
    date: "Oct 12, 2025",
  },
  {
    id: "SG-LED-70810",
    customer: "Karan Malhotra",
    phone: "+91 98450 11223",
    project: "Simnani Palm Villas",
    source: "Referral",
    sourceLink: "",
    submittedBy: { cpType: "field", name: "Karthik Iyer" },
    status: "Converted",
    assignedTo: "Karthik Iyer",
    commission: "₹1,10,000",
    date: "Oct 5, 2025",
  },
  {
    id: "SG-LED-70754",
    customer: "Neha Bansal",
    phone: "+91 90080 44556",
    project: "Simnani Business Park",
    source: "Instagram",
    sourceLink: "instagram.com/p/reel-business-park",
    submittedBy: { cpType: "digital", name: "Aarav Shah" },
    status: "Lost",
    assignedTo: "Rohan Deshpande",
    commission: "—",
    date: "Sep 28, 2025",
  },
];

export const CP_NETWORK = [
  { id: "SG-DCP-118204", name: "Aarav Shah", cpType: "digital", leadsSubmitted: 34, siteVisits: 0, dealsClosed: 6 },
  { id: "SG-DCP-119873", name: "Diya Kapoor", cpType: "digital", leadsSubmitted: 27, siteVisits: 0, dealsClosed: 4 },
  { id: "SG-FCP-905732", name: "Rohan Deshpande", cpType: "field", leadsSubmitted: 9, siteVisits: 21, dealsClosed: 5 },
  { id: "SG-FCP-906144", name: "Karthik Iyer", cpType: "field", leadsSubmitted: 6, siteVisits: 18, dealsClosed: 7 },
];

export const CP_SITE_VISITS = [
  {
    leadId: "SG-LED-70921",
    scheduledAt: "Oct 29, 2025 · 11:00 AM",
    status: "Scheduled",
    livePhoto: null,
    followUps: [{ note: "Customer confirmed availability by phone.", at: "Oct 18, 2025" }],
  },
  {
    leadId: "SG-LED-70875",
    scheduledAt: "Oct 14, 2025 · 4:00 PM",
    status: "Visit Done",
    livePhoto: "site-clubhouse-visit.jpg",
    followUps: [
      { note: "Site visit done, customer liked the clubhouse.", at: "Oct 14, 2025" },
      { note: "Sent updated price sheet over WhatsApp.", at: "Oct 16, 2025" },
    ],
  },
  {
    leadId: "SG-LED-70810",
    scheduledAt: "Oct 3, 2025 · 10:30 AM",
    status: "Visit Done",
    livePhoto: "palm-villas-token.jpg",
    followUps: [{ note: "Booking confirmed, token amount received.", at: "Oct 5, 2025" }],
  },
];

export const CP_COMMISSIONS = [
  {
    leadId: "SG-LED-70810",
    customer: "Karan Malhotra",
    project: "Simnani Palm Villas",
    amount: "₹1,10,000",
    approvalStatus: "Approved",
  },
  {
    leadId: "SG-LED-70754",
    customer: "Neha Bansal",
    project: "Simnani Business Park",
    amount: "—",
    approvalStatus: "On Hold",
  },
];

export const CP_PROMOTION_ASSETS = [
  {
    projectId: "green-residences",
    photos: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80&auto=format&fit=crop",
    ],
    videos: ["Green Residences Walkthrough.mp4"],
    brochureUrl: "Green-Residences-Brochure.pdf",
  },
  {
    projectId: "meadow-plots",
    photos: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop",
    ],
    videos: ["Meadow Plots Aerial Tour.mp4"],
    brochureUrl: "Meadow-Plots-Brochure.pdf",
  },
  {
    projectId: "business-park",
    photos: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop",
    ],
    videos: ["Business Park Amenities.mp4"],
    brochureUrl: "Business-Park-Brochure.pdf",
  },
  {
    projectId: "orchard-farms",
    photos: [
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80&auto=format&fit=crop",
    ],
    videos: ["Orchard Farms Drone Tour.mp4"],
    brochureUrl: "Orchard-Farms-Brochure.pdf",
  },
];

export const CP_FIELD_ACTIVITY_TODAY = [
  {
    partnerName: "Rohan Deshpande",
    activities: [
      { type: "Property Visit", detail: "Site visit with Vivek Nair at Simnani Orchard Farms", time: "10:30 AM" },
      { type: "Photo Live", detail: "Uploaded live photo from the Orchard Farms visit", time: "11:05 AM" },
      { type: "Follow-up", detail: "Called Sana Qureshi regarding Meadow Plots pricing", time: "1:15 PM" },
    ],
  },
  {
    partnerName: "Karthik Iyer",
    activities: [
      { type: "Property Visit", detail: "Site visit with Priyanka Menon at Simnani Green Residences", time: "9:45 AM" },
      { type: "Photo Live", detail: "Uploaded live clubhouse photo", time: "10:00 AM" },
      { type: "Follow-up", detail: "Sent updated price sheet to Karan Malhotra over WhatsApp", time: "3:30 PM" },
    ],
  },
];

export const CP_DIGITAL_CAMPAIGN_JOINS = [
  {
    partnerName: "Aarav Shah",
    campaigns: ["Simnani Green Residences", "Simnani Meadow Plots", "Simnani Business Park"],
  },
  {
    partnerName: "Diya Kapoor",
    campaigns: ["Simnani Green Residences", "Simnani Business Park"],
  },
];

export const CP_CAMPAIGN_VIDEOS = [
  {
    id: "SG-VID-30011",
    partnerName: "Aarav Shah",
    project: "Simnani Green Residences",
    videoName: "Green Residences Walkthrough Reel.mp4",
    status: "Pending Review",
    note: "",
    postedLinks: [{ platform: "Instagram", url: "https://instagram.com/p/reel-green-residences" }],
  },
  {
    id: "SG-VID-30042",
    partnerName: "Diya Kapoor",
    project: "Simnani Business Park",
    videoName: "Business Park Amenities Tour.mp4",
    status: "Approved",
    note: "",
    postedLinks: [
      { platform: "Facebook", url: "https://facebook.com/simnani/posts/business-park-tour" },
      { platform: "YouTube", url: "https://youtube.com/watch?v=business-park-tour" },
    ],
  },
  {
    id: "SG-VID-30078",
    partnerName: "Aarav Shah",
    project: "Simnani Meadow Plots",
    videoName: "Meadow Plots Aerial Tour.mp4",
    status: "Suggested Edit",
    note: "Trim the intro to 5 seconds and add a price overlay before posting.",
    postedLinks: [],
  },
];

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
    leadsSubmitted: 61,
    dealsConverted: 10,
    commissionEarned: "₹3.8L",
  },
  field: {
    assignedLeads: 15,
    siteVisitsScheduled: 39,
    dealsClosed: 12,
    commissionEarned: "₹5.6L",
  },
};
