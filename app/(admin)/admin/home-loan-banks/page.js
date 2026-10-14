"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdAccountBalance,
  MdPercent,
  MdStar,
  MdVisibilityOff,
  MdCloudUpload,
} from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminKpiCard from "@/components/admin/ui/AdminKpiCard";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminFormField, { adminInputClass } from "@/components/admin/ui/AdminFormField";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";
import { uploadFileToR2 } from "@/lib/uploadToR2";

const EMPTY_FORM = {
  name: "",
  logo: "",
  rate: "",
  fee: "",
  tenureMin: "",
  tenureMax: "",
  featured: false,
  knowMoreHref: "",
  isActive: true,
  order: "0",
};

export default function AdminHomeLoanBanksPage() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editing, setEditing] = useState(null); // bank row being edited, or "new"
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/home-loan-banks", { cache: "no-store" });
      const json = await res.json();
      if (json.success) setBanks(json.data);
    } catch (err) {
      console.error("Failed to fetch bank deals:", err);
      toast.error("Failed to load bank deals");
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      if (active) {
        await load();
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const kpis = useMemo(() => {
    const active = banks.filter((b) => b.isActive).length;
    const featured = banks.filter((b) => b.featured).length;
    const avgRate = banks.length
      ? (banks.reduce((sum, b) => sum + (b.rate || 0), 0) / banks.length).toFixed(2)
      : "0.00";
    return { total: banks.length, active, featured, avgRate };
  }, [banks]);

  function openNew() {
    setEditing("new");
    setForm(EMPTY_FORM);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      name: row.name,
      logo: row.logo,
      rate: String(row.rate),
      fee: String(row.fee),
      tenureMin: String(row.tenureMin),
      tenureMax: String(row.tenureMax),
      featured: !!row.featured,
      knowMoreHref: row.knowMoreHref || "",
      isActive: row.isActive !== false,
      order: String(row.order ?? 0),
    });
  }

  function closeDialog() {
    setEditing(null);
  }

  async function handleLogoFile(file) {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const publicUrl = await uploadFileToR2(file, "bank-logos");
      setForm((f) => ({ ...f, logo: publicUrl }));
    } catch (err) {
      toast.error(err.message || "Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function save() {
    if (!form.name.trim() || !form.logo.trim() || form.rate === "" || form.fee === "") {
      toast.error("Name, logo, rate and processing fee are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        logo: form.logo.trim(),
        rate: Number(form.rate),
        fee: Number(form.fee),
        tenureMin: Number(form.tenureMin || 0),
        tenureMax: Number(form.tenureMax || 30),
        featured: form.featured,
        knowMoreHref: form.knowMoreHref.trim(),
        isActive: form.isActive,
        order: Number(form.order || 0),
      };

      const res = await fetch(
        editing === "new" ? "/api/home-loan-banks" : `/api/home-loan-banks/${editing._id}`,
        {
          method: editing === "new" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save bank");

      toast.success(editing === "new" ? "Bank added" : "Bank updated");
      await load();
      closeDialog();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/home-loan-banks/${deleting._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete bank");
      toast.success(`"${deleting.name}" deleted`);
      setDeleting(null);
      await load();
    } catch (err) {
      toast.error(err.message || "Failed to delete bank");
    } finally {
      setDeleteLoading(false);
    }
  }

  const COLUMNS = [
    {
      key: "name",
      label: "Bank",
      sortable: true,
      primary: true,
      render: (val, row) => (
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={row.logo} alt="" className="h-7 w-7 shrink-0 object-contain" />
          <p className="font-medium text-[#1a1a2e] text-sm">{val}</p>
          {row.featured && (
            <span className="flex items-center gap-1 rounded-full bg-[#fff8e1] px-2 py-0.5 text-[10px] font-semibold text-[#d97706] border border-[#f0b429]/30">
              <MdStar size={11} /> Featured
            </span>
          )}
          {!row.isActive && (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 border border-gray-200">
              <MdVisibilityOff size={11} /> Hidden
            </span>
          )}
        </div>
      ),
    },
    {
      key: "rate",
      label: "Rate",
      sortable: true,
      render: (val) => <span className="text-sm text-[#374151]">{val}%</span>,
    },
    {
      key: "fee",
      label: "Processing Fee",
      sortable: true,
      render: (val) => <span className="text-sm text-[#374151]">₹{Number(val).toLocaleString("en-IN")}</span>,
    },
    {
      key: "tenure",
      label: "Tenure",
      render: (_v, row) => <span className="text-sm text-[#374151]">{row.tenureMin}-{row.tenureMax} yrs</span>,
    },
    {
      key: "actions",
      label: "",
      type: "actions",
      searchable: false,
      actions: (row) => [
        { label: "Edit", icon: MdEdit, onClick: () => openEdit(row) },
        { label: "Delete", icon: MdDelete, variant: "danger", onClick: () => setDeleting(row) },
      ],
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Home Loan Banks"
        description="Manage the bank deals shown on the public /home-loan page — rates, fees and tenure need regular upkeep."
        badge={`${banks.length} banks`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        actions={
          <button
            onClick={openNew}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-[#f0b429] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#d97706]"
          >
            <MdAdd size={16} /> Add Bank
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpiCard title="Total Banks" value={kpis.total} icon={MdAccountBalance} color="gold" />
        <AdminKpiCard title="Live on Site" value={kpis.active} icon={MdAccountBalance} color="green" />
        <AdminKpiCard title="Featured" value={kpis.featured} icon={MdStar} color="blue" />
        <AdminKpiCard title="Avg. Rate" value={`${kpis.avgRate}%`} icon={MdPercent} color="purple" />
      </div>

      <AdminTable
        columns={COLUMNS}
        data={banks}
        loading={loading}
        emptyMessage="No banks yet"
        pageSize={10}
      />

      <AdminDialog
        isOpen={!!editing}
        onClose={closeDialog}
        title={editing === "new" ? "Add Bank" : `Edit "${editing?.name}"`}
        description="Changes reflect immediately on the public home loan page."
        size="lg"
        footer={
          <>
            <button
              onClick={closeDialog}
              disabled={saving}
              className="h-9 rounded-xl border border-[#e8e0d5] px-4 text-sm text-[#6b7280] transition hover:bg-[#faf8f5] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="h-9 rounded-xl bg-[#f0b429] px-4 text-sm font-medium text-white transition hover:bg-[#d97706] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminFormField label="Bank Name" required>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. HDFC"
              className={adminInputClass}
            />
          </AdminFormField>

          <AdminFormField label="Logo" required hint="Upload a JPG/PNG/WebP, or paste a logo URL (e.g. an SVG path)">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e8e0d5] bg-[#faf8f5]">
                {form.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.logo} alt="" className="h-full w-full object-contain" />
                ) : (
                  <MdAccountBalance className="text-[#9ca3af]" size={20} />
                )}
              </div>
              <label
                htmlFor="bank-logo-file"
                className="flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-[#e8e0d5] bg-white px-3 text-xs font-semibold text-[#374151] transition hover:bg-[#faf8f5]"
              >
                <MdCloudUpload size={16} className={uploadingLogo ? "animate-pulse" : ""} />
                {uploadingLogo ? "Uploading…" : "Upload Logo"}
              </label>
              <input
                id="bank-logo-file"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                disabled={uploadingLogo}
                onChange={(e) => {
                  handleLogoFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
            <input
              value={form.logo}
              onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))}
              placeholder="/bank-logos/hdfc-bank-in-logo.png"
              className={`${adminInputClass} mt-2`}
            />
          </AdminFormField>

          <AdminFormField label="Rate of Interest (%)" required>
            <input
              type="number"
              step="0.01"
              value={form.rate}
              onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
              placeholder="7.55"
              className={adminInputClass}
            />
          </AdminFormField>

          <AdminFormField label="Processing Fee (₹)" required>
            <input
              type="number"
              value={form.fee}
              onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))}
              placeholder="10000"
              className={adminInputClass}
            />
          </AdminFormField>

          <AdminFormField label="Tenure — Min (years)">
            <input
              type="number"
              value={form.tenureMin}
              onChange={(e) => setForm((f) => ({ ...f, tenureMin: e.target.value }))}
              placeholder="3"
              className={adminInputClass}
            />
          </AdminFormField>

          <AdminFormField label="Tenure — Max (years)">
            <input
              type="number"
              value={form.tenureMax}
              onChange={(e) => setForm((f) => ({ ...f, tenureMax: e.target.value }))}
              placeholder="30"
              className={adminInputClass}
            />
          </AdminFormField>

          <AdminFormField label="Know More link" hint="Optional — shown under the CTA for featured banks">
            <input
              value={form.knowMoreHref}
              onChange={(e) => setForm((f) => ({ ...f, knowMoreHref: e.target.value }))}
              placeholder="/home-loan#hdfc"
              className={adminInputClass}
            />
          </AdminFormField>

          <AdminFormField label="Display Order" hint="Lower shows first">
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
              className={adminInputClass}
            />
          </AdminFormField>

          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              id="bank-featured"
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              className="h-4 w-4 accent-[#f0b429]"
            />
            <label htmlFor="bank-featured" className="text-sm text-[#374151]">
              Featured (shows a badge + Know More link)
            </label>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              id="bank-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 accent-[#f0b429]"
            />
            <label htmlFor="bank-active" className="text-sm text-[#374151]">
              Live on the public site
            </label>
          </div>
        </div>
      </AdminDialog>

      <AdminConfirmModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete Bank"
        message={`Delete "${deleting?.name}" from the home loan deals list? This can't be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
}
