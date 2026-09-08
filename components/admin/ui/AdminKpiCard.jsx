export default function AdminKpiCard({ title, value, subtitle, icon: Icon, color = "gold", trend }) {
  const colorMap = {
    gold: { bg: "bg-[#fff8e1]", text: "text-[#d97706]", icon: "text-[#f0b429]" },
    blue: { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-500" },
    green: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", icon: "text-purple-500" },
    orange: { bg: "bg-orange-50", text: "text-orange-700", icon: "text-orange-500" },
    red: { bg: "bg-red-50", text: "text-red-700", icon: "text-red-500" },
  };
  const c = colorMap[color] || colorMap.gold;

  return (
    <div className="rounded-2xl border border-[#e8e0d5] bg-white p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide truncate">{title}</p>
          <p className={`mt-1.5 text-2xl font-bold ${c.text}`}>{value}</p>
          {subtitle && <p className="mt-1 text-xs text-[#9ca3af] truncate">{subtitle}</p>}
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
              {trend.positive ? "▲" : "▼"} {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
            <Icon size={20} className={c.icon} />
          </div>
        )}
      </div>
    </div>
  );
}
