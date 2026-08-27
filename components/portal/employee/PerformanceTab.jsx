import {
  FiUsers,
  FiPhoneCall,
  FiCalendar,
  FiCheckCircle,
  FiMessageSquare,
  FiCheckSquare,
  FiTrendingUp,
  FiPercent,
} from "react-icons/fi";
import EmployeeStatCard from "./EmployeeStatCard";

export default function PerformanceTab({ performance, leads }) {
  const bookings = leads.filter((lead) => lead.status === "Booked").length;
  const conversionRate =
    leads.length > 0 ? `${((bookings / leads.length) * 100).toFixed(1)}%` : performance.conversionRate;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="tracked-label text-xs text-cyan-600">{performance.month} Performance</p>
        <h2 className="mt-1 font-display text-2xl text-gray-900">How You&rsquo;re Tracking</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <EmployeeStatCard label="Leads" value={performance.leads} Icon={FiUsers} />
        <EmployeeStatCard label="Contacted" value={performance.contacted} Icon={FiPhoneCall} />
        <EmployeeStatCard label="Site Visits" value={performance.siteVisits} Icon={FiCalendar} />
        <EmployeeStatCard label="Completed Visits" value={performance.completedVisits} Icon={FiCheckCircle} />
        <EmployeeStatCard label="Negotiations" value={performance.negotiations} Icon={FiMessageSquare} />
        <EmployeeStatCard label="Bookings" value={performance.bookings} Icon={FiCheckSquare} />
        <EmployeeStatCard label="Sales Value" value={performance.salesValue} Icon={FiTrendingUp} />
        <EmployeeStatCard label="Conversion Rate" value={conversionRate} Icon={FiPercent} />
      </div>
    </div>
  );
}
