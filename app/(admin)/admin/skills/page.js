"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { MdAdd, MdDelete, MdEdit, MdClose, MdWorkspacePremium, MdCategory, MdAutoAwesome } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminKpiCard from "@/components/admin/ui/AdminKpiCard";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminFormField, { adminInputClass } from "@/components/admin/ui/AdminFormField";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";

export default function AdminSkillsPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editing, setEditing] = useState(null); // category being edited, or "new"
  const [nameInput, setNameInput] = useState("");
  const [subInput, setSubInput] = useState("");
  const [pendingSubs, setPendingSubs] = useState([]);
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/skills", { cache: "no-store" });
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (err) {
      console.error("Failed to fetch skill categories:", err);
      toast.error("Failed to load skill categories");
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
    const totalSubs = categories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0);
    const customCount = categories.filter((c) => c.isCustom).length;
    return { total: categories.length, totalSubs, customCount };
  }, [categories]);

  function openNew() {
    setEditing("new");
    setNameInput("");
    setPendingSubs([]);
    setSubInput("");
  }

  function openEdit(row) {
    setEditing(row);
    setNameInput(row.name);
    setPendingSubs([...(row.subcategories || [])]);
    setSubInput("");
  }

  function closeDialog() {
    setEditing(null);
  }

  function addPendingSub() {
    const val = subInput.trim();
    if (!val) return;
    if (pendingSubs.some((s) => s.toLowerCase() === val.toLowerCase())) {
      toast.error("That skill is already in the list");
      return;
    }
    setPendingSubs((prev) => [...prev, val]);
    setSubInput("");
  }

  function removePendingSub(val) {
    setPendingSubs((prev) => prev.filter((s) => s !== val));
  }

  async function save() {
    const name = nameInput.trim();
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    setSaving(true);
    try {
      if (editing === "new") {
        const res = await fetch("/api/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "category", name }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to add category");

        if (pendingSubs.length) {
          const patchRes = await fetch(`/api/skills/${json.data._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subcategories: pendingSubs }),
          });
          const patchJson = await patchRes.json();
          if (!patchJson.success) throw new Error(patchJson.error || "Failed to save skills");
        }
        toast.success("Skill category added");
      } else {
        const res = await fetch(`/api/skills/${editing._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, subcategories: pendingSubs }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to update category");
        toast.success("Skill category updated");
      }
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
      const res = await fetch(`/api/skills/${deleting._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete category");
      toast.success(`"${deleting.name}" deleted`);
      setDeleting(null);
      await load();
    } catch (err) {
      toast.error(err.message || "Failed to delete category");
    } finally {
      setDeleteLoading(false);
    }
  }

  const COLUMNS = [
    {
      key: "name",
      label: "Category",
      sortable: true,
      primary: true,
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <p className="font-medium text-[#1a1a2e] text-sm">{val}</p>
          {row.isCustom && (
            <span
              title="Added via 'Add your own'"
              className="flex items-center gap-1 rounded-full bg-[#fff8e1] px-2 py-0.5 text-[10px] font-semibold text-[#d97706] border border-[#f0b429]/30"
            >
              <MdAutoAwesome size={11} /> Custom
            </span>
          )}
        </div>
      ),
    },
    {
      key: "subcategories",
      label: "Skills",
      render: (val) => (
        <div className="flex max-w-md flex-wrap gap-1">
          {val?.length ? (
            val.slice(0, 6).map((s) => (
              <span key={s} className="rounded-lg bg-[#faf8f5] border border-[#e8e0d5] px-2 py-0.5 text-[11px] text-[#374151]">
                {s}
              </span>
            ))
          ) : (
            <span className="text-xs text-[#9ca3af]">No skills yet</span>
          )}
          {val?.length > 6 && (
            <span className="text-[11px] text-[#9ca3af]">+{val.length - 6} more</span>
          )}
        </div>
      ),
    },
    {
      key: "count",
      label: "# Skills",
      sortable: true,
      render: (_v, row) => <span className="text-sm text-[#374151]">{row.subcategories?.length || 0}</span>,
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

  const tableData = categories.map((c) => ({ ...c, count: c.subcategories?.length || 0 }));

  return (
    <div>
      <AdminPageHeader
        title="Skills"
        description="Manage the skill categories and skills freelancers can choose from during registration"
        badge={`${categories.length} categories`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        actions={
          <button
            onClick={openNew}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-[#f0b429] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#d97706]"
          >
            <MdAdd size={16} /> Add Category
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminKpiCard title="Skill Categories" value={kpis.total} icon={MdCategory} color="gold" />
        <AdminKpiCard title="Total Skills" value={kpis.totalSubs} icon={MdWorkspacePremium} color="blue" />
        <AdminKpiCard title="Added by Freelancers" value={kpis.customCount} icon={MdAutoAwesome} color="green" />
      </div>

      <AdminTable
        columns={COLUMNS}
        data={tableData}
        loading={loading}
        emptyMessage="No skill categories yet"
        pageSize={10}
      />

      <AdminDialog
        isOpen={!!editing}
        onClose={closeDialog}
        title={editing === "new" ? "Add Skill Category" : `Edit "${editing?.name}"`}
        description="World-facing skill category with its subcategory skills."
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
        <div className="flex flex-col gap-4">
          <AdminFormField label="Category Name" required>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. IT & Software Development"
              className={adminInputClass}
            />
          </AdminFormField>

          <AdminFormField label="Skills (subcategories)" hint="Press Add or Enter to add each skill.">
            <div className="flex items-center gap-2">
              <input
                value={subInput}
                onChange={(e) => setSubInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPendingSub();
                  }
                }}
                placeholder="e.g. Web Development"
                className={adminInputClass}
              />
              <button
                type="button"
                onClick={addPendingSub}
                className="flex h-11 shrink-0 items-center gap-1 rounded-xl bg-[#1a1a2e] px-3 text-xs font-semibold text-white transition hover:bg-[#2d334d]"
              >
                <MdAdd size={16} /> Add
              </button>
            </div>
          </AdminFormField>

          <div className="flex flex-wrap gap-2">
            {pendingSubs.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1.5 rounded-lg border border-[#e8e0d5] bg-[#faf8f5] px-2.5 py-1 text-xs text-[#374151]"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removePendingSub(s)}
                  aria-label={`Remove ${s}`}
                  className="text-[#9ca3af] transition hover:text-red-500"
                >
                  <MdClose size={13} />
                </button>
              </span>
            ))}
            {!pendingSubs.length && <p className="text-xs text-[#9ca3af]">No skills added yet.</p>}
          </div>
        </div>
      </AdminDialog>

      <AdminConfirmModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete Skill Category"
        message={`Delete "${deleting?.name}" and all its skills? Freelancers who already selected it will keep their existing entries, but it will no longer appear as an option.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
}
