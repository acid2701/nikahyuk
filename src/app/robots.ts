import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://nikahyu.my.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/login",
          "/register",
          "/vendor-register",
          "/v/*",
          "/view/*",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/dashboard",
          "/dashboard/*",
          "/vendor/dashboard",
          "/vendor/dashboard/*",
          "/api/*",
          "/auth-callback",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
