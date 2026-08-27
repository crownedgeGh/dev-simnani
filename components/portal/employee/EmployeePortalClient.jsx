"use client";

import EmployeeDashboard from "@/components/portal/EmployeeDashboard";
import MyEarningsBadge from "./MyEarningsBadge";
import { useAuth } from "@/context/AuthContext";
import { getPropertiesByDistrict } from "@/lib/demoEmployeePortal";

const DEMO_EMPLOYEE = {
  fullName: "Rahul Mehta",
  assignedDistrict: "Bangalore",
};

export default function EmployeePortalClient({
  stats,
  leads,
  siteVisits,
  salesTarget,
  performance,
  territory,
  properties,
}) {
  const { user } = useAuth();
  const employee = user?.accountType === "employee" ? user : DEMO_EMPLOYEE;
  const district = employee.assignedDistrict || territory.district;

  const districtLeads = leads.filter((lead) => lead.district === district);
  const districtProperties = getPropertiesByDistrict(properties, district);
  const achievementPct = Math.min(
    100,
    Math.round((salesTarget.achieved / salesTarget.monthlyTarget) * 100)
  );

  return (
    <div className="relative overflow-hidden bg-gray-50">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.08),_transparent_55%)]" />
      <div className="pointer-events-none absolute -top-32 right-10 -z-10 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full bg-cyan-100/50 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="tracked-label text-xs text-cyan-600">Employee Portal</p>
            <h1 className="mt-2 font-display text-3xl text-gray-900 sm:text-4xl">
              Welcome, {employee.fullName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              District Executive · Assigned to {district}. Here&rsquo;s what needs your attention
              today.
            </p>
          </div>
          <MyEarningsBadge amount={salesTarget.commission} achievementPct={achievementPct} />
        </div>
        <div className="mt-8">
          <EmployeeDashboard
            stats={stats}
            leads={districtLeads}
            siteVisits={siteVisits}
            salesTarget={salesTarget}
            performance={performance}
            territory={{ ...territory, district }}
            properties={districtProperties}
          />
        </div>
      </div>
    </div>
  );
}
