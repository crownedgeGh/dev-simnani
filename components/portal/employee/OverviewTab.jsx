import {
  FiUsers,
  FiUserPlus,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiHeart,
  FiCheckSquare,
  FiAlertCircle,
  FiTrendingUp,
  FiArrowRight,
} from "react-icons/fi";
import EmployeeStatCard from "./EmployeeStatCard";

export default function OverviewTab({ stats, onViewLeads }) {
  const tiles = [
    { label: "Total Assigned Leads", value: stats.totalAssignedLeads, Icon: FiUsers },
    { label: "New Leads", value: stats.newLeads, Icon: FiUserPlus },
    { label: "Follow-ups Due Today", value: stats.followUpsDueToday, Icon: FiClock },
    { label: "Site Visits Scheduled", value: stats.siteVisitsScheduled, Icon: FiCalendar },
    { label: "Site Visits Completed", value: stats.siteVisitsCompleted, Icon: FiCheckCircle },
    { label: "Interested Customers", value: stats.interestedCustomers, Icon: FiHeart },
    { label: "Bookings", value: stats.bookings, Icon: FiCheckSquare },
    { label: "Pending Follow-ups", value: stats.pendingFollowUps, Icon: FiAlertCircle },
    { label: "This Month's Sales", value: stats.monthSalesValue, Icon: FiTrendingUp },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {tiles.map((tile) => (
          <EmployeeStatCard key={tile.label} label={tile.label} value={tile.value} Icon={tile.Icon} />
        ))}
      </div>

      <div className="relative overflow-hidden rounded-sm border border-gray-200 bg-white p-6">
        <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500" />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-xl text-gray-900">Need to Follow Up?</h2>
          <button
            type="button"
            onClick={onViewLeads}
            className="tracked-label flex items-center gap-1.5 text-xs text-cyan-600 transition hover:text-cyan-700"
          >
            View My Leads
            <FiArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          You have {stats.followUpsDueToday} follow-up{stats.followUpsDueToday === 1 ? "" : "s"} due
          today and {stats.pendingFollowUps} pending overall. Head to the Follow-ups tab to action
          them.
        </p>
      </div>
    </div>
  );
}
