export const DEMO_USER = {
  name: "Arjun Sharma",
  role: "Investor",
  email: "arjun.sharma@example.com",
  mobile: "98765 43210",
  city: "Mumbai",
  memberSince: "March 2024",
};

export const SAVED_PROPERTY_IDS = ["buy-1", "invest-2", "rent-1"];

export const SITE_VISITS = [
  {
    id: "SG-VIS-771002",
    propertyId: "invest-1",
    date: "Oct 29, 2025",
    time: "2:00 PM",
    status: "upcoming",
  },
  {
    id: "SG-VIS-770881",
    propertyId: "buy-2",
    date: "Sep 12, 2025",
    time: "11:00 AM",
    status: "completed",
  },
];

export const SUPPORT_TICKETS = [
  {
    id: "SG-TKT-102938",
    subject: "Login Issue",
    date: "Oct 24, 2025",
    status: "open",
  },
  {
    id: "SG-TKT-102845",
    subject: "Schedule viewing for Villa Nova",
    date: "Oct 21, 2025",
    status: "in_progress",
  },
  {
    id: "SG-TKT-101522",
    subject: "Concierge: Private Chef Booking",
    date: "Sep 15, 2025",
    status: "resolved",
  },
];

export const NOTIFICATIONS = [
  {
    id: "n1",
    title: "New property matching your preferences",
    body: "A villa in Whitefield, Bangalore matches your saved search criteria.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Site visit confirmed",
    body: "Your visit for The Obsidian Penthouse has been confirmed.",
    time: "1 day ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Enquiry received",
    body: "Our advisory team received your enquiry and will respond shortly.",
    time: "3 days ago",
    unread: false,
  },
];

export const NOTIFICATION_CATEGORIES = [
  { key: "property", label: "Property Updates", description: "New listings and price changes.", locked: false, defaultOn: true },
  { key: "project", label: "Project Updates", description: "Milestones on developments you follow.", locked: false, defaultOn: true },
  { key: "lead", label: "Lead & Enquiry Updates", description: "Status changes on your enquiries.", locked: false, defaultOn: true },
  { key: "visit", label: "Site Visit Updates", description: "Confirmations and reminders.", locked: false, defaultOn: true },
  { key: "account", label: "Important Account Notifications", description: "Security and account alerts.", locked: true, defaultOn: true },
];
