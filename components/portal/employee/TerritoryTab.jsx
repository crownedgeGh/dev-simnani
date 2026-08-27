import StatCard from "@/components/portal/StatCard";

export default function TerritoryTab({ territory, leads, siteVisits, properties }) {
  const upcomingVisits = siteVisits.filter((visit) => visit.status === "Scheduled").length;

  return (
    <div className="flex flex-col gap-8">
      <div className="border border-navy-700/60 bg-navy-900 p-6">
        <p className="tracked-label text-xs text-gold-400">Assigned District</p>
        <h2 className="mt-1 font-display text-2xl text-cream">{territory.district}</h2>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="tracked-label text-xs text-muted">Cities / Areas</p>
            <p className="mt-2 text-sm text-cream">{territory.cities.join(", ")}</p>
          </div>
          <div>
            <p className="tracked-label text-xs text-muted">Assigned Projects</p>
            <p className="mt-2 text-sm text-cream">{territory.projects.join(", ")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Leads in Territory" value={leads.length} />
        <StatCard label="Upcoming Site Visits" value={upcomingVisits} />
        <StatCard label="Available Inventory" value={properties.length} />
      </div>
    </div>
  );
}
