import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pemudaicmi-kotabekasi.org";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/studio/", "/draft/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
