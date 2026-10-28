import ContractorLead from "@/models/ContractorLead";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { getServiceTypeLabel } from "@/lib/serviceProviders";

// Escape before building a RegExp — city/state can come from user input.
const exactly = (v) =>
  new RegExp(`^${v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

// City match first, falling back to the rest of the state — the single
// place this precedence rule lives, shared by routing-on-submit and
// backfill-on-subscribe so the two never disagree.
async function matchByCityOrState(Model, base, city, state, select) {
  const find = (extra) => Model.find({ ...base, ...extra }).select(select).lean();
  const byCity = city ? await find({ city: exactly(city) }) : [];
  return byCity.length || !state ? byCity : find({ state: exactly(state) });
}

// Routes a freshly submitted callback request straight into the matching
// contractor(s)' own portal lead list.
export async function routeContractorLeadToProviders({
  contractorLeadId,
  name,
  phone,
  city,
  state,
  serviceType,
  requirement,
}) {
  const providers = await matchByCityOrState(
    User,
    { accountType: "service-provider", status: "Active", serviceType },
    city,
    state,
    "accountId city",
  );

  await Promise.all(
    providers.map((provider, i) =>
      Lead.create({
        id: `LD-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
        name,
        phone,
        address: [city, state].filter(Boolean).join(", "),
        interest: `${getServiceTypeLabel(serviceType)} request`,
        requirement,
        ownerId: provider.accountId,
        source: "Service Request",
        contractorLeadId,
      }),
    ),
  );
}

// Called right after a service provider's lead plan goes active — backfills
// any past callback requests in their own city/state (same trade) that
// arrived before they were a paying subscriber, so leads appear immediately.
export async function backfillLeadsForProvider({ accountId, city, state, serviceType }) {
  const matches = await matchByCityOrState(
    ContractorLead,
    { serviceType },
    city,
    state,
    "id name phone city state requirement",
  );
  if (matches.length === 0) return 0;

  const already = await Lead.find({
    ownerId: accountId,
    contractorLeadId: { $in: matches.map((m) => m.id) },
  })
    .select("contractorLeadId")
    .lean();
  const ownedIds = new Set(already.map((l) => l.contractorLeadId));
  const toCreate = matches.filter((m) => !ownedIds.has(m.id));

  await Promise.all(
    toCreate.map((m, i) =>
      Lead.create({
        id: `LD-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
        name: m.name,
        phone: m.phone,
        address: [m.city, m.state].filter(Boolean).join(", "),
        interest: `${getServiceTypeLabel(serviceType)} request`,
        requirement: m.requirement,
        ownerId: accountId,
        source: "Service Request",
        contractorLeadId: m.id,
      }),
    ),
  );
  return toCreate.length;
}
