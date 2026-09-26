import { MdAddHome } from "react-icons/md";
import PostPropertyGuardedForm from "@/components/property/PostPropertyGuardedForm";

export const metadata = {
  title: "Post Your Property | Simnani Estate",
  description: "List your property in minutes — no images or full address required.",
};

export default function PostPropertyPage() {
  return (
    <div className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(245,180,0,0.08),_transparent_60%)]" />

      <div className="mx-auto max-w-3xl">
        <PostPropertyGuardedForm backButtonClassName="rounded-sm">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-400/30 bg-gold-400/10 text-gold-400 sm:h-14 sm:w-14">
            <MdAddHome className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
          <h1 className="font-display text-xl leading-tight text-cream sm:text-3xl">Post Your Property</h1>
        </PostPropertyGuardedForm>
      </div>
    </div>
  );
}
