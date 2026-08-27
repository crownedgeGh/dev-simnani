import CommonPersonRegistrationWizard from "@/components/auth/CommonPersonRegistrationWizard";

export const metadata = {
  title: "Common Person Registration | Simnani Estate",
  description: "Register as an individual owner to list and sell your own property with Simnani Estate.",
};

export default function CommonPersonRegisterPage() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(245,180,0,0.08),_transparent_60%)]" />
      <CommonPersonRegistrationWizard />
    </div>
  );
}
