"use client";

import PortalHeader from "@/components/portal/PortalHeader";
import EmployeeDashboard from "@/components/portal/EmployeeDashboard";
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <PortalHeader
        eyebrow="Employee Portal"
        title={`Welcome, ${employee.fullName}`}
        subtitle={`District Executive · Assigned to ${district}. Here's what needs your attention today.`}
      />
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
  );
}
