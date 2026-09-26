import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getPropertyById } from "@/lib/propertiesServer";
import PropertyDetailContent from "@/components/property/PropertyDetailContent";
import ListingOwnerActions from "@/components/portal/ListingOwnerActions";
import CorrectionHoldBanner from "@/components/portal/CorrectionHoldBanner";
import BackButton from "@/components/layout/BackButton";
import ForceBackRedirect from "@/components/layout/ForceBackRedirect";

export const dynamic = "force-dynamic";

export default async function OwnerListingPage({ params }) {
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
        <ForceBackRedirect href="/portal/common-person" />
        <div className="flex items-center justify-center gap-3">
          <BackButton href="/portal/common-person" />
          <h1 className="font-display text-2xl text-cream sm:text-3xl">Access Denied</h1>
        </div>
        <p className="mt-4 text-sm text-muted">
          This listing management page belongs to a different account. You can only manage
          properties that you posted yourself.
        </p>
      </div>
    );
  }

  return (
    <>
      <ForceBackRedirect href="/portal/common-person" />
      <CorrectionHoldBanner correctionRequest={property.correctionRequest} propertyId={property.id} />
      <PropertyDetailContent
        property={property}
        eyebrow="Private Listing View"
        sidebar={<ListingOwnerActions property={property} />}
        backHref="/portal/common-person"
      />
    </>
  );
}
