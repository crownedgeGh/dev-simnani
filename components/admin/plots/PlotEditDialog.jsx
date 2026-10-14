"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MdDelete } from "react-icons/md";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminFormField, { adminInputClass, adminSelectClass, adminTextareaClass } from "@/components/admin/ui/AdminFormField";
import { FACINGS, PLOT_STATUSES, PLOT_STATUS_META, SQFT_PER_SQYD } from "@/lib/plotInventory";

export function formatINR(n) {
  const v = Number(n) || 0;
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2)} L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

function toForm(p) {
  return {
    plotNumber: p.plotNumber,
    lengthFt: p.lengthFt ? String(p.lengthFt) : "",
    widthFt: p.widthFt ? String(p.widthFt) : "",
    areaSqft: p.areaSqft ? String(p.areaSqft) : "",
    facing: p.facing || "",
    isCorner: !!p.isCorner,
    ratePerSqft: p.ratePerSqft ? String(p.ratePerSqft) : "",
    extraCharges: p.extraCharges ? String(p.extraCharges) : "",
    status: p.status,
    buyerName: p.buyerName || "",
    buyerPhone: p.buyerPhone || "",
    bookingDate: p.bookingDate ? String(p.bookingDate).slice(0, 10) : "",
    tokenAmount: p.tokenAmount ? String(p.tokenAmount) : "",
    reraRegNo: p.reraRegNo || "",
    notes: p.notes || "",
  };
}

// Mount with key={plot._id} so the form resets per plot.
export default function PlotEditDialog({ plot, onClose, onSaved, onDeleted }) {
  const [form, setForm] = useState(() => toForm(plot));
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const length = Number(form.lengthFt) || 0;
  const width = Number(form.widthFt) || 0;
  const area = length && width ? length * width : Number(form.areaSqft) || 0;
  const basePrice = area * (Number(form.ratePerSqft) || 0);
  const total = basePrice + (Number(form.extraCharges) || 0);
  const hasBuyer = form.status === "booked" || form.status === "hold";
  const meta = PLOT_STATUS_META[form.status];

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/plots/${plot._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, areaSqft: area }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save plot");
      toast.success(`${json.data.plotNumber} saved`);
      onSaved(json.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirmDelete) return setConfirmDelete(true);
    setSaving(true);
    try {
      const res = await fetch(`/api/plots/${plot._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete plot");
      toast.success(`${plot.plotNumber} deleted`);
      onDeleted(plot._id);
    } catch (err) {
      toast.error(err.message);
      setSaving(false);
    }
  }

  return (
    <AdminDialog
      isOpen
      onClose={onClose}
      title={`Plot ${plot.plotNumber}`}
      description={`Block ${plot.block} · ${plot.project}`}
      size="lg"
      footer={
        <>
          <button
            onClick={remove}
            disabled={saving}
            className="mr-auto flex h-9 items-center gap-1 rounded-xl px-3 text-sm text-red-500 transition hover:bg-red-50 disabled:opacity-50"
          >
            <MdDelete size={16} /> {confirmDelete ? "Click again to delete" : "Delete"}
          </button>
          <button
            onClick={onClose}
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
      {/* Price summary */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Area" value={area ? `${area} ft²` : "—"} sub={area ? `${(area / SQFT_PER_SQYD).toFixed(1)} yd²` : ""} />
        <Stat label="Base Price" value={formatINR(basePrice)} />
        <Stat label="Total Cost" value={formatINR(total)} />
        <div className="rounded-xl border border-[#e8e0d5] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">Status</p>
          <span
            className="mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-semibold"
            style={{ background: meta.bottom, color: meta.text }}
          >
            {meta.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminFormField label="Plot Number" required>
          <input value={form.plotNumber} onChange={set("plotNumber")} className={adminInputClass} />
        </AdminFormField>
        <AdminFormField label="Status">
          <select value={form.status} onChange={set("status")} className={adminSelectClass}>
            {PLOT_STATUSES.map((s) => (
              <option key={s} value={s}>{PLOT_STATUS_META[s].label}</option>
            ))}
          </select>
        </AdminFormField>

        <AdminFormField label="Length (ft)">
          <input type="number" min="0" value={form.lengthFt} onChange={set("lengthFt")} placeholder="40" className={adminInputClass} />
        </AdminFormField>
        <AdminFormField label="Width (ft)">
          <input type="number" min="0" value={form.widthFt} onChange={set("widthFt")} placeholder="30" className={adminInputClass} />
        </AdminFormField>
        <AdminFormField label="Total Area (sq.ft)" hint={length && width ? "Auto: length × width" : "Or fill length & width"}>
          <input
            type="number"
            min="0"
            value={length && width ? String(area) : form.areaSqft}
            onChange={set("areaSqft")}
            disabled={!!(length && width)}
            className={`${adminInputClass} disabled:opacity-60`}
          />
        </AdminFormField>
        <AdminFormField label="Facing">
          <select value={form.facing} onChange={set("facing")} className={adminSelectClass}>
            <option value="">—</option>
            {FACINGS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </AdminFormField>

        <AdminFormField label="Rate per sq.ft (₹)">
          <input type="number" min="0" value={form.ratePerSqft} onChange={set("ratePerSqft")} placeholder="2500" className={adminInputClass} />
        </AdminFormField>
        <AdminFormField label="Extra Charges (₹)" hint="PLC / corner premium / development">
          <input type="number" min="0" value={form.extraCharges} onChange={set("extraCharges")} placeholder="0" className={adminInputClass} />
        </AdminFormField>

        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[#374151] sm:col-span-2">
          <input type="checkbox" checked={form.isCorner} onChange={set("isCorner")} className="h-4 w-4 accent-[#f0b429]" />
          Corner plot
        </label>

        <AdminFormField label="RERA Registration No.">
          <input value={form.reraRegNo} onChange={set("reraRegNo")} placeholder="UPRERAPRJ12345" className={adminInputClass} />
        </AdminFormField>

        {hasBuyer && (
          <>
            <AdminFormField label="Buyer Name">
              <input value={form.buyerName} onChange={set("buyerName")} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Buyer Phone">
              <input type="tel" value={form.buyerPhone} onChange={set("buyerPhone")} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Booking Date">
              <input type="date" value={form.bookingDate} onChange={set("bookingDate")} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Token Amount Paid (₹)">
              <input type="number" min="0" value={form.tokenAmount} onChange={set("tokenAmount")} className={adminInputClass} />
            </AdminFormField>
          </>
        )}

        <div className="sm:col-span-2">
          <AdminFormField label="Notes">
            <textarea rows={2} value={form.notes} onChange={set("notes")} className={adminTextareaClass} />
          </AdminFormField>
        </div>
        {form.status === "available" && (plot.buyerName || plot.buyerPhone) && (
          <p className="text-xs text-[#d97706] sm:col-span-2">
            Saving as Available will clear the buyer details ({plot.buyerName || plot.buyerPhone}).
          </p>
        )}
      </div>
    </AdminDialog>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-[#e8e0d5] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#1a1a2e]">{value}</p>
      {sub && <p className="text-[11px] text-[#9ca3af]">{sub}</p>}
    </div>
  );
}
