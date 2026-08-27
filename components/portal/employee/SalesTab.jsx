import { FiCheckSquare, FiClock, FiTrendingUp, FiPercent } from "react-icons/fi";
import { BiRupee } from "react-icons/bi";
import EmployeeStatCard from "./EmployeeStatCard";

export default function SalesTab({ salesTarget }) {
  const achievementPct = Math.min(
    100,
    Math.round((salesTarget.achieved / salesTarget.monthlyTarget) * 100)
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <EmployeeStatCard label="Total Bookings" value={salesTarget.totalBookings} Icon={FiCheckSquare} />
        <EmployeeStatCard label="Pending Bookings" value={salesTarget.pendingBookings} Icon={FiClock} />
        <EmployeeStatCard label="Booking Amount" value={salesTarget.bookingAmount} Icon={BiRupee} />
        <EmployeeStatCard label="Sale Value" value={salesTarget.saleValue} Icon={FiTrendingUp} />
        <EmployeeStatCard label="Commission" value={salesTarget.commission} Icon={FiPercent} />
      </div>

      <div className="relative overflow-hidden rounded-sm border border-gray-200 bg-white p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-2xl" />
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl text-gray-900">Monthly Target Progress</h2>
          <span className="font-display text-2xl text-cyan-700">{achievementPct}%</span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Monthly Target: {salesTarget.monthlyTargetLabel} · Achieved: {salesTarget.achievedLabel}
        </p>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all"
            style={{ width: `${achievementPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
