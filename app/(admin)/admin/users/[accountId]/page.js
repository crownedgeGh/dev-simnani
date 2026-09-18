"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MdArrowBack, MdEdit } from "react-icons/md";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import UserEditDialog from "@/components/admin/users/UserEditDialog";
import UserPortalSnapshot from "@/components/admin/users/UserPortalSnapshot";
import adminAxios from "@/lib/adminAxios";
import { ADMIN_KEYS, readCollection } from "@/lib/adminStorage";
import { PROPERTY_CATEGORIES } from "@/lib/propertyCategories";
import { toast } from "sonner";

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
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!accountId) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/users/${accountId}`, { cache: "no-store" });
        const json = await res.json();
        if (active && json.success && json.data) {
          setUser(json.data);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch user from API:", err);
      }
      if (active) {
        const users = readCollection(ADMIN_KEYS.users) || [];
        setUser(users.find((u) => u.accountId === accountId) || null);
      }
    })();
    return () => {
      active = false;
    };
  }, [accountId]);

  const handleEdit = async (updated) => {
    try {
      const res = await fetch(`/api/users/${updated.accountId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setUser(json.data);
        toast.success("User updated successfully");
        return;
      }
    } catch {
      // Fallback
    }
    const res = await adminAxios.put(`/admin/users/${updated.accountId}`, { ...updated, id: updated.accountId });
    const found = res.data.data.find((u) => u.accountId === accountId);
    setUser(found);
    toast.success("User updated successfully");
  };

  if (!user) return (
    <div className="flex flex-col items-center gap-3 py-20">
      <p className="text-[#9ca3af]">User not found</p>
      <button onClick={() => router.push("/admin/users")} className="text-sm text-[#f0b429] hover:underline">← Back to Users</button>
    </div>
  );

  const fields = [
    ["Account ID", user.accountId],
    ["Full Name", user.fullName],
    ["Mobile", user.mobile],
    ["Email", user.email],
    ["City", user.city],
    ["State", user.state || "—"],
    ["District", user.district || "—"],
    ["CP Type", user.cpType || "—"],
    ["Registered Date", user.registeredDate],
  ];

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
            <button onClick={() => setEditOpen(true)} className="flex items-center gap-1.5 h-9 rounded-xl border border-[#e8e0d5] px-3 text-sm text-[#374151] hover:bg-[#faf8f5]">
              <MdEdit size={16} /> Edit
            </button>
          </div>

          <table className="w-full text-sm">
            <tbody className="divide-y divide-[#f0ebe3]">
              {fields.map(([k, v]) => (
                <tr key={k}>
                  <td className="py-2.5 text-[#9ca3af] w-36 pr-4 align-top">{k}</td>
                  <td className="py-2.5 text-[#374151] font-medium break-words">{v || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <UserPortalSnapshot accountId={user.accountId} />
      </div>

      <UserEditDialog isOpen={editOpen} onClose={() => setEditOpen(false)} user={user} onSave={handleEdit} />
    </div>
  );
}
