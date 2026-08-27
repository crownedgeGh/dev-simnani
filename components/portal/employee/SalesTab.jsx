import StatCard from "@/components/portal/StatCard";

export default function SalesTab({ salesTarget }) {
  const achievementPct = Math.min(
    100,
    Math.round((salesTarget.achieved / salesTarget.monthlyTarget) * 100)
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Bookings" value={salesTarget.totalBookings} />
        <StatCard label="Pending Bookings" value={salesTarget.pendingBookings} />
        <StatCard label="Booking Amount" value={salesTarget.bookingAmount} />
        <StatCard label="Sale Value" value={salesTarget.saleValue} />
        <StatCard label="Commission" value={salesTarget.commission} />
      </div>

      <div className="border border-navy-700/60 bg-navy-900 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl text-cream">Monthly Target Progress</h2>
          <span className="font-display text-2xl text-gold-400">{achievementPct}%</span>
        </div>
        <p className="mt-2 text-sm text-muted">
          Monthly Target: {salesTarget.monthlyTargetLabel} · Achieved: {salesTarget.achievedLabel}
        </p>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-navy-800">
          <div
            className="h-full rounded-full bg-gold-400 transition-all"
            style={{ width: `${achievementPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
