import { prisma } from "@/lib/prisma";

export interface AppBranding {
  appName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaButtonText: string;
  contactEmail: string;
}

export const DEFAULT_BRANDING: AppBranding = {
  appName: "NikahYuk",
  tagline: "Wedding & Event Companion SaaS",
  logoUrl: "",
  faviconUrl: "",
  heroTitle: "Kelola Pernikahan Impian Anda dengan Mudah & Terstruktur",
  heroSubtitle:
    "Platform all-in-one terdepan untuk Pasangan Pengantin & Wedding Organizer (WO) di Indonesia. Dari Live Rundown, RSVP Tamu & WA Blast, hingga Anggaran Finansial.",
  ctaButtonText: "Mulai Workspace Gratis",
  contactEmail: "support@nikahyu.my.id",
};

export async function getAppBranding(): Promise<AppBranding> {
  try {
    const row = await prisma.systemSetting.findUnique({
      where: { key: "app_branding_config" },
    });

    if (row && row.value && typeof row.value === "object" && !Array.isArray(row.value)) {
      const val = row.value as Record<string, unknown>;
      return {
        appName: (val.appName as string)?.trim() || DEFAULT_BRANDING.appName,
        tagline: (val.tagline as string)?.trim() || DEFAULT_BRANDING.tagline,
        logoUrl: (val.logoUrl as string)?.trim() || DEFAULT_BRANDING.logoUrl,
        faviconUrl: (val.faviconUrl as string)?.trim() || DEFAULT_BRANDING.faviconUrl,
        heroTitle: (val.heroTitle as string)?.trim() || DEFAULT_BRANDING.heroTitle,
        heroSubtitle: (val.heroSubtitle as string)?.trim() || DEFAULT_BRANDING.heroSubtitle,
        ctaButtonText: (val.ctaButtonText as string)?.trim() || DEFAULT_BRANDING.ctaButtonText,
        contactEmail: (val.contactEmail as string)?.trim() || DEFAULT_BRANDING.contactEmail,
      };
    }
  } catch {
    // Fallback gracefully on query error
  }

  return DEFAULT_BRANDING;
}
