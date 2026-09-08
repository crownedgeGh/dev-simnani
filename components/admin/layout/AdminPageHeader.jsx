"use client";

import { MdRefresh } from "react-icons/md";

export default function AdminPageHeader({
  title,
  description,
  onRefresh,
  isRefreshing,
  actions,
  badge,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-xl font-bold text-[#1a1a2e] sm:text-2xl">{title}</h2>
          {badge && (
            <span className="rounded-full bg-[#fff8e1] px-2.5 py-0.5 text-xs font-semibold text-[#d97706] border border-[#f0b429]/30">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-[#9ca3af]">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Refresh button */}
        {onRefresh && (
          <button
            id="admin-refresh-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-[#e8e0d5] bg-white px-3 text-xs font-medium text-[#6b7280] transition hover:border-[#f0b429]/50 hover:bg-[#fff8e1] hover:text-[#d97706] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdRefresh
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
          </button>
        )}

        {/* Page-level actions (e.g. "Add Property" button) */}
        {actions}
      </div>
    </div>
  );
}
