import InvestorRegistrationWizard from "@/components/auth/InvestorRegistrationWizard";

export const metadata = {
  title: "Investor Registration | Simnani Estate",
  description: "Create an investor account to discover real estate investment opportunities.",
};

export default function InvestorRegisterPage() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(245,180,0,0.08),_transparent_60%)]" />
      <InvestorRegistrationWizard />
    </div>
  );
}
