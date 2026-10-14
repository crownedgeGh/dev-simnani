"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdAdd, MdCheckCircle, MdDelete, MdEdit, MdGridView, MdOpenInNew, MdSell } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminKpiCard from "@/components/admin/ui/AdminKpiCard";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminFormField, { adminInputClass } from "@/components/admin/ui/AdminFormField";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";
import { formatINR } from "@/components/admin/plots/PlotEditDialog";
import { PLOT_STATUSES, PLOT_STATUS_META } from "@/lib/plotInventory";

const layoutHref = (project) => `/admin/tnc-rera/${encodeURIComponent(project)}`;

export default function PlotProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // { mode: "new" } or { mode: "rename", project }
  const [nameDialog, setNameDialog] = useState(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/plots/projects", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setProjects(json.data);
    } catch (err) {
      toast.error(err.message || "Failed to load projects");
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

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const kpis = useMemo(() => {
    const sum = (k) => projects.reduce((n, p) => n + (p[k] || 0), 0);
    return { plots: sum("total"), available: sum("available"), booked: sum("booked"), bookedValue: sum("bookedValue") };
  }, [projects]);

  function openNameDialog(state) {
    setName(state.project || "");
    setNameDialog(state);
  }

  async function submitName() {
    const n = name.trim().replace(/\s+/g, " ");
    if (!n) return toast.error("Enter a project name");
    if (nameDialog.mode === "new") {
      // Projects exist through their plots — open the empty layout and add plots there.
      router.push(layoutHref(n));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/plots/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: nameDialog.project, to: n }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Project renamed");
      setNameDialog(null);
      await load();
    } catch (err) {
      toast.error(err.message || "Rename failed");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setSaving(true);
    try {
      const res = await fetch("/api/plots/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: deleting.project }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success(`"${deleting.project}" deleted (${json.deleted} plots)`);
      setDeleting(null);
      await load();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  const COLUMNS = [
    {
      key: "project",
      label: "Project",
      sortable: true,
      primary: true,
      render: (val, row) => (
        <div>
          <p className="text-sm font-semibold text-[#1a1a2e]">{val}</p>
          <p className="text-[11px] text-[#9ca3af]">
            Blocks {row.blocks.join(", ") || "—"}
            {row.reraRegNo && ` · RERA ${row.reraRegNo}`}
          </p>
        </div>
      ),
    },
    {
      key: "total",
      label: "Plots",
      sortable: true,
      render: (val) => <span className="text-sm font-semibold text-[#374151]">{val}</span>,
    },
    {
      key: "status",
      label: "Status",
      searchable: false,
      render: (_v, row) => (
        <div className="min-w-48">
          <div className="flex h-2 overflow-hidden rounded-full bg-[#f3f4f6]">
            {PLOT_STATUSES.map((s) => (
              <span key={s} style={{ width: `${(row[s] / row.total) * 100}%`, background: PLOT_STATUS_META[s].bottom }} />
            ))}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#6b7280]">
            {PLOT_STATUSES.filter((s) => row[s]).map((s) => (
              <span key={s} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: PLOT_STATUS_META[s].bottom }} />
                {row[s]} {PLOT_STATUS_META[s].label}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "bookedValue",
      label: "Booked Value",
      sortable: true,
      render: (val, row) => (
        <div className="text-sm text-[#374151]">
          {val ? formatINR(val) : "—"}
          {row.totalValue > 0 && <p className="text-[11px] text-[#9ca3af]">of {formatINR(row.totalValue)}</p>}
        </div>
      ),
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      sortable: true,
      render: (val) => (
        <span className="text-xs text-[#6b7280]">{val ? new Date(val).toLocaleDateString("en-IN") : "—"}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      type: "actions",
      searchable: false,
      actions: (row) => [
        { label: "Open Layout", icon: MdOpenInNew, onClick: () => router.push(layoutHref(row.project)) },
        { label: "Rename", icon: MdEdit, onClick: () => openNameDialog({ mode: "rename", project: row.project }) },
        { label: "Delete", icon: MdDelete, variant: "danger", onClick: () => setDeleting(row) },
      ],
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="T&C RERA — Plot Projects"
        description="Each project has its own plot layout. Open a project to manage its plots."
        badge={`${projects.length} projects`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        actions={
          <button
            onClick={() => openNameDialog({ mode: "new" })}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-[#f0b429] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#d97706]"
          >
            <MdAdd size={16} /> New Project
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpiCard title="Projects" value={projects.length} icon={MdGridView} color="gold" />
        <AdminKpiCard title="Total Plots" value={kpis.plots} icon={MdGridView} color="blue" />
        <AdminKpiCard title="Available" value={kpis.available} icon={MdCheckCircle} color="orange" />
        <AdminKpiCard title="Booked" value={kpis.booked} subtitle={kpis.bookedValue ? formatINR(kpis.bookedValue) : undefined} icon={MdSell} color="green" />
      </div>

      <AdminTable
        columns={COLUMNS}
        data={projects}
        loading={loading}
        onRowClick={(row) => router.push(layoutHref(row.project))}
        emptyMessage="No projects yet — click New Project to create your first plot layout"
        pageSize={10}
      />

      <AdminDialog
        isOpen={!!nameDialog}
        onClose={() => setNameDialog(null)}
        title={nameDialog?.mode === "rename" ? `Rename "${nameDialog.project}"` : "New Project"}
        description={
          nameDialog?.mode === "rename"
            ? "All plots in this project move to the new name."
            : "You'll add plots on the next screen — paste plot numbers or generate a sequence."
        }
        footer={
          <>
            <button
              onClick={() => setNameDialog(null)}
              disabled={saving}
              className="h-9 rounded-xl border border-[#e8e0d5] px-4 text-sm text-[#6b7280] transition hover:bg-[#faf8f5] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={submitName}
              disabled={saving}
              className="h-9 rounded-xl bg-[#f0b429] px-4 text-sm font-medium text-white transition hover:bg-[#d97706] disabled:opacity-50"
            >
              {nameDialog?.mode === "rename" ? (saving ? "Saving…" : "Rename") : "Create & Open"}
            </button>
          </>
        }
      >
        <AdminFormField label="Project Name" required>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitName()}
            placeholder="e.g. Green Valley Phase 2"
            className={adminInputClass}
          />
        </AdminFormField>
      </AdminDialog>

      <AdminConfirmModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete project?"
        message={`Permanently delete "${deleting?.project}" and all ${deleting?.total} plots in it? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={saving}
      />
    </div>
  );
}
