import { FiAward } from "react-icons/fi";

export default function MyEarningsBadge({ amount, achievementPct }) {
  return (
    <div
      className="relative flex items-center gap-3 overflow-hidden rounded-sm border border-cyan-400 bg-white px-5 py-3"
      style={{ boxShadow: "0 0 24px -10px rgba(34,211,238,0.45)" }}
    >
      <span className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-cyan-100 blur-2xl" />

      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
        <FiAward className="h-5 w-5" />
      </span>

      <div className="relative">
        <p className="tracked-label text-[10px] text-cyan-600">My Earnings · This Month</p>
        <p className="font-display text-2xl leading-tight text-cyan-700">{amount}</p>
        {achievementPct != null && (
          <p className="text-[11px] text-gray-500">{achievementPct}% of monthly target achieved</p>
        )}
      </div>
    </div>
  );
}
