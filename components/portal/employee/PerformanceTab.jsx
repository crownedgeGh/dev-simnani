import StatCard from "@/components/portal/StatCard";

export default function PerformanceTab({ performance, leads }) {
  const bookings = leads.filter((lead) => lead.status === "Booked").length;
  const conversionRate =
    leads.length > 0 ? `${((bookings / leads.length) * 100).toFixed(1)}%` : performance.conversionRate;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="tracked-label text-xs text-gold-400">{performance.month} Performance</p>
        <h2 className="mt-1 font-display text-2xl text-cream">How You&rsquo;re Tracking</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Leads" value={performance.leads} />
        <StatCard label="Contacted" value={performance.contacted} />
        <StatCard label="Site Visits" value={performance.siteVisits} />
        <StatCard label="Completed Visits" value={performance.completedVisits} />
        <StatCard label="Negotiations" value={performance.negotiations} />
        <StatCard label="Bookings" value={performance.bookings} />
        <StatCard label="Sales Value" value={performance.salesValue} />
        <StatCard label="Conversion Rate" value={conversionRate} />
      </div>
    </div>
  );
}
