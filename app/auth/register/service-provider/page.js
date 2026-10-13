import ServiceProviderRegistrationWizard from "@/components/auth/ServiceProviderRegistrationWizard";
import RequireGuest from "@/components/auth/RequireGuest";

export const metadata = {
  title: "Service Provider Registration | Simnani Estate",
  description:
    "Register as a civil contractor, industrial EPC engineer or agri-infrastructure developer with Simnani Estate.",
};

export default function ServiceProviderRegisterPage() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(245,180,0,0.08),_transparent_60%)]" />
      <RequireGuest>
        <ServiceProviderRegistrationWizard />
      </RequireGuest>
    </div>
  );
}
