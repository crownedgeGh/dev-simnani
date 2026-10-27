"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminFormField, { adminInputClass, adminSelectClass, adminTextareaClass } from "@/components/admin/ui/AdminFormField";
import Select from "@/components/ui/Select";
import { DEFAULT_PROJECT, FACINGS, PLOT_STATUSES, PLOT_STATUS_META, parsePlotNumbers, sequencePlotNumbers } from "@/lib/plotInventory";

// The T&C RERA inventory sheet the client shared: 185 plots, 30 sold.
const SAMPLE_LAYOUT = [["E", 14], ["F", 51], ["G", 56], ["H", 30], ["L", 34]]
  .map(([b, n]) => sequencePlotNumbers(b, 1, n).join("  "))
  .join("\n");
const SAMPLE_SOLD =
  "F-29 F-30 F-31 F-32 F-34 F-36 F-37 F-50 G-29 G-32 G-33 G-34 G-35 G-36 G-43 G-44 G-45 G-46 G-47 G-48 G-49 G-50 G-51 H-2 H-3 H-4 H-5 H-16 H-24 L-9";

const MODES = [
  { id: "paste", label: "Paste Numbers" },
  { id: "sequence", label: "Generate Sequence" },
  { id: "mark", label: "Paste → Update Status" },
];

const EMPTY = {
  text: "",
  prefix: "",
  start: "1",
  end: "",
  lengthFt: "",
  widthFt: "",
  areaSqft: "",
  ratePerSqft: "",
  extraCharges: "",
  facing: "",
  isCorner: false,
  status: "available",
  reraRegNo: "",
};

export default function AddPlotsDialog({ isOpen, onClose, project, onDone }) {
  const [mode, setMode] = useState("paste");
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const plotNumbers = useMemo(
    () => (mode === "sequence" ? sequencePlotNumbers(form.prefix, form.start, form.end) : parsePlotNumbers(form.text)),
    [mode, form.text, form.prefix, form.start, form.end]
  );

  function close() {
    setForm(EMPTY);
    onClose();
  }

  async function submit() {
    if (!plotNumbers.length) return toast.error("No valid plot numbers yet (e.g. F-32)");
    setSaving(true);
    try {
      const res =
        mode === "mark"
          ? await fetch("/api/plots", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ project, plotNumbers, status: form.status }),
            })
          : await fetch("/api/plots", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ project, plotNumbers, defaults: form }),
            });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed");
      if (mode === "mark") {
        toast.success(`${json.matched} of ${plotNumbers.length} plots marked ${PLOT_STATUS_META[form.status].label}`);
      } else {
        toast.success(`${json.created} plots added${json.skipped ? ` · ${json.skipped} already existed` : ""}`);
      }
      onDone();
      close();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={close}
      title="Add / Update Plots"
      description={`Project: ${project}`}
      size="xl"
      footer={
        <>
          <span className="mr-auto text-xs text-[#9ca3af]">{plotNumbers.length} plot numbers detected</span>
          <button
            onClick={close}
            disabled={saving}
            className="h-9 rounded-xl border border-[#e8e0d5] px-4 text-sm text-[#6b7280] transition hover:bg-[#faf8f5] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving || !plotNumbers.length}
            className="h-9 rounded-xl bg-[#f0b429] px-4 text-sm font-medium text-white transition hover:bg-[#d97706] disabled:opacity-50"
          >
            {saving ? "Saving…" : mode === "mark" ? "Update Status" : `Add ${plotNumbers.length} Plots`}
          </button>
        </>
      }
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`h-10 rounded-xl px-3.5 text-xs font-semibold transition ${
              mode === m.id ? "bg-[#1a1a2e] text-white" : "border border-[#e8e0d5] text-[#6b7280] hover:bg-[#faf8f5]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "sequence" ? (
        <div className="mb-5 grid grid-cols-3 gap-3">
          <AdminFormField label="Block Prefix" required>
            <input value={form.prefix} onChange={set("prefix")} placeholder="F" maxLength={4} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Start" required>
            <input type="number" min="0" value={form.start} onChange={set("start")} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="End" required>
            <input type="number" min="0" value={form.end} onChange={set("end")} placeholder="50" className={adminInputClass} />
          </AdminFormField>
        </div>
      ) : (
        <div className="mb-5">
          <AdminFormField
            label={mode === "mark" ? "Paste plot numbers to update" : "Paste plot numbers"}
            hint="Any format works — copied from Excel, WhatsApp or a layout sheet: E-1 E-2, F32, g - 15 …"
          >
            <textarea
              rows={6}
              value={form.text}
              onChange={set("text")}
              placeholder={"E-1  E-2  E-3 …\nF-1  F-2 …"}
              className={`${adminTextareaClass} font-mono text-xs`}
            />
          </AdminFormField>
          {project === DEFAULT_PROJECT && (
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, text: mode === "mark" ? SAMPLE_SOLD : SAMPLE_LAYOUT }))}
              className="mt-2 text-xs font-semibold text-[#d97706] transition hover:underline"
            >
              {mode === "mark" ? "Fill sold plots from layout sheet (30)" : "Fill T&C RERA layout sheet (185 plots)"}
            </button>
          )}
        </div>
      )}

      {plotNumbers.length > 0 && (
        <div className="mb-5 flex max-h-28 flex-wrap gap-1 overflow-y-auto rounded-xl border border-[#e8e0d5] bg-[#faf8f5] p-2">
          {plotNumbers.slice(0, 300).map((n) => (
            <span key={n} className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#374151] shadow-sm">
              {n}
            </span>
          ))}
          {plotNumbers.length > 300 && <span className="text-[10px] text-[#9ca3af]">+{plotNumbers.length - 300} more</span>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminFormField label={mode === "mark" ? "Set status to" : "Status"}>
          <Select
            value={form.status}
            onChange={set("status")}
            className={adminSelectClass}
            options={PLOT_STATUSES.map((s) => ({ value: s, label: PLOT_STATUS_META[s].label }))}
          />
        </AdminFormField>

        {mode !== "mark" && (
          <>
            <AdminFormField label="Length (ft)">
              <input type="number" min="0" value={form.lengthFt} onChange={set("lengthFt")} placeholder="40" className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Width (ft)">
              <input type="number" min="0" value={form.widthFt} onChange={set("widthFt")} placeholder="30" className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Area (sq.ft)" hint="Used if length/width empty">
              <input type="number" min="0" value={form.areaSqft} onChange={set("areaSqft")} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Rate per sq.ft (₹)">
              <input type="number" min="0" value={form.ratePerSqft} onChange={set("ratePerSqft")} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Extra Charges (₹)">
              <input type="number" min="0" value={form.extraCharges} onChange={set("extraCharges")} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Facing">
              <Select
                value={form.facing}
                onChange={set("facing")}
                className={adminSelectClass}
                placeholder="—"
                options={[{ value: "", label: "—" }, ...FACINGS.map((f) => ({ value: f, label: f }))]}
              />
            </AdminFormField>
            <AdminFormField label="RERA Reg. No.">
              <input value={form.reraRegNo} onChange={set("reraRegNo")} className={adminInputClass} />
            </AdminFormField>
            <label className="flex min-h-11 cursor-pointer items-center gap-2 self-end text-sm text-[#374151]">
              <input type="checkbox" checked={form.isCorner} onChange={set("isCorner")} className="h-4 w-4 accent-[#f0b429]" />
              Corner plots
            </label>
          </>
        )}
      </div>
      {mode !== "mark" && (
        <p className="mt-4 text-[11px] text-[#9ca3af]">
          Plot numbers that already exist in this project are skipped. Edit individual plots afterwards by clicking them.
        </p>
      )}
    </AdminDialog>
  );
}
