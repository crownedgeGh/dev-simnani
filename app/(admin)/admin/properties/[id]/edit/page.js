import AdminEditPropertyForm from "@/components/admin/properties/AdminEditPropertyForm";

export const metadata = {
  title: "Edit Property | Admin Panel | Simnani Estate",
  description: "Update property listing details, media, and platform visibility",
};

export default async function AdminEditPropertyPage({ params }) {
  const resolvedParams = await params;
  return <AdminEditPropertyForm propertyId={resolvedParams?.id} />;
}
