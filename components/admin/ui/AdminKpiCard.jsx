export default function AdminKpiCard({ title, value, subtitle, icon: Icon, color = "gold", trend }) {
  const colorMap = {
    gold: { bg: "bg-[#fff8e1]", text: "text-[#d97706]", icon: "text-[#f0b429]", bar: "#f0b429" },
    blue: { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-500", bar: "#3b82f6" },
    green: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-500", bar: "#10b981" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", icon: "text-purple-500", bar: "#a855f7" },
    orange: { bg: "bg-orange-50", text: "text-orange-700", icon: "text-orange-500", bar: "#f97316" },
    red: { bg: "bg-red-50", text: "text-red-700", icon: "text-red-500", bar: "#ef4444" },
  };
  const c = colorMap[color] || colorMap.gold;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#e8e0d5] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
      <div
        className="absolute inset-x-0 top-0 h-[3px] opacity-80 transition-opacity group-hover:opacity-100"
        style={{ background: c.bar }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider truncate">{title}</p>
          <p className={`mt-1.5 text-2xl font-bold tracking-tight ${c.text}`}>{value}</p>
          {subtitle && <p className="mt-1 text-xs text-[#9ca3af] truncate">{subtitle}</p>}
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
              {trend.positive ? "▲" : "▼"} {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.bg} transition-transform duration-200 group-hover:scale-105`}
          >
            <Icon size={21} className={c.icon} />
          </div>
        )}
      </div>
    </div>
  );
}
