import AccountTypeSelect from "@/components/auth/AccountTypeSelect";

export const metadata = {
  title: "Create Account | Simnani Estate",
  description:
    "Choose your account type and join Simnani Estate as a buyer, investor, broker or freelancer.",
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(245,180,0,0.08),_transparent_60%)]" />
      <AccountTypeSelect />
    </div>
  );
}
