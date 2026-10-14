"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  MdAdd,
  MdArrowBack,
  MdChecklist,
  MdClose,
  MdContentPaste,
  MdDelete,
  MdFileDownload,
  MdPrint,
  MdSearch,
} from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";
import { adminInputClass, adminSelectClass } from "@/components/admin/ui/AdminFormField";
import PlotGrid, { formatArea } from "@/components/shared/PlotGrid";
import PlotEditDialog, { formatINR } from "@/components/admin/plots/PlotEditDialog";
import AddPlotsDialog from "@/components/admin/plots/AddPlotsDialog";
import { PLOT_STATUSES, PLOT_STATUS_META, SQFT_PER_SQYD } from "@/lib/plotInventory";

const chipBtn = (active) =>
  `h-10 min-w-10 rounded-xl px-3 text-xs font-semibold transition ${
    active ? "bg-[#1a1a2e] text-white" : "border border-[#e8e0d5] bg-white text-[#6b7280] hover:bg-[#faf8f5]"
  }`;

function decodeParam(raw) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export default function PlotLayoutPage() {
  const project = decodeParam(useParams().project);
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [unit, setUnit] = useState("sqft");

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkRate, setBulkRate] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const [editing, setEditing] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async (p) => {
    try {
      const res = await fetch(`/api/plots?project=${encodeURIComponent(p)}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setPlots(json.data);
    } catch (err) {
      toast.error(err.message || "Failed to load plots");
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      if (!active) return;
      setLoading(true);
      await load(project);
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [load, project]);

  const reload = () => load(project);

  async function handleRefresh() {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }

  // ── Derived data ──────────────────────────────────────────────
  const blocks = useMemo(() => [...new Set(plots.map((p) => p.block))], [plots]);
  const sizes = useMemo(
    () => [...new Set(plots.map((p) => p.areaSqft).filter(Boolean))].sort((a, b) => a - b),
    [plots]
  );

  const summary = useMemo(() => {
    const s = { total: plots.length, totalValue: 0 };
    for (const st of PLOT_STATUSES) s[st] = { count: 0, value: 0 };
    for (const p of plots) {
      s[p.status].count += 1;
      s[p.status].value += p.totalPrice || 0;
      s.totalValue += p.totalPrice || 0;
    }
    return s;
  }, [plots]);

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase().replace(/\s+/g, "");
    return plots.filter(
      (p) =>
        (!blockFilter || p.block === blockFilter) &&
        (!statusFilter || p.status === statusFilter) &&
        (!sizeFilter || p.areaSqft === Number(sizeFilter)) &&
        (!q || p.plotNumber.replace("-", "").includes(q.replace("-", "")) || p.buyerName?.toUpperCase().includes(q))
    );
  }, [plots, search, blockFilter, statusFilter, sizeFilter]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const p of filtered) {
      if (!map.has(p.block)) map.set(p.block, []);
      map.get(p.block).push(p);
    }
    return [...map].map(([block, list]) => ({ block, plots: list }));
  }, [filtered]);

  // ── Selection / bulk ──────────────────────────────────────────
  function handleTileClick(plot) {
    if (!selectMode) return setEditing(plot);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(plot._id)) next.delete(plot._id);
      else next.add(plot._id);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  async function applyBulk() {
    if (!bulkStatus && bulkRate === "") return toast.error("Choose a status or enter a rate");
    setBulkBusy(true);
    try {
      const res = await fetch("/api/plots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selectedIds], status: bulkStatus, ratePerSqft: bulkRate }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success(`${json.matched} plots updated`);
      setBulkStatus("");
      setBulkRate("");
      exitSelectMode();
      await reload();
    } catch (err) {
      toast.error(err.message || "Bulk update failed");
    } finally {
      setBulkBusy(false);
    }
  }

  async function bulkDelete() {
    setBulkBusy(true);
    try {
      const res = await fetch("/api/plots", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selectedIds] }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success(`${json.deleted} plots deleted`);
      setConfirmBulkDelete(false);
      exitSelectMode();
      await reload();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setBulkBusy(false);
    }
  }

  // ── Export / print ────────────────────────────────────────────
  function exportCsv() {
    const header = [
      "Plot No", "Block", "Status", "Length (ft)", "Width (ft)", "Area (sq.ft)", "Area (sq.yd)", "Facing", "Corner",
      "Rate/sq.ft", "Extra Charges", "Total Price", "Buyer Name", "Buyer Phone", "Booking Date", "Token Amount", "RERA Reg No", "Notes",
    ];
    const rows = filtered.map((p) => [
      p.plotNumber, p.block, PLOT_STATUS_META[p.status].label, p.lengthFt || "", p.widthFt || "", p.areaSqft || "",
      p.areaSqft ? (p.areaSqft / SQFT_PER_SQYD).toFixed(2) : "", p.facing, p.isCorner ? "Yes" : "No",
      p.ratePerSqft || "", p.extraCharges || "", p.totalPrice || "", p.buyerName, p.buyerPhone,
      p.bookingDate ? String(p.bookingDate).slice(0, 10) : "", p.tokenAmount || "", p.reraRegNo, p.notes,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    // BOM so Excel opens ₹ / Hindi names correctly.
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.replace(/[^\w-]+/g, "_")}-inventory.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printSheet() {
    const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    const tiles = filtered
      .map((p) => {
        const m = PLOT_STATUS_META[p.status];
        return `<span class="t" style="background:${m.bottom};color:${m.text}">${esc(p.plotNumber)}</span>`;
      })
      .join("");
    const legend = PLOT_STATUSES.map((s) => {
      const m = PLOT_STATUS_META[s];
      return `<span class="t" style="background:${m.bottom};color:${m.text}">${summary[s].count}</span> ${m.label} &nbsp; `;
    }).join("");
    const rows = filtered
      .map(
        (p) =>
          `<tr><td>${esc(p.plotNumber)}</td><td>${esc(PLOT_STATUS_META[p.status].label)}</td><td>${p.areaSqft || ""}</td><td>${esc(p.facing)}${p.isCorner ? " (Corner)" : ""}</td><td>${p.ratePerSqft || ""}</td><td>${p.totalPrice ? p.totalPrice.toLocaleString("en-IN") : ""}</td><td>${esc(p.buyerName)}</td><td>${esc(p.buyerPhone)}</td></tr>`
      )
      .join("");
    const w = window.open("", "_blank");
    if (!w) return toast.error("Allow pop-ups to print the inventory sheet");
    w.document.write(`<!doctype html><html><head><title>${esc(project)} — Inventory</title><style>
      body{font-family:Arial,sans-serif;margin:24px;color:#111}h1{font-size:18px;margin:0 0 4px}
      .g{display:flex;flex-wrap:wrap;gap:4px;margin:12px 0}.t{display:inline-block;min-width:44px;padding:4px 6px;border-radius:3px;font-size:10px;font-weight:700;text-align:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .bar{background:#1a1a2e;color:#fff;text-align:center;font-weight:700;padding:8px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      table{width:100%;border-collapse:collapse;font-size:11px;margin-top:16px}td,th{border:1px solid #ccc;padding:4px 6px;text-align:left}
    </style></head><body>
      <h1>${esc(project)} — Plot Inventory</h1><p style="font-size:11px;color:#666">Printed ${new Date().toLocaleString("en-IN")}</p>
      <div class="g">${tiles}</div><div class="bar">TOTAL INVENTORY : ${filtered.length}</div><p>${legend}</p>
      <table><thead><tr><th>Plot</th><th>Status</th><th>Area (sq.ft)</th><th>Facing</th><th>Rate</th><th>Total ₹</th><th>Buyer</th><th>Phone</th></tr></thead><tbody>${rows}</tbody></table>
    </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  const hasFilters = search || blockFilter || statusFilter || sizeFilter;

  return (
    <div>
      <AdminPageHeader
        title={project}
        description="Click a plot to edit price, status and buyer details; paste plot numbers to build or update the layout."
        badge={`${summary.total} plots`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        actions={
          <button
            onClick={() => setAddOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-[#f0b429] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#d97706]"
          >
            <MdAdd size={16} /> Add / Paste Plots
          </button>
        }
      />

      <Link
        href="/admin/tnc-rera"
        className="-mt-3 mb-4 inline-flex h-10 items-center gap-1.5 text-xs font-semibold text-[#6b7280] transition hover:text-[#d97706]"
      >
        <MdArrowBack size={16} /> All projects
      </Link>

      {/* Summary bar — click a status to filter */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-[#e8e0d5] bg-white">
        <div className="bg-[#1a1a2e] px-4 py-3 text-center text-sm font-bold tracking-wide text-white sm:text-base">
          TOTAL INVENTORY : {summary.total}
          {summary.totalValue > 0 && <span className="ml-2 font-medium text-[#f0b429]">· {formatINR(summary.totalValue)}</span>}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {PLOT_STATUSES.map((s) => {
            const m = PLOT_STATUS_META[s];
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(active ? "" : s)}
                className={`flex items-center gap-3 border-[#e8e0d5] p-3 text-left transition hover:bg-[#faf8f5] sm:p-4 [&:not(:last-child)]:border-r ${active ? "bg-[#fff8e1]" : ""}`}
              >
                <span
                  className="flex h-10 min-w-12 items-center justify-center rounded-md px-2 text-sm font-bold"
                  style={{
                    background: `linear-gradient(180deg, ${m.top}, ${m.bottom})`,
                    boxShadow: `0 3px 0 ${m.side}`,
                    color: m.text,
                  }}
                >
                  {summary[s].count}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold uppercase tracking-wide text-[#374151]">{m.label}</span>
                  <span className="block text-[11px] text-[#9ca3af]">
                    {summary.total ? Math.round((summary[s].count / summary.total) * 100) : 0}%
                    {summary[s].value > 0 && ` · ${formatINR(summary[s].value)}`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters + tools */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#e8e0d5] bg-white p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-56">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Plot no. or buyer"
              className={`${adminInputClass} pl-9`}
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${adminSelectClass} sm:w-48`}>
            <option value="">All statuses</option>
            {PLOT_STATUSES.map((s) => <option key={s} value={s}>{PLOT_STATUS_META[s].label}</option>)}
          </select>
          <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} className={`${adminSelectClass} sm:w-48`}>
            <option value="">All sizes</option>
            {sizes.map((a) => <option key={a} value={a}>{formatArea(a, unit)}</option>)}
          </select>
          <div className="flex overflow-hidden rounded-xl border border-[#e8e0d5]">
            {[["sqft", "sq.ft"], ["sqyd", "sq.yd"]].map(([u, label]) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`h-10 px-3 text-xs font-semibold transition ${unit === u ? "bg-[#1a1a2e] text-white" : "bg-white text-[#6b7280] hover:bg-[#faf8f5]"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setBlockFilter("");
                setStatusFilter("");
                setSizeFilter("");
              }}
              className="h-10 px-2 text-xs font-semibold text-[#d97706] transition hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">Block</span>
          <button onClick={() => setBlockFilter("")} className={chipBtn(!blockFilter)}>All</button>
          {blocks.map((b) => (
            <button key={b} onClick={() => setBlockFilter(blockFilter === b ? "" : b)} className={chipBtn(blockFilter === b)}>
              {b}
            </button>
          ))}
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
              className={`${chipBtn(selectMode)} flex items-center gap-1.5`}
            >
              <MdChecklist size={16} /> Bulk Select
            </button>
            <button onClick={exportCsv} disabled={!filtered.length} className={`${chipBtn(false)} flex items-center gap-1.5 disabled:opacity-50`}>
              <MdFileDownload size={16} /> CSV
            </button>
            <button onClick={printSheet} disabled={!filtered.length} className={`${chipBtn(false)} flex items-center gap-1.5 disabled:opacity-50`}>
              <MdPrint size={16} /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectMode && (
        <div className="sticky top-0 z-10 mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-[#f0b429]/40 bg-[#fff8e1] p-3">
          <span className="text-sm font-semibold text-[#1a1a2e]">{selectedIds.size} selected</span>
          <button onClick={() => setSelectedIds(new Set(filtered.map((p) => p._id)))} className={chipBtn(false)}>
            Select all visible ({filtered.length})
          </button>
          <button onClick={() => setSelectedIds(new Set())} className={chipBtn(false)}>Clear</button>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className={`${adminSelectClass} bg-white sm:w-48`}>
            <option value="">Status: no change</option>
            {PLOT_STATUSES.map((s) => <option key={s} value={s}>{PLOT_STATUS_META[s].label}</option>)}
          </select>
          <input
            type="number"
            min="0"
            value={bulkRate}
            onChange={(e) => setBulkRate(e.target.value)}
            placeholder="New rate ₹/sq.ft"
            className={`${adminInputClass} bg-white sm:w-40`}
          />
          <button
            onClick={applyBulk}
            disabled={bulkBusy || !selectedIds.size}
            className="h-10 rounded-xl bg-[#f0b429] px-4 text-xs font-semibold text-white transition hover:bg-[#d97706] disabled:opacity-50"
          >
            Apply
          </button>
          <button
            onClick={() => setConfirmBulkDelete(true)}
            disabled={bulkBusy || !selectedIds.size}
            className="flex h-10 items-center gap-1 rounded-xl px-3 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
          >
            <MdDelete size={16} /> Delete
          </button>
          <button onClick={exitSelectMode} className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-white" aria-label="Exit bulk select">
            <MdClose size={18} />
          </button>
        </div>
      )}

      {/* Plot board */}
      {loading ? (
        <div className="h-80 animate-pulse rounded-2xl border border-[#e8e0d5] bg-[#f4efe4]" />
      ) : !plots.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#e8e0d5] bg-white px-4 py-16 text-center">
          <MdContentPaste size={36} className="text-[#f0b429]" />
          <p className="text-base font-semibold text-[#1a1a2e]">No plots in “{project}” yet</p>
          <p className="max-w-md text-sm text-[#9ca3af]">
            Paste plot numbers copied from your layout sheet (E-1, E-2, F-1 …) or generate a block in sequence.
          </p>
          <button
            onClick={() => setAddOpen(true)}
            className="mt-2 flex h-11 items-center gap-1.5 rounded-xl bg-[#f0b429] px-4 text-sm font-semibold text-white transition hover:bg-[#d97706]"
          >
            <MdAdd size={18} /> Add / Paste Plots
          </button>
        </div>
      ) : !filtered.length ? (
        <p className="rounded-2xl border border-[#e8e0d5] bg-white py-16 text-center text-sm text-[#9ca3af]">No plots match these filters.</p>
      ) : (
        <PlotGrid
          groups={groups}
          unit={unit}
          selectMode={selectMode}
          selectedIds={selectedIds}
          onTileClick={handleTileClick}
        />
      )}

      <AddPlotsDialog isOpen={addOpen} onClose={() => setAddOpen(false)} project={project} onDone={reload} />

      {editing && (
        <PlotEditDialog
          key={editing._id}
          plot={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
          onDeleted={() => {
            setEditing(null);
            reload();
          }}
        />
      )}

      <AdminConfirmModal
        isOpen={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={bulkDelete}
        title="Delete plots?"
        message={`Permanently delete ${selectedIds.size} selected plots from ${project}? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={bulkBusy}
      />
    </div>
  );
}
