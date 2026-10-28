import BackButton from "@/components/layout/BackButton";
import { OthersServiceCards } from "@/components/project/OthersServiceCard";

export const metadata = {
  title: "Others — Home Loans & Plot Availability | Simnani Estate",
  description: "Compare home loan deals and check live plot availability for RERA-registered layouts.",
};

export default function OthersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="flex items-center gap-3">
        <BackButton href="/" />
        <h1 className="font-display text-3xl text-cream sm:text-4xl">Others</h1>
      </div>

      <OthersServiceCards />
    </div>
  );
}
