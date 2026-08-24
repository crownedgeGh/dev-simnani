import PortalHeader from "@/components/portal/PortalHeader";
import AccountNav from "@/components/portal/AccountNav";
import NotificationsPanel from "@/components/portal/NotificationsPanel";
import { NOTIFICATIONS, NOTIFICATION_CATEGORIES } from "@/lib/demoAccount";

export const metadata = {
  title: "Notifications | Simnani Estate",
  description: "Stay updated on your investments and enquiries.",
};

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <PortalHeader
        eyebrow="Account"
        title="Notifications"
        subtitle="Stay updated on your portfolio and account activity."
      />
      <div className="mt-8">
        <AccountNav />
      </div>
      <div className="mt-8">
        <NotificationsPanel notifications={NOTIFICATIONS} categories={NOTIFICATION_CATEGORIES} />
      </div>
    </div>
  );
}
