import { FiUsers, FiCalendar } from "react-icons/fi";
import { BiBuildingHouse } from "react-icons/bi";
import EmployeeStatCard from "./EmployeeStatCard";

export default function TerritoryTab({ territory, leads, siteVisits, properties }) {
  const upcomingVisits = siteVisits.filter((visit) => visit.status === "Scheduled").length;

  return (
    <div className="flex flex-col gap-8">
      <div className="relative overflow-hidden rounded-sm border border-gray-200 bg-white p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-2xl" />
        <p className="tracked-label text-xs text-cyan-600">Assigned District</p>
        <h2 className="mt-1 font-display text-2xl text-gray-900">{territory.district}</h2>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-sm border border-gray-200 bg-gray-50 p-4">
            <p className="tracked-label text-xs text-gray-500">Cities / Areas</p>
            <p className="mt-2 text-sm text-gray-900">{territory.cities.join(", ")}</p>
          </div>
          <div className="rounded-sm border border-gray-200 bg-gray-50 p-4">
            <p className="tracked-label text-xs text-gray-500">Assigned Projects</p>
            <p className="mt-2 text-sm text-gray-900">{territory.projects.join(", ")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <EmployeeStatCard label="Leads in Territory" value={leads.length} Icon={FiUsers} />
        <EmployeeStatCard label="Upcoming Site Visits" value={upcomingVisits} Icon={FiCalendar} />
        <EmployeeStatCard label="Available Inventory" value={properties.length} Icon={BiBuildingHouse} />
      </div>
    </div>
  );
}
