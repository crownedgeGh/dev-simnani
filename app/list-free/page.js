import ListFreeLanding from "@/components/property/ListFreeLanding";

const TITLE = "Sell or Rent Your Property — List Free | Simnani Estate";
const DESCRIPTION =
  "Want to sell or rent your property? Post it free on Simnani Estate and get genuine buyer & tenant enquiries. Owners 5 free listings, brokers 20 free listings.";

const IMAGE = { url: "/whatspCover.webp", width: 1200, height: 630, alt: "Simnani Estate" };

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, siteName: "Simnani Estate", type: "website", images: [IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [IMAGE.url] },
};

export default function ListFreePage() {
  return <ListFreeLanding />;
}
