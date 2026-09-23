export default function RankedBarList({ rows, labelKey, valueKey, emptyMessage, formatLabel }) {
  if (!rows || rows.length === 0) {
    return <p className="py-6 text-center text-sm text-[#9ca3af]">{emptyMessage || "No data yet."}</p>;
  }

  const max = Math.max(...rows.map((r) => r[valueKey] || 0), 1);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => {
        const value = row[valueKey] || 0;
        const label = formatLabel ? formatLabel(row[labelKey]) : row[labelKey] || "(not set)";
        return (
          <div key={`${label}-${i}`} className="flex items-center gap-3">
            <span className="w-5 shrink-0 text-xs font-semibold text-[#9ca3af]">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm text-[#1a1a2e]" title={label}>
                  {label}
                </span>
                <span className="shrink-0 text-xs font-semibold text-[#d97706]">{value.toLocaleString()}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#f5f2ec]">
                <div
                  className="h-full rounded-full bg-[#f0b429]"
                  style={{ width: `${Math.max((value / max) * 100, 4)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
