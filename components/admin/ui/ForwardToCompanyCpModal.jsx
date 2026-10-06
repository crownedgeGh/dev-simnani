"use client";

import { useEffect, useState } from "react";
import AdminDialog from "./AdminDialog";
import StateCitySearchFields from "@/components/shared/StateCitySearchFields";

export default function ForwardToCompanyCpModal({ isOpen, onClose, onConfirm, isLoading = false, propertyTitle = "" }) {
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [location, setLocation] = useState({ state: "", city: "" });

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset selection for the newly opened row
    setAccountId("");
    setLocation({ state: "", city: "" });
    setLoadingPartners(true);
    fetch("/api/cp-network?cpType=company")
      .then((res) => res.json())
      .then((json) => setPartners(json.success ? json.data : []))
      .catch(() => setPartners([]))
      .finally(() => setLoadingPartners(false));
  }, [isOpen]);

  function formatLabel(p) {
    const place = [p.city, p.state].filter(Boolean).join(", ");
    return place ? `${p.name} — ${place}` : p.name;
  }

  const hasLocation = !!(location.state && location.city);
  const matchingPartners = hasLocation
    ? partners.filter(
        (p) =>
          p.state?.trim().toLowerCase() === location.state.trim().toLowerCase() &&
          p.city?.trim().toLowerCase() === location.city.trim().toLowerCase()
      )
    : [];

  function handleLocationChange(next) {
    setLocation(next);
    setAccountId("");
  }

  const canConfirm = accountId && !isLoading;

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Forward to Company CP"
      description={`Hand "${propertyTitle}" down to a registered Company CP.`}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-9 rounded-xl border border-[#e8e0d5] px-4 text-sm text-[#6b7280] transition hover:bg-[#faf8f5] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(accountId)}
            disabled={!canConfirm}
            className="h-9 rounded-xl bg-[#f0b429] px-4 text-sm font-medium text-white transition hover:bg-[#d97706] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Forwarding…" : "Forward"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <StateCitySearchFields state={location.state} city={location.city} onChange={handleLocationChange} />

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[#6b7280]">Company CP</span>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            disabled={!hasLocation || loadingPartners || matchingPartners.length === 0}
            className="h-11 rounded-xl border border-[#e8e0d5] bg-white px-3 text-sm text-[#374151] outline-none transition focus:border-[#f0b429] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              {!hasLocation
                ? "Select state and city first"
                : loadingPartners
                  ? "Loading…"
                  : matchingPartners.length === 0
                    ? "No Company CP registered in this location"
                    : "Select Company CP…"}
            </option>
            {matchingPartners.map((p) => (
              <option key={p.accountId} value={p.accountId}>
                {formatLabel(p)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </AdminDialog>
  );
}
