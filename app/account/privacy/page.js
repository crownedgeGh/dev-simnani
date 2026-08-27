import PortalHeader from "@/components/portal/PortalHeader";
import PrivacyPanel from "@/components/portal/PrivacyPanel";

export const metadata = {
  title: "Privacy & Security | Simnani Estate",
  description: "Manage your data usage, permissions and account security.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <PortalHeader
        eyebrow="Account"
        title="Privacy & Security"
        subtitle="Manage how your data is used and control your account access."
      />
      <div className="mt-8">
        <PrivacyPanel />
      </div>
    </div>
  );
}
