import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const defaultBranding = {
    appName: "NikahYuk",
    tagline: "Wedding & Event Companion",
    logoUrl: "",
    faviconUrl: "",
    heroTitle: "Kelola Pernikahan Impian Anda dengan Mudah & Terstruktur",
    heroSubtitle:
      "Platform all-in-one terdepan untuk Pasangan Pengantin & Wedding Organizer (WO) di Indonesia. Dari Live Rundown, RSVP Tamu & WA Blast, hingga Anggaran Finansial.",
    ctaButtonText: "Mulai Workspace Gratis",
    contactEmail: "support@nikahyu.my.id",
  };

  try {
    const row = await prisma.systemSetting.findUnique({
      where: { key: "app_branding_config" },
    });

    if (row && row.value) {
      return NextResponse.json({
        branding: {
          ...defaultBranding,
          ...(row.value as Record<string, unknown>),
        },
      });
    }

    return NextResponse.json({ branding: defaultBranding });
  } catch {
    return NextResponse.json({ branding: defaultBranding });
  }
}
