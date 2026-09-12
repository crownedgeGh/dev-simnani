import PostPropertyForm from "@/components/property/PostPropertyForm";
import { MdAddHome } from "react-icons/md";

export const metadata = {
  title: "Edit Property | Simnani Estate",
  description: "Update the details of your property listing.",
};

export default async function EditPropertyPage({ params }) {
  const { id } = await params;

  return (
    <div className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(245,180,0,0.08),_transparent_60%)]" />

      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold-400/10 text-gold-400">
            <MdAddHome className="h-7 w-7" />
          </span>
          <div>
            <h1 className="font-display text-2xl text-cream sm:text-3xl">Edit Your Property</h1>
            <p className="mt-1 text-sm text-muted">
              Update the details below and resubmit for review.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <PostPropertyForm editId={id} />
        </div>
      </div>
    </div>
  );
}
