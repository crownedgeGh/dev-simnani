import PortalHeader from "@/components/portal/PortalHeader";
import PropertyGrid from "@/components/property/PropertyGrid";
import { getPropertyById } from "@/lib/properties";
import { SAVED_PROPERTY_IDS } from "@/lib/demoAccount";

export const metadata = {
  title: "Saved Properties | Simnani Estate",
  description: "Your curated collection of luxury real estate.",
};

export default function SavedPropertiesPage() {
  const properties = SAVED_PROPERTY_IDS.map((id) => getPropertyById(id)).filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <PortalHeader
        eyebrow="Account"
        title="Saved Properties"
        subtitle="Your curated collection of luxury real estate and exclusive projects."
      />
      <div className="mt-8">
        <PropertyGrid
          properties={properties}
          emptyMessage="Your collection is empty. Properties you save will appear here."
        />
      </div>
    </div>
  );
}
