export default function EmployeeStatCard({ label, value, hint, Icon }) {
  return (
    <div className="group relative overflow-hidden rounded-sm border border-gray-200 bg-white p-5 transition hover:border-cyan-400 hover:bg-cyan-50/40">
      <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-cyan-400/0 transition group-hover:bg-cyan-400/10" />
      <div className="flex items-start justify-between gap-2">
        <p className="tracked-label text-xs text-gray-500">{label}</p>
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 transition group-hover:bg-cyan-200">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-2xl text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
