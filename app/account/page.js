import PortalHeader from "@/components/portal/PortalHeader";
import AccountProfile from "@/components/portal/AccountProfile";
import { DEMO_USER } from "@/lib/demoAccount";

export const metadata = {
  title: "My Profile | Simnani Estate",
  description: "View and manage your personal details.",
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <PortalHeader title="My Profile" />
      <div className="mt-6">
        <AccountProfile user={DEMO_USER} />
      </div>
    </div>
  );
}
