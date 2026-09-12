import PortalShell from "@/components/portal/PortalShell";
import CommonPersonHeader from "@/components/portal/common-person/CommonPersonHeader";
import MyListings from "@/components/portal/common-person/MyListings";

export const metadata = {
  title: "My Listings | Simnani Estate",
  description: "Manage the properties you've listed for sale or rent.",
};

export default function CommonPersonPortalPage() {
  return (
    <PortalShell>
      <CommonPersonHeader />
      <MyListings />
    </PortalShell>
  );
}
