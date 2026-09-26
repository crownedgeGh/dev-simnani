import { redirect, notFound } from "next/navigation";
import { MdAddHome } from "react-icons/md";
import BackButton from "@/components/layout/BackButton";
import PostPropertyGuardedForm from "@/components/property/PostPropertyGuardedForm";
import RequireAuth from "@/components/auth/RequireAuth";
import { getCurrentUser } from "@/lib/session";
import { getPropertyById } from "@/lib/propertiesServer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Property | Simnani Estate",
  description: "Update the details of your property listing.",
};

export default async function EditPropertyPage({ params }) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth");
  }

  const property = await getPropertyById(id);
  if (!property) {
    notFound();
  }

  if (property.ownerId !== user.accountId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3">
          <BackButton />
          <h1 className="font-display text-2xl text-cream sm:text-3xl">Access Denied</h1>
        </div>
        <p className="mt-4 text-sm text-muted">
          You can only edit properties that you posted yourself.
        </p>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(245,180,0,0.08),_transparent_60%)]" />

        <div className="mx-auto max-w-3xl">
          <PostPropertyGuardedForm editId={id}>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold-400/10 text-gold-400">
              <MdAddHome className="h-7 w-7" />
            </span>
            <div>
              <h1 className="font-display text-2xl text-cream sm:text-3xl">Edit Your Property</h1>
              <p className="mt-1 text-sm text-muted">
                Update the details below and resubmit for review.
              </p>
            </div>
          </PostPropertyGuardedForm>
        </div>
      </div>
    </RequireAuth>
  );
}
