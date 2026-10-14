"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  MdPhoneForwarded,
  MdCheckCircle,
  MdCancel,
  MdEventRepeat,
  MdFiberNew,
  MdAdd,
} from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";
import AdminKpiCard from "@/components/admin/ui/AdminKpiCard";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminFormField, { adminInputClass, adminTextareaClass } from "@/components/admin/ui/AdminFormField";

const STATUSES = ["New", "Contacted", "Follow-up", "Converted", "Lost"];

export default function AdminHomeLoanLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [crmLead, setCrmLead] = useState(null);
  const [note, setNote] = useState("");
  const [outcome, setOutcome] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/home-loan-leads", { cache: "no-store" });
      const json = await res.json();
      if (json.success) setLeads(json.data || []);
      else toast.error(json.error || "Failed to load home loan leads");
    } catch {
      toast.error("Network error loading home loan leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      if (active) await load();
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

  const patchLead = async (id, patch) => {
    try {
      const res = await fetch("/api/home-loan-leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Update failed");
        return null;
      }
      setLeads((prev) => prev.map((l) => (l.id === id ? json.data : l)));
      return json.data;
    } catch {
      toast.error("Network error");
      return null;
    }
  };

  function openCrm(row) {
    setCrmLead(row);
    setNote("");
    setOutcome("");
    setNextDate(row.nextFollowupDate || "");
  }

  async function logFollowup() {
    if (!note.trim()) {
      toast.error("Add a note about this call/followup");
      return;
    }
    setSaving(true);
    const updated = await patchLead(crmLead.id, {
      status: "Follow-up",
      nextFollowupDate: nextDate,
      followup: { note, outcome },
    });
    setSaving(false);
    if (updated) {
      toast.success("Followup logged");
      setCrmLead(updated);
      setNote("");
      setOutcome("");
    }
  }

  const kpis = useMemo(() => {
    const newCount = leads.filter((l) => l.status === "New").length;
    const followupCount = leads.filter((l) => l.status === "Follow-up").length;
    const converted = leads.filter((l) => l.status === "Converted").length;
    return { total: leads.length, newCount, followupCount, converted };
  }, [leads]);

  const COLUMNS = [
    {
      key: "name",
      label: "Applicant",
      sortable: true,
      primary: true,
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-[#1a1a2e]">{v}</p>
          <AdminPhoneCell value={row.phone} className="text-xs text-[#9ca3af]" />
        </div>
      ),
    },
    {
      key: "bankName",
      label: "Bank",
      sortable: true,
      render: (v, row) => (
        <span className="text-sm text-[#374151]">
          {v || "—"}
          {row.bankRate ? <span className="text-xs text-[#9ca3af]"> · {row.bankRate}%</span> : null}
        </span>
      ),
    },
    {
      key: "loanAmount",
      label: "Loan Amount",
      sortable: true,
      render: (v) => <span className="text-sm text-[#374151]">{v ? `₹${Number(v).toLocaleString("en-IN")}` : "—"}</span>,
    },
    {
      key: "propertyCity",
      label: "City",
      render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span>,
    },
    { key: "date", label: "Date", sortable: true },
    {
      key: "nextFollowupDate",
      label: "Next Followup",
      render: (v) => <span className="text-xs text-[#374151]">{v || "—"}</span>,
    },
    {
      key: "status",
      label: "Status",
      type: "status",
      sortable: true,
      filterOptions: STATUSES,
    },
    {
      key: "actions",
      label: "",
      type: "actions",
      searchable: false,
      actions: (row) => [
        { label: "Log Call / Followup", icon: MdEventRepeat, onClick: () => openCrm(row) },
        { label: "Mark Contacted", icon: MdPhoneForwarded, onClick: () => patchLead(row.id, { status: "Contacted" }) },
        { label: "Mark Converted", icon: MdCheckCircle, onClick: () => patchLead(row.id, { status: "Converted" }) },
        { label: "Mark Lost", icon: MdCancel, variant: "danger", onClick: () => patchLead(row.id, { status: "Lost" }) },
        { label: "Reopen as New", icon: MdFiberNew, onClick: () => patchLead(row.id, { status: "New" }) },
      ],
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Home Loan Leads"
        description="Applicants who submitted details from the /home-loan enquiry form — follow up and track to conversion here."
        badge={kpis.newCount > 0 ? `${kpis.newCount} new` : `${kpis.total} total`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpiCard title="Total Leads" value={kpis.total} icon={MdFiberNew} color="gold" />
        <AdminKpiCard title="New" value={kpis.newCount} icon={MdFiberNew} color="blue" />
        <AdminKpiCard title="Follow-up Due" value={kpis.followupCount} icon={MdEventRepeat} color="orange" />
        <AdminKpiCard title="Converted" value={kpis.converted} icon={MdCheckCircle} color="green" />
      </div>

      <AdminTable
        columns={COLUMNS}
        data={leads}
        loading={loading}
        emptyMessage="No home loan leads yet"
        pageSize={10}
        searchKeys={["name", "phone", "email", "bankName", "propertyCity"]}
      />

      <AdminDialog
        isOpen={!!crmLead}
        onClose={() => setCrmLead(null)}
        title={crmLead ? `${crmLead.name} — Call & Followup Log` : ""}
        description={crmLead ? `${crmLead.phone} · ${crmLead.bankName || "No bank selected"}` : ""}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setCrmLead(null)}
              className="h-9 rounded-xl border border-[#e8e0d5] px-4 text-sm text-[#6b7280] transition hover:bg-[#faf8f5]"
            >
              Close
            </button>
            <button
              onClick={logFollowup}
              disabled={saving}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-[#f0b429] px-4 text-sm font-medium text-white transition hover:bg-[#d97706] disabled:opacity-50"
            >
              <MdAdd size={16} /> {saving ? "Saving…" : "Log & Save"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminFormField label="Call / followup note" required>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Called — asked for income proof, will send by tomorrow"
              className={adminTextareaClass}
            />
          </AdminFormField>
          <AdminFormField label="Outcome" hint="Optional — e.g. Interested, No answer, Needs docs">
            <input
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="Interested"
              className={adminInputClass}
            />
          </AdminFormField>
          <AdminFormField label="Next followup date" hint="Sets status to Follow-up">
            <input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              className={adminInputClass}
            />
          </AdminFormField>
        </div>

        <div className="mt-5 border-t border-[#e8e0d5] pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Past activity</p>
          {!crmLead?.followups?.length ? (
            <p className="text-sm text-[#9ca3af]">No calls or followups logged yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto">
              {[...crmLead.followups].reverse().map((f, i) => (
                <div key={i} className="rounded-xl border border-[#e8e0d5] bg-[#faf8f5] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#1a1a2e]">{f.date}</span>
                    {f.outcome && (
                      <span className="rounded-full bg-[#fff8e1] px-2 py-0.5 text-[10px] font-semibold text-[#d97706] border border-[#f0b429]/30">
                        {f.outcome}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[#374151]">{f.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminDialog>
    </div>
  );
}
