// Shared "Test Mode" Channel Partner profiles — one fixed demo accountId per
// CP tier, reused by every Test Mode entry point (navbar dropdown, the
// registration page's bypass panel, etc.) so they all sign into the exact
// same dedicated session per CP instead of drifting into separate accounts.
// /api/auth/session creates the DB user record on first use and reuses it
// after that.
export const TEST_MODE_CP_PROFILES = {
  field: { accountId: "DEMO-CP-FIELD", fullName: "TM Field CP", mobile: "9000000001", accountType: "freelancer", cpType: "field", city: "Raipur", state: "Chhattisgarh" },
  digital: { accountId: "DEMO-CP-DIGITAL", fullName: "TM Digital CP", mobile: "9000000002", accountType: "freelancer", cpType: "digital", city: "Raipur", state: "Chhattisgarh" },
  company: { accountId: "DEMO-CP-COMPANY", fullName: "TM Company CP", mobile: "9000000003", accountType: "freelancer", cpType: "company", city: "Raipur", state: "Chhattisgarh" },
};

// Shared "Test Mode" Service Provider profiles — one fixed demo accountId
// per service type, mirroring TEST_MODE_CP_PROFILES above.
export const TEST_MODE_SERVICE_PROVIDER_PROFILES = {
  "civil-contractor": { accountId: "DEMO-SP-CIVIL", fullName: "TM Civil Contractor", mobile: "9000000004", email: "tm.civil-contractor@simnaniestate.com", accountType: "service-provider", serviceType: "civil-contractor", city: "Raipur", state: "Chhattisgarh" },
  "industrial-epc": { accountId: "DEMO-SP-EPC", fullName: "TM Industrial EPC", mobile: "9000000005", email: "tm.industrial-epc@simnaniestate.com", accountType: "service-provider", serviceType: "industrial-epc", city: "Raipur", state: "Chhattisgarh" },
  "agri-infra": { accountId: "DEMO-SP-AGRI", fullName: "TM Agri Infra", mobile: "9000000006", email: "tm.agri-infra@simnaniestate.com", accountType: "service-provider", serviceType: "agri-infra", city: "Raipur", state: "Chhattisgarh" },
};
