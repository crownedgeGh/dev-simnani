"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdArrowBack, MdStar, MdStarBorder } from "react-icons/md";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";
import FeaturedLocationModal from "@/components/admin/ui/FeaturedLocationModal";
import UserPortalSnapshot from "@/components/admin/users/UserPortalSnapshot";
import { ADMIN_KEYS, readCollection } from "@/lib/adminStorage";
import { PROPERTY_CATEGORIES } from "@/lib/propertyCategories";

const MAX_FEATURED_POSITIONS = 10;

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

export default function UserDetailPage() {
  const { accountId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [featuredModalOpen, setFeaturedModalOpen] = useState(false);
  const [featuredSaving, setFeaturedSaving] = useState(false);
  const [pendingPosition, setPendingPosition] = useState(null);

  useEffect(() => {
    if (!accountId) return;
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/users/${accountId}`, { cache: "no-store" });
        const json = await res.json();
        if (active && json.success && json.data) {
          setUser(json.data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch user from API:", err);
      }
      if (active) {
        const users = readCollection(ADMIN_KEYS.users) || [];
        setUser(users.find((u) => u.accountId === accountId) || null);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [accountId]);

  if (loading) return (
    <div className="flex flex-col items-center gap-3 py-20">
      <p className="text-[#9ca3af]">Loading…</p>
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center gap-3 py-20">
      <p className="text-[#9ca3af]">User not found</p>
      <button onClick={() => router.push("/admin/users")} className="text-sm text-[#f0b429] hover:underline">← Back to Users</button>
    </div>
  );

  async function handleUnfeature() {
    setFeaturedSaving(true);
    try {
      const res = await fetch(`/api/users/${user.accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeaturedBroker: false, featuredPosition: null }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update");
      setUser((prev) => ({ ...prev, isFeaturedBroker: false, featuredPosition: null }));
      toast.success(`${user.fullName} removed from featured brokers`);
    } catch (err) {
      toast.error(err.message || "Failed to update featured status");
    } finally {
      setFeaturedSaving(false);
    }
  }

  async function handleFeatureClick() {
    try {
      const res = await fetch("/api/admin/brokers/featured", { cache: "no-store" });
      const json = await res.json();
      const taken = new Set(
        (json.data || [])
          .filter((b) => b.isFeaturedBroker && b.featuredPosition && b.accountId !== user.accountId)
          .map((b) => b.featuredPosition)
      );
      const freePosition = Array.from({ length: MAX_FEATURED_POSITIONS }, (_, i) => i + 1).find(
        (p) => !taken.has(p)
      );
      if (!freePosition) {
        toast.error("All 10 featured slots are taken — free one up first");
        return;
      }
      setPendingPosition(freePosition);
      setFeaturedModalOpen(true);
    } catch {
      toast.error("Failed to check featured slots");
    }
  }

  async function handleFeaturedLocationConfirm({ state, city }) {
    setFeaturedSaving(true);
    try {
      const position = pendingPosition || user.featuredPosition;
      const res = await fetch(`/api/users/${user.accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeaturedBroker: true, featuredPosition: position, state, city }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update");
      setUser((prev) => ({ ...prev, isFeaturedBroker: true, featuredPosition: position, state, city }));
      toast.success(`${user.fullName} is now featured at position ${position}`);
      setFeaturedModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to update featured status");
    } finally {
      setFeaturedSaving(false);
    }
  }

  const fields = [
    ["Account ID", user.accountId],
    ["Full Name", user.fullName],
    ["Mobile", user.mobile, "phone"],
    ["Email", user.email],
    ["City", user.city],
    ["State", user.state || "—"],
    ["Registered Date", user.registeredDate],
  ];

  if (user.accountType === "broker") {
    fields.push(
      ["Deals Closed", user.dealsClosed !== undefined ? String(user.dealsClosed) : "0"],
      ["RERA Registered", user.reraRegistered ? "Yes" : "No"],
      ["RERA Number", user.reraNumber || "—"],
      ["Applicant Type", user.applicantType || "—"],
      ["Experience", user.experience || "—"]
    );
  }

  if (user.accountType === "freelancer") {
    fields.push(
      ["Coverage Areas", user.coverageAreas || "—"],
      ["Currently Working Elsewhere", user.currentlyWorking || "—"]
    );
  }

  if (user.accountType === "investor") {
    fields.push(
      ["Property Types", propertyTypeLabels(user.propertyTypes) || "—"],
      ["Budget Range", INVESTOR_BUDGET_LABELS[user.budget] || user.budget || "—"],
      ["Expected Profit", user.expectedProfit ? `${user.expectedProfit}%` : "—"],
      ["Preferred City", user.preferredCity || "—"]
    );
  }

  return (
    <div>
      <button onClick={() => router.push("/admin/users")} className="mb-4 flex items-center gap-1.5 text-sm text-[#9ca3af] hover:text-[#1a1a2e]">
        <MdArrowBack size={16} /> Back to Users
      </button>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,380px)_1fr] xl:items-start">
        <div className="rounded-2xl border border-[#e8e0d5] bg-white p-6">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff8e1] text-2xl font-bold text-[#d97706] mb-3">
                {user.fullName?.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-xl font-bold text-[#1a1a2e]">{user.fullName}</h1>
              <div className="flex gap-2 mt-2">
                <AdminStatusBadge status={user.accountType} />
                <AdminStatusBadge status={user.status} />
              </div>
            </div>

            {user.accountType === "broker" && (
              <button
                onClick={user.isFeaturedBroker ? handleUnfeature : handleFeatureClick}
                disabled={featuredSaving}
                className={`flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  user.isFeaturedBroker
                    ? "border-[#f0b429] bg-[#fff8e1] text-[#d97706] hover:bg-[#fff2cc]"
                    : "border-[#e8e0d5] text-[#6b7280] hover:border-[#f0b429] hover:text-[#d97706]"
                }`}
              >
                {user.isFeaturedBroker ? <MdStar size={16} /> : <MdStarBorder size={16} />}
                {user.isFeaturedBroker
                  ? `Featured (#${user.featuredPosition ?? "—"})`
                  : "Feature on Homepage"}
              </button>
            )}
          </div>

          <table className="w-full text-sm">
            <tbody className="divide-y divide-[#f0ebe3]">
              {fields.map(([k, v, type]) => (
                <tr key={k}>
                  <td className="py-2.5 text-[#9ca3af] w-36 pr-4 align-top">{k}</td>
                  <td className="py-2.5 text-[#374151] font-medium break-words">
                    {type === "phone" ? <AdminPhoneCell value={v} /> : v || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Dedicated Skills & Expertise Section */}
          {(user.accountType === "freelancer" || (Array.isArray(user.skills) && user.skills.length > 0)) && (
            <div className="mt-6 border-t border-[#f0ebe3] pt-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                  Skills &amp; Expertise
                </span>
                <span className="rounded-full bg-[#fff8e1] px-2 py-0.5 text-xs font-bold text-[#d97706] border border-[#f0b429]/30">
                  {user.skills?.length || 0} {(user.skills?.length || 0) === 1 ? "skill" : "skills"}
                </span>
              </div>

              {Array.isArray(user.skills) && user.skills.length > 0 ? (
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
              ) : (
                <p className="text-xs text-[#9ca3af] italic">No skills registered yet.</p>
              )}
            </div>
          )}
        </div>

        <UserPortalSnapshot accountId={user.accountId} />
      </div>

      <FeaturedLocationModal
        isOpen={featuredModalOpen}
        onClose={() => setFeaturedModalOpen(false)}
        onConfirm={handleFeaturedLocationConfirm}
        isLoading={featuredSaving}
        title="Feature this broker"
        description="Choose the state and city this broker should be featured for."
        initialState={user.state}
        initialCity={user.city}
      />
    </div>
  );
}
