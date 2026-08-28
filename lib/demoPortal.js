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
