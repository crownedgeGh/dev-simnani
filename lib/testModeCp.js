// Shared "Test Mode" Channel Partner profiles — one fixed demo accountId per
// CP tier, reused by every Test Mode entry point (navbar dropdown, the
// registration page's bypass panel, etc.) so they all sign into the exact
// same dedicated session per CP instead of drifting into separate accounts.
// /api/auth/session creates the DB user record on first use and reuses it
// after that.
export const TEST_MODE_CP_PROFILES = {
  field: { accountId: "DEMO-CP-FIELD", fullName: "Rohan Mehta", mobile: "9000000001", accountType: "freelancer", cpType: "field" },
  digital: { accountId: "DEMO-CP-DIGITAL", fullName: "Aarav Shah", mobile: "9000000002", accountType: "freelancer", cpType: "digital" },
  company: { accountId: "DEMO-CP-COMPANY", fullName: "Simnani Partners Pvt. Ltd.", mobile: "9000000003", accountType: "freelancer", cpType: "company" },
};
