import StatCard from "@/components/portal/StatCard";

export default function OverviewTab({ stats, onViewLeads }) {
  const tiles = [
    { label: "Total Assigned Leads", value: stats.totalAssignedLeads },
    { label: "New Leads", value: stats.newLeads },
    { label: "Follow-ups Due Today", value: stats.followUpsDueToday },
    { label: "Site Visits Scheduled", value: stats.siteVisitsScheduled },
    { label: "Site Visits Completed", value: stats.siteVisitsCompleted },
    { label: "Interested Customers", value: stats.interestedCustomers },
    { label: "Bookings", value: stats.bookings },
    { label: "Pending Follow-ups", value: stats.pendingFollowUps },
    { label: "This Month's Sales", value: stats.monthSalesValue },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {tiles.map((tile) => (
          <StatCard key={tile.label} label={tile.label} value={tile.value} />
        ))}
      </div>

      <div className="border border-navy-700/60 bg-navy-900 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-xl text-cream">Need to Follow Up?</h2>
          <button
            type="button"
            onClick={onViewLeads}
            className="tracked-label text-xs text-gold-400 hover:text-gold-300"
          >
            View My Leads
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">
          You have {stats.followUpsDueToday} follow-up{stats.followUpsDueToday === 1 ? "" : "s"} due
          today and {stats.pendingFollowUps} pending overall. Head to the Follow-ups tab to action
          them.
        </p>
      </div>
    </div>
  );
}
