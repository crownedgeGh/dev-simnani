import BrokerRegistrationWizard from "@/components/auth/BrokerRegistrationWizard";

export const metadata = {
  title: "Broker Registration | Simnani Estate",
  description: "Register as a broker to sell properties and manage clients with Simnani Estate.",
};

export default function BrokerRegisterPage() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(245,180,0,0.08),_transparent_60%)]" />
      <BrokerRegistrationWizard />
    </div>
  );
}
