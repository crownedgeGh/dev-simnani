// Tracks which channel/role posted a property: the public site (broker /
// common-person via PostPropertyForm) vs. staff posting through the admin
// panel on behalf of a CP tier or as Super Admin.
export const POSTED_BY_ROLES = {
  PUBLIC: "public",
  SUPER_ADMIN: "super-admin",
  HEAD_CP: "head-cp",
  COMPANY_CP: "company-cp",
  FIELD_CP: "field-cp",
  DIGITAL_CP: "digital-cp",
};

export const NON_PUBLIC_POSTED_BY_ROLES = [
  POSTED_BY_ROLES.SUPER_ADMIN,
  POSTED_BY_ROLES.HEAD_CP,
  POSTED_BY_ROLES.COMPANY_CP,
  POSTED_BY_ROLES.FIELD_CP,
  POSTED_BY_ROLES.DIGITAL_CP,
];

export const POSTED_BY_ROLE_OPTIONS = [
  { value: POSTED_BY_ROLES.SUPER_ADMIN, label: "Super Admin" },
  { value: POSTED_BY_ROLES.HEAD_CP, label: "Head CP" },
  { value: POSTED_BY_ROLES.COMPANY_CP, label: "Company CP" },
  { value: POSTED_BY_ROLES.FIELD_CP, label: "Field CP" },
  { value: POSTED_BY_ROLES.DIGITAL_CP, label: "Digital CP" },
];

export function isPublicPostedByRole(role) {
  return !role || role === POSTED_BY_ROLES.PUBLIC;
}

export function getPostedByRoleLabel(role) {
  if (isPublicPostedByRole(role)) return "Public User";
  return POSTED_BY_ROLE_OPTIONS.find((o) => o.value === role)?.label || role;
}

// Display-facing "posted by" bucket shown on listings/detail pages: Owner
// (common person), Broker, or Company (admin panel or any CP tier posted it
// on the company's behalf).
export const POSTED_BY_CATEGORIES = {
  OWNER: "owner",
  BROKER: "broker",
  COMPANY: "company",
};

export const POSTED_BY_CATEGORY_OPTIONS = [
  { value: POSTED_BY_CATEGORIES.OWNER, label: "Owner" },
  { value: POSTED_BY_CATEGORIES.BROKER, label: "Broker" },
  { value: POSTED_BY_CATEGORIES.COMPANY, label: "Company" },
];

export function getPostedByCategory(property) {
  if (!isPublicPostedByRole(property?.postedByRole)) return POSTED_BY_CATEGORIES.COMPANY;
  if (property?.postedByAccountType === "broker") return POSTED_BY_CATEGORIES.BROKER;
  if (property?.postedByAccountType === "freelancer") return POSTED_BY_CATEGORIES.COMPANY;
  return POSTED_BY_CATEGORIES.OWNER;
}

export function getPostedByCategoryLabel(property) {
  const category = getPostedByCategory(property);
  return POSTED_BY_CATEGORY_OPTIONS.find((o) => o.value === category)?.label || "Owner";
}
