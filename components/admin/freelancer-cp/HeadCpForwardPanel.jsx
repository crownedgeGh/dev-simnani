"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { MdSend } from "react-icons/md";
import AdminTable from "@/components/admin/ui/AdminTable";
import { adminSelectClass } from "@/components/admin/ui/AdminFormField";
import LocationLink from "@/components/common/LocationLink";

function formatCpLabel(cp) {
  const place = [cp.city, cp.state].filter(Boolean).join(", ");
  return place ? `${cp.name} — ${place}` : cp.name;
}

// Lets Head CP pick any posted property and forward it to a real, registered
// Company CP — the first leg of the Head -> Company -> Field/Digital chain.
// Everything here is DB-backed (Property, User, Assignment collections), so
// the forward is visible to the Company CP the moment they load their portal.
export default function HeadCpForwardPanel() {
  const [properties, setProperties] = useState([]);
  const [companyPartners, setCompanyPartners] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({});
  const [forwarding, setForwarding] = useState(null);

  const load = useCallback(async () => {
    try {
      const [propsRes, partnersRes, asgRes] = await Promise.all([
        fetch("/api/properties?status=Active"),
        fetch("/api/cp-network?cpType=company"),
        fetch("/api/assignments?level=head-to-company"),
      ]);
      const [propsJson, partnersJson, asgJson] = await Promise.all([
        propsRes.json(),
        partnersRes.json(),
        asgRes.json(),
      ]);
      setProperties(propsJson.success ? propsJson.data : []);
      setCompanyPartners(partnersJson.success ? partnersJson.data : []);
      setAssignments(asgJson.success ? asgJson.data : []);
    } catch {
      toast.error("Failed to load properties / Company CP network");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) load();
    });
    return () => { active = false; };
  }, [load]);

  const latestAssignmentByProperty = useMemo(() => {
    const map = {};
    assignments.forEach((a) => {
      if (!map[a.propertyId] || new Date(a.createdAt) > new Date(map[a.propertyId].createdAt)) {
        map[a.propertyId] = a;
      }
    });
    return map;
  }, [assignments]);

  async function handleForward(property) {
    const accountId = selected[property.id];
    if (!accountId) {
      toast.error("Select a Company CP first");
      return;
    }
    setForwarding(property.id);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.title,
          propertyImage: property.image,
          propertyLocation: property.location,
          level: "head-to-company",
          assignedToAccountId: accountId,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to forward");
      setAssignments((prev) => [json.data, ...prev]);
      toast.success(`Forwarded to ${formatCpLabel(json.data ? { name: json.data.assignedToName, city: json.data.assignedToCity, state: json.data.assignedToState } : {})}`);
    } catch (err) {
      toast.error(err.message || "Failed to forward property");
    } finally {
      setForwarding(null);
    }
  }

  const COLUMNS = [
    {
      key: "title",
      label: "Property",
      primary: true,
      sortable: true,
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-[#1a1a2e]">{v}</p>
          <p className="mt-0.5 text-xs text-[#9ca3af]">
            <LocationLink mapLocation={row.mapLocation} location={row.location} className="hover:text-[#f0b429]" />
          </p>
        </div>
      ),
    },
    { key: "type", label: "Type", render: (v) => <span className="text-xs uppercase text-[#6b7280]">{v}</span> },
    {
      key: "forwardedTo",
      label: "Forwarded To",
      searchable: false,
      render: (_, row) => {
        const a = latestAssignmentByProperty[row.id];
        if (!a) return <span className="text-xs text-[#9ca3af]">Not forwarded yet</span>;
        const place = [a.assignedToCity, a.assignedToState].filter(Boolean).join(", ");
        return (
          <span className="text-xs font-medium text-[#374151]">
            {a.assignedToName}
            {place && <span className="text-[#9ca3af]"> — {place}</span>}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "",
      searchable: false,
      render: (_, row) => (
        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          <select
            value={selected[row.id] || ""}
            onChange={(e) => setSelected((prev) => ({ ...prev, [row.id]: e.target.value }))}
            disabled={companyPartners.length === 0}
            className={`${adminSelectClass} h-8 w-44 text-xs disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <option value="">
              {companyPartners.length === 0 ? "No Company CP yet" : "Select Company CP…"}
            </option>
            {companyPartners.map((p) => (
              <option key={p.accountId} value={p.accountId}>
                {formatCpLabel(p)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handleForward(row)}
            disabled={forwarding === row.id || !selected[row.id]}
            className="flex h-8 items-center gap-1 rounded-lg bg-[#f0b429] px-2.5 text-xs font-medium text-white transition hover:bg-[#d97706] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdSend size={13} />
            {latestAssignmentByProperty[row.id] ? "Re-forward" : "Forward"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mb-8">
      <h3 className="mb-3 text-sm font-semibold text-[#1a1a2e]">Forward Properties to Company CP</h3>
      <p className="mb-3 text-xs text-[#9ca3af]">
        Pick any posted property and hand it down to a registered Company CP — this is the first step of the
        Head CP → Company CP → Field / Digital CP chain.
      </p>
      <AdminTable
        columns={COLUMNS}
        data={properties}
        loading={loading}
        emptyMessage="No properties posted yet"
        pageSize={10}
      />
    </div>
  );
}
