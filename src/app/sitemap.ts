import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://nikahyu.my.id";
  const now = new Date();

  // Static Public Routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vendor-register`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dynamic Public Vendor Profiles (SEO Indexing for registered vendors)
  try {
    const vendors = await prisma.vendor.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
      take: 100,
      orderBy: { updatedAt: "desc" },
    });

    const vendorRoutes: MetadataRoute.Sitemap = vendors.map((v: { id: string; updatedAt: Date | null }) => ({
      url: `${baseUrl}/v/${v.id}`,
      lastModified: v.updatedAt || now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...routes, ...vendorRoutes];
  } catch (error) {
    console.error("Failed to generate dynamic vendor sitemap:", error);
    return routes;
  }
}
