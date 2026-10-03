export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Interested",
  "Site Visit Scheduled",
  "Site Visit Done",
  "Negotiation",
  "Booked",
  "Lost",
];

export const LEAD_PRIORITIES = ["High", "Medium", "Low"];

export const EMPLOYEE_STATS = {
  totalAssignedLeads: 0,
  newLeads: 0,
  followUpsDueToday: 0,
  siteVisitsScheduled: 0,
  siteVisitsCompleted: 0,
  interestedCustomers: 0,
  bookings: 0,
  pendingFollowUps: 0,
  monthSalesValue: "₹0",
};

export const EMPLOYEE_LEADS = [];

export const SITE_VISITS = [];

export const SALES_TARGET = {
  monthlyTarget: 0,
  monthlyTargetLabel: "₹0",
  achieved: 0,
  achievedLabel: "₹0",
  totalBookings: 0,
  pendingBookings: 0,
  bookingAmount: "₹0",
  saleValue: "₹0",
  commission: "₹0",
};

export const PERFORMANCE = {
  month: "",
  leads: 0,
  contacted: 0,
  siteVisits: 0,
  completedVisits: 0,
  negotiations: 0,
  bookings: 0,
  salesValue: "₹0",
  conversionRate: "0.0%",
};

export const TERRITORY = {
  district: "",
  cities: [],
  projects: [],
};

// PROPERTIES[].location is formatted "Area, City" — match the trailing city
// against the employee's assigned district to scope territory inventory.
export function getPropertiesByDistrict(properties, district) {
  if (!district) return [];
  return properties.filter((property) => property.location.includes(district));
}
