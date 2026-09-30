"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MdOpenInNew } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";
import UserDetailDialog from "@/components/admin/users/UserDetailDialog";

export default function AdminInterestedPage() {
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailAccountId, setDetailAccountId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/interested", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setClicks(json.data || []);
      } else {
        toast.error("Failed to load: " + (json.error || "Unknown error"));
      }
    } catch {
      toast.error("Network error loading interested clicks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const COLUMNS = [
    {
      key: "name",
      label: "User",
      primary: true,
      sortable: true,
      render: (v, row) => (
        <div
          role={row.buyerId ? "button" : undefined}
          tabIndex={row.buyerId ? 0 : undefined}
          onClick={(e) => {
            e.stopPropagation();
            if (row.buyerId) setDetailAccountId(row.buyerId);
          }}
          onKeyDown={(e) => {
            if (row.buyerId && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              setDetailAccountId(row.buyerId);
            }
          }}
          className={`text-left ${row.buyerId ? "cursor-pointer" : "cursor-default"}`}
        >
          <p className={`text-sm font-medium ${row.buyerId ? "text-[#d97706] hover:underline" : "text-[#1a1a2e]"}`}>
            {v}
          </p>
          <AdminPhoneCell value={row.phone} className="text-xs text-[#9ca3af]" />
        </div>
      ),
    },
    {
      key: "propertyTitle",
      label: "Property",
      sortable: true,
      render: (v, row) => (
        <Link
          href={`/property/${row.propertyId}`}
          target="_blank"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-sm font-medium text-[#d97706] hover:underline max-w-[220px]"
        >
          <span className="line-clamp-1">{v}</span>
          <MdOpenInNew size={13} className="shrink-0" />
        </Link>
      ),
    },
    {
      key: "propertyPrice",
      label: "Price",
      sortable: true,
      render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span>,
    },
    {
      key: "propertyLocation",
      label: "Location",
      sortable: true,
      render: (v) => <span className="text-xs text-[#374151]">{v || "—"}</span>,
    },
    {
      key: "propertyType",
      label: "Type",
      sortable: true,
      render: (v) => <span className="text-xs capitalize text-[#374151]">{v || "—"}</span>,
    },
    { key: "date", label: "Clicked On", sortable: true },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Interested"
        description={`Users who clicked "I'm Interested" on a property`}
        badge={`${clicks.length} total`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <AdminTable
        columns={COLUMNS}
        data={clicks}
        loading={loading}
        emptyMessage="No interested clicks yet"
        pageSize={15}
        searchKeys={["name", "phone", "propertyTitle", "propertyLocation", "propertyType"]}
      />

      <UserDetailDialog
        isOpen={!!detailAccountId}
        onClose={() => setDetailAccountId(null)}
        accountId={detailAccountId}
      />
    </div>
  );
}
