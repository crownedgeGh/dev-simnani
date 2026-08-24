import PortalHeader from "@/components/portal/PortalHeader";
import AccountNav from "@/components/portal/AccountNav";
import AccountProfile from "@/components/portal/AccountProfile";
import { DEMO_USER } from "@/lib/demoAccount";

export const metadata = {
  title: "My Profile | Simnani Estate",
  description: "View and manage your personal details.",
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <PortalHeader eyebrow="Account" title="My Profile" subtitle="View and manage your personal details." />
      <div className="mt-8">
        <AccountNav />
      </div>
      <div className="mt-8">
        <AccountProfile user={DEMO_USER} />
      </div>
    </div>
  );
}
