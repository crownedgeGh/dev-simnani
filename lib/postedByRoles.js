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
