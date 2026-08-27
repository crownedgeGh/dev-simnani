import PostPropertyForm from "@/components/property/PostPropertyForm";
import { MdAddHome } from "react-icons/md";

export const metadata = {
  title: "Post Your Property | Simnani Estate",
  description: "List your property in minutes — no images or full address required.",
};

export default function PostPropertyPage() {
  return (
    <div className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(245,180,0,0.08),_transparent_60%)]" />

      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold-400/10 text-gold-400">
            <MdAddHome className="h-7 w-7" />
          </span>
          <div>
            <h1 className="font-display text-2xl text-cream sm:text-3xl">Post Your Property</h1>
            <p className="mt-1 text-sm text-muted">
              Fill in the details below — no image or full address required.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <PostPropertyForm />
        </div>
      </div>
    </div>
  );
}
