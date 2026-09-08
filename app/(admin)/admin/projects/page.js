"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { MdAdd, MdEdit, MdDelete, MdPhotoLibrary } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";
import ProjectFormDialog from "@/components/admin/projects/ProjectFormDialog";
import ProjectAssetsDialog from "@/components/admin/projects/ProjectAssetsDialog";
import adminAxios from "@/lib/adminAxios";
import { ADMIN_KEYS, readCollection } from "@/lib/adminStorage";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [assetsTarget, setAssetsTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setProjects(readCollection(ADMIN_KEYS.projects) || []);
    setAssets(readCollection(ADMIN_KEYS.promotionAssets) || []);
  }, []);

  useEffect(() => { load(); setLoading(false); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 500));
    load();
    setRefreshing(false);
  };

  const handleCreate = async (form) => {
    const newProj = { ...form, id: `proj-${Date.now()}` };
    const res = await adminAxios.post("/admin/projects", newProj);
    setProjects(res.data.data);
  };

  const handleEdit = async (form) => {
    const res = await adminAxios.put(`/admin/projects/${form.id}`, form);
    setProjects(res.data.data);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await adminAxios.delete(`/admin/projects/${deleteTarget.id}`);
      setProjects(res.data.data);
      toast.success("Project deleted successfully");
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const PROJECT_STATUSES = ["Under Construction", "Ready to Move", "Ready to Register", "Possession 2026", "Possession 2027"];

  const COLUMNS = [
    {
      key: "image",
      label: "Image",
      width: "w-16",
      searchable: false,
      render: (val) => (
        <div className="h-10 w-14 overflow-hidden rounded-lg bg-[#f0ebe3]">
          {val ? <img src={val} alt="" className="h-full w-full object-cover" onError={(e) => { e.target.style.display="none"; }} /> : null}
        </div>
      ),
    },
    {
      key: "name",
      label: "Project Name",
      sortable: true,
      primary: true,
      render: (val, row) => (
        <div>
          <p className="font-medium text-[#1a1a2e] text-sm">{val}</p>
          <p className="text-xs text-[#9ca3af]">{row.location}</p>
        </div>
      ),
    },
    { key: "startingPrice", label: "Starting Price", sortable: true, render: (v) => <span className="text-sm font-semibold text-[#d97706]">{v}</span> },
    { key: "developer", label: "Developer", sortable: true },
    { key: "status", label: "Status", type: "status", sortable: true, filterOptions: PROJECT_STATUSES },
    {
      key: "actions",
      label: "",
      type: "actions",
      searchable: false,
      actions: (row) => [
        { label: "View Assets", icon: MdPhotoLibrary, onClick: () => setAssetsTarget(row) },
        { label: "Edit", icon: MdEdit, onClick: () => { setEditTarget(row); setFormOpen(true); } },
        { label: "Delete", icon: MdDelete, variant: "danger", onClick: () => setDeleteTarget(row) },
      ],
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Projects"
        description="Manage all real estate development projects"
        badge={`${projects.length} projects`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        actions={
          <button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="flex h-9 items-center gap-1.5 rounded-xl bg-[#f0b429] px-4 text-sm font-semibold text-white hover:bg-[#d97706]">
            <MdAdd size={18} /> Add Project
          </button>
        }
      />
      <AdminTable columns={COLUMNS} data={projects} loading={loading} emptyMessage="No projects found" pageSize={10} />

      <ProjectFormDialog isOpen={formOpen} onClose={() => { setFormOpen(false); setEditTarget(null); }} project={editTarget} onSave={editTarget ? handleEdit : handleCreate} />
      <ProjectAssetsDialog isOpen={!!assetsTarget} onClose={() => setAssetsTarget(null)} project={assetsTarget} assets={assets} />
      <AdminConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Project" message={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" confirmVariant="danger" isLoading={deleting} />
    </div>
  );
}
