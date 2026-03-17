import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelUrl = process.env.VERCEL_URL?.trim();

  const base =
    publicSiteUrl ??
    (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
