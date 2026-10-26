import AuthCard from "@/components/auth/AuthCard";
import RequireGuest from "@/components/auth/RequireGuest";

export const metadata = {
  title: "Login | Simnani Estate",
  description:
    "Sign in to your Simnani Estate account to manage properties, investments and enquiries.",
};

export default function AuthPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(245,180,0,0.08),_transparent_60%)]" />
      <RequireGuest>
        <AuthCard />
      </RequireGuest>
    </div>
  );
}
