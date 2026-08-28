import PortalHeader from "@/components/portal/PortalHeader";
import FreelancerDashboard from "@/components/portal/FreelancerDashboard";
import { PROJECTS } from "@/lib/projects";
import { DEMO_USER } from "@/lib/demoAccount";
import {
  FREELANCER_STATS,
  FREELANCER_LEADS,
  FREELANCER_PROPERTIES,
  TRAINING_MODULES,
} from "@/lib/demoPortal";

export const metadata = {
  title: "Freelancer Dashboard | Simnani Estate",
  description: "Promote projects, track leads and earn commission.",
};

export default function FreelancerPortalPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <PortalHeader
        eyebrow="Freelancer Portal"
        title={`Welcome, ${DEMO_USER.name}`}
        subtitle="Promote approved projects, generate leads and earn commission."
      />
      <div className="mt-8">
        <FreelancerDashboard
          stats={FREELANCER_STATS}
          projects={PROJECTS}
          leads={FREELANCER_LEADS}
          properties={FREELANCER_PROPERTIES}
          trainingModules={TRAINING_MODULES}
        />
      </div>
    </div>
  );
}
