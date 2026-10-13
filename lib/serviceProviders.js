// Service Provider account sub-types — chosen at registration
// (see ServiceProviderRegistrationWizard) and shown wherever a service
// provider's profile is rendered (portal header, admin user detail).
export const SERVICE_PROVIDER_TYPES = [
  {
    value: "civil-contractor",
    label: "Civil Contractor",
    description: "Building, renovation and civil construction work.",
  },
  {
    value: "industrial-epc",
    label: "Industrial EPC Engineer",
    description: "Engineering, procurement and construction for industrial plants.",
  },
  {
    value: "agri-infra",
    label: "Agri Infrastructure Developer",
    description: "Farm infrastructure, cold storage and agri-logistics projects.",
  },
];

export const SERVICE_PROVIDER_TYPE_VALUES = SERVICE_PROVIDER_TYPES.map((t) => t.value);

export function getServiceTypeLabel(value) {
  return SERVICE_PROVIDER_TYPES.find((t) => t.value === value)?.label || value || "";
}
