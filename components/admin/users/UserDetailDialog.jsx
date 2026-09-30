"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MdOpenInNew } from "react-icons/md";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";
import { PROPERTY_CATEGORIES } from "@/lib/propertyCategories";

const INVESTOR_BUDGET_LABELS = {
  "under-50l": "Under ₹50 Lakh",
  "50l-1cr": "₹50 Lakh - ₹1 Crore",
  "1-5cr": "₹1 Crore - ₹5 Crore",
  "5-10cr": "₹5 Crore - ₹10 Crore",
  "10cr-plus": "₹10 Crore+",
};

function propertyTypeLabels(values) {
  if (!Array.isArray(values) || values.length === 0) return "";
  return values
    .map((v) => PROPERTY_CATEGORIES.find((c) => c.value === v)?.label || v)
    .join(", ");
}

export default function UserDetailDialog({ isOpen, onClose, accountId }) {
  const [fetched, setFetched] = useState({ forId: null, data: null });

  useEffect(() => {
    if (!isOpen || !accountId) return;
    let active = true;
    (async () => {
      let data = null;
      try {
        const res = await fetch(`/api/users/${accountId}`, { cache: "no-store" });
        const json = await res.json();
        if (json.success) data = json.data;
      } catch {
        // fall through — data stays null, dialog shows "User not found"
      }
      if (active) setFetched({ forId: accountId, data });
    })();
    return () => {
      active = false;
    };
  }, [isOpen, accountId]);

  const loading = isOpen && fetched.forId !== accountId;
  const user = loading ? null : fetched.data;

  const fields = user
    ? [
        ["Account ID", user.accountId],
        ["Full Name", user.fullName],
        ["Mobile", user.mobile, "phone"],
        ["Email", user.email || "—"],
        ["City", user.city || "—"],
        ["State", user.state || "—"],
        ["Registered Date", user.registeredDate || "—"],
      ]
    : [];

  if (user?.accountType === "broker") {
    fields.push(
      ["Deals Closed", user.dealsClosed !== undefined ? String(user.dealsClosed) : "0"],
      ["RERA Registered", user.reraRegistered ? "Yes" : "No"],
      ["RERA Number", user.reraNumber || "—"],
      ["Applicant Type", user.applicantType || "—"],
      ["Experience", user.experience || "—"]
    );
  }

  if (user?.accountType === "freelancer") {
    fields.push(
      ["Coverage Areas", user.coverageAreas || "—"],
      ["Currently Working Elsewhere", user.currentlyWorking || "—"]
    );
  }

  if (user?.accountType === "investor") {
    fields.push(
      ["Property Types", propertyTypeLabels(user.propertyTypes) || "—"],
      ["Budget Range", INVESTOR_BUDGET_LABELS[user.budget] || user.budget || "—"],
      ["Expected Profit", user.expectedProfit ? `${user.expectedProfit}%` : "—"],
      ["Preferred City", user.preferredCity || "—"]
    );
  }

  return (
    <AdminDialog isOpen={isOpen} onClose={onClose} title="User Details" size="md">
      {loading ? (
        <div className="flex flex-col gap-3 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 rounded-lg bg-[#f0ebe3] animate-pulse" style={{ width: `${60 + (i * 10) % 30}%` }} />
          ))}
        </div>
      ) : !user ? (
        <p className="py-8 text-center text-sm text-[#9ca3af]">User not found</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#faf8f5] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff8e1] text-lg font-bold text-[#d97706]">
              {(user.fullName || "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#1a1a2e]">{user.fullName}</p>
              <AdminPhoneCell value={user.mobile} className="text-[#9ca3af]" />
            </div>
            <div className="ml-auto flex shrink-0 gap-1.5">
              <AdminStatusBadge status={user.accountType} />
              <AdminStatusBadge status={user.status} />
            </div>
          </div>

          <table className="w-full text-sm">
            <tbody className="divide-y divide-[#f0ebe3]">
              {fields.map(([k, v, type]) => (
                <tr key={k}>
                  <td className="py-2 text-[#9ca3af] w-40 pr-4 align-top">{k}</td>
                  <td className="py-2 text-[#374151] font-medium break-words">
                    {type === "phone" ? <AdminPhoneCell value={v} /> : v || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {Array.isArray(user.skills) && user.skills.length > 0 && (
            <div className="border-t border-[#f0ebe3] pt-4">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">
                Skills &amp; Expertise
              </p>
              <div className="flex flex-col gap-2.5">
                {Object.entries(
                  user.skills.reduce((acc, s) => {
                    const cat = s.category || "General";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(s.subcategory || s.name || "");
                    return acc;
                  }, {})
                ).map(([cat, skills]) => (
                  <div key={cat} className="rounded-xl border border-[#e8e0d5] bg-[#faf8f5] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#6b7280] mb-2">
                      {cat}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-[#1a1a2e] border border-[#e8e0d5] shadow-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href={`/admin/users/${user.accountId}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[#e8e0d5] py-2.5 text-sm font-medium text-[#d97706] transition hover:bg-[#fff8e1]"
          >
            View Full Profile <MdOpenInNew size={14} />
          </Link>
        </div>
      )}
    </AdminDialog>
  );
}
