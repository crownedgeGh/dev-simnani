import { getSiteUrl } from "@/lib/siteUrl";

export default function robots() {
  const siteUrl = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/portal", "/account", "/admin", "/api", "/post-property"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
