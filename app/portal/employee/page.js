import EmployeePortalClient from "@/components/portal/employee/EmployeePortalClient";
import { PROPERTIES } from "@/lib/properties";
import {
  EMPLOYEE_STATS,
  EMPLOYEE_LEADS,
  SITE_VISITS,
  SALES_TARGET,
  PERFORMANCE,
  TERRITORY,
} from "@/lib/demoEmployeePortal";

export const metadata = {
  title: "Employee Dashboard | Simnani Estate",
  description: "Manage assigned leads, site visits, follow-ups and sales for your district.",
};

export default function EmployeePortalPage() {
  return (
    <EmployeePortalClient
      stats={EMPLOYEE_STATS}
      leads={EMPLOYEE_LEADS}
      siteVisits={SITE_VISITS}
      salesTarget={SALES_TARGET}
      performance={PERFORMANCE}
      territory={TERRITORY}
      properties={PROPERTIES}
    />
  );
}
