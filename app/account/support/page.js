import PortalHeader from "@/components/portal/PortalHeader";
import SupportPanel from "@/components/portal/SupportPanel";
import { SUPPORT_TICKETS } from "@/lib/demoAccount";

export const metadata = {
  title: "Support Requests | Simnani Estate",
  description: "Track and manage your inquiries with Simnani Estate.",
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <PortalHeader
        eyebrow="Account"
        title="Support Requests"
        subtitle="Track and manage your inquiries with Simnani Estate."
      />
      <div className="mt-8">
        <SupportPanel tickets={SUPPORT_TICKETS} />
      </div>
    </div>
  );
}
