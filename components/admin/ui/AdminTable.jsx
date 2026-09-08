"use client";

import { useState, useMemo, useCallback } from "react";
import {
  MdSearch,
  MdArrowUpward,
  MdArrowDownward,
  MdUnfoldMore,
  MdMoreVert,
  MdClose,
  MdInbox,
} from "react-icons/md";
import AdminStatusBadge from "./AdminStatusBadge";

// ---------------------------------------------------------------------------
// Switch Toggle
// ---------------------------------------------------------------------------
function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? "bg-[#f0b429]" : "bg-[#e8e0d5]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Row action dropdown menu
// ---------------------------------------------------------------------------
function RowActions({ actions, row }) {
  const [open, setOpen] = useState(false);

  if (!actions?.length) return null;

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9ca3af] transition hover:bg-[#faf8f5] hover:text-[#6b7280]"
        aria-label="Row actions"
      >
        <MdMoreVert size={18} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 min-w-[140px] rounded-xl border border-[#e8e0d5] bg-white py-1 shadow-lg">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={() => { setOpen(false); action.onClick(row); }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition hover:bg-[#faf8f5] ${
                  action.variant === "danger"
                    ? "text-red-500 hover:text-red-600"
                    : "text-[#374151] hover:text-[#1a1a2e]"
                }`}
              >
                {action.icon && <action.icon size={16} className="shrink-0" />}
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function TableSkeleton({ columns, rowCount = 5 }) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, ri) => (
        <tr key={ri} className="border-b border-[#e8e0d5]">
          {columns.map((col, ci) => (
            <td key={ci} className="px-4 py-3.5">
              <div className="h-4 rounded-lg bg-[#f0ebe3] animate-pulse" style={{ width: `${60 + (ci * 15) % 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Mobile card view of a single row
// ---------------------------------------------------------------------------
function MobileRowCard({ row, columns, actions, onRowClick }) {
  const mainCol = columns.find((c) => c.primary) || columns[0];
  const otherCols = columns.filter((c) => c !== mainCol && c.key !== "actions");

  return (
    <div
      className={`rounded-2xl border border-[#e8e0d5] bg-white p-4 ${onRowClick ? "cursor-pointer hover:border-[#f0b429]/50 hover:shadow-sm transition-all" : ""}`}
      onClick={onRowClick ? () => onRowClick(row) : undefined}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {mainCol.render
            ? mainCol.render(row[mainCol.key], row)
            : <p className="font-semibold text-[#1a1a2e] text-sm truncate">{row[mainCol.key]}</p>}
        </div>
        {actions?.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <RowActions actions={actions} row={row} />
          </div>
        )}
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {otherCols.map((col) => (
          <div key={col.key} className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af] mb-0.5">{col.label}</p>
            <div className="text-sm text-[#374151] truncate">
              {col.render
                ? col.render(row[col.key], row)
                : <span>{row[col.key] ?? "—"}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main AdminTable
// ---------------------------------------------------------------------------
export default function AdminTable({
  columns = [],
  data = [],
  loading = false,
  onRowClick,
  pageSize = 10,
  emptyMessage = "No records found",
  emptyIcon,
  searchKeys,
  className = "",
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);

  // Derive searchable columns
  const effectiveSearchKeys = searchKeys || columns.filter((c) => c.searchable !== false && c.key !== "actions").map((c) => c.key);

  // Search + filter
  const filtered = useMemo(() => {
    let result = [...data];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        effectiveSearchKeys.some((key) => {
          const val = row[key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }

    Object.entries(filters).forEach(([key, val]) => {
      if (val) {
        result = result.filter((row) => String(row[key]) === String(val));
      }
    });

    return result;
  }, [data, search, filters, effectiveSearchKeys]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = useCallback((key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }, [sortKey]);

  const handleFilter = useCallback((key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearch("");
    setPage(1);
  }, []);

  const filterColumns = columns.filter((c) => c.filterOptions?.length > 0);
  const hasActiveFilters = search || Object.values(filters).some(Boolean);

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <MdUnfoldMore size={14} className="text-[#c9c3bc] group-hover:text-[#9ca3af]" />;
    return sortDir === "asc"
      ? <MdArrowUpward size={14} className="text-[#f0b429]" />
      : <MdArrowDownward size={14} className="text-[#f0b429]" />;
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Search + Filter bar in one single row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
          <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search…"
            className="h-9 w-full rounded-xl border border-[#e8e0d5] bg-white pl-8 pr-7 text-xs text-[#1a1a2e] placeholder-[#9ca3af] outline-none transition focus:border-[#f0b429] focus:ring-2 focus:ring-[#f0b429]/20"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setPage(1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
            >
              <MdClose size={13} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns in the same row */}
        {filterColumns.map((col) => {
          const active = !!filters[col.key];
          return (
            <div
              key={col.key}
              className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs transition ${
                active
                  ? "border-[#f0b429] bg-[#fff8e1]"
                  : "border-[#e8e0d5] bg-white hover:border-[#d5cbbd] hover:bg-[#faf8f5]"
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af] shrink-0">
                {col.label}:
              </span>
              <select
                value={filters[col.key] || ""}
                onChange={(e) => handleFilter(col.key, e.target.value)}
                className={`bg-transparent text-xs font-medium outline-none cursor-pointer pr-1 ${
                  active ? "text-[#d97706] font-semibold" : "text-[#374151]"
                }`}
              >
                <option value="">All</option>
                {col.filterOptions.map((opt) => {
                  const optVal = typeof opt === "object" && opt !== null ? opt.value : opt;
                  const optLabel = typeof opt === "object" && opt !== null ? opt.label : opt;
                  return (
                    <option key={optVal} value={optVal}>
                      {optLabel}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex h-9 items-center gap-1 rounded-xl border border-red-200 bg-red-50/70 px-2.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
            title="Reset filters"
          >
            <MdClose size={14} /> Clear
          </button>
        )}

        {/* Results count */}
        <p className="ml-auto text-xs text-[#9ca3af] whitespace-nowrap pl-2">
          {loading ? "Loading…" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-[#e8e0d5] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-[#e8e0d5] bg-[#faf8f5]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af] ${
                      col.sortable ? "group cursor-pointer select-none hover:text-[#6b7280]" : ""
                    } ${col.width || ""}`}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && <SortIcon colKey={col.key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton columns={columns} />
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faf8f5]">
                        <MdInbox size={24} className="text-[#9ca3af]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#374151]">{emptyMessage}</p>
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="mt-1 text-xs text-[#f0b429] hover:underline"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((row, ri) => (
                  <tr
                    key={row.id || ri}
                    className={`border-b border-[#e8e0d5] transition-colors last:border-0 hover:bg-[#faf8f5] ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3.5"
                        onClick={
                          (col.type === "toggle" || col.type === "actions")
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                      >
                        {col.type === "status" ? (
                          <AdminStatusBadge status={row[col.key]} customColors={col.statusColors} />
                        ) : col.type === "toggle" ? (
                          <ToggleSwitch
                            checked={!!row[col.key]}
                            onChange={(val) => col.onToggle(row, val)}
                          />
                        ) : col.type === "actions" ? (
                          <RowActions actions={col.actions ? col.actions(row) : []} row={row} />
                        ) : col.render ? (
                          col.render(row[col.key], row)
                        ) : (
                          <span className="text-sm text-[#374151]">{row[col.key] ?? "—"}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile / Tablet Card Layout (below lg:) */}
      <div className="flex flex-col gap-3 lg:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#e8e0d5] bg-white p-4">
              <div className="mb-3 h-5 rounded-lg bg-[#f0ebe3] animate-pulse w-3/4" />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 rounded-lg bg-[#f0ebe3] animate-pulse" />
                ))}
              </div>
            </div>
          ))
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#e8e0d5] bg-white py-16">
            <MdInbox size={32} className="text-[#9ca3af]" />
            <p className="text-sm font-medium text-[#374151]">{emptyMessage}</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-[#f0b429] hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          paginated.map((row, ri) => {
            // Build actions list for mobile
            const actionsCol = columns.find((c) => c.type === "actions");
            const rowActions = actionsCol?.actions ? actionsCol.actions(row) : [];

            // Render columns as card — inject toggle and status inline
            const cardColumns = columns
              .filter((c) => c.type !== "actions")
              .map((col) => ({
                ...col,
                render:
                  col.type === "status"
                    ? (val) => <AdminStatusBadge status={val} customColors={col.statusColors} />
                    : col.type === "toggle"
                    ? (val) => (
                        <ToggleSwitch
                          checked={!!val}
                          onChange={(newVal) => col.onToggle(row, newVal)}
                        />
                      )
                    : col.render,
              }));

            return (
              <MobileRowCard
                key={row.id || ri}
                row={row}
                columns={cardColumns}
                actions={rowActions}
                onRowClick={onRowClick}
              />
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-[#9ca3af]">
            Page {page} of {totalPages} · {sorted.length} records
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e0d5] text-xs text-[#6b7280] transition hover:bg-[#faf8f5] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs transition ${
                    page === pageNum
                      ? "bg-[#f0b429] text-white font-semibold"
                      : "border border-[#e8e0d5] text-[#6b7280] hover:bg-[#faf8f5]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e0d5] text-xs text-[#6b7280] transition hover:bg-[#faf8f5] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
