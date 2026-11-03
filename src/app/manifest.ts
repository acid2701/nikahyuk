import type { MetadataRoute } from "next";
import { getAppBranding } from "@/lib/branding";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const branding = await getAppBranding();
  const iconUrl = branding.faviconUrl || branding.logoUrl || "/favicon.ico";

  return {
    name: branding.appName || "NikahYuk",
    short_name: branding.appName || "NikahYuk",
    description: branding.heroSubtitle || branding.tagline || "Wedding & Event Companion",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFF5F5",
    theme_color: "#FF385C",
    icons: [
      {
        src: iconUrl,
        sizes: "any",
        type: "image/webp",
      },
      {
        src: iconUrl,
        sizes: "192x192",
        type: "image/webp",
        purpose: "any",
      },
      {
        src: iconUrl,
        sizes: "512x512",
        type: "image/webp",
        purpose: "maskable",
      },
    ],
  };
}
