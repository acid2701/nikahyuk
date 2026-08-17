import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    contactEmail: "support@nikahyuk.com",
  };

  try {
    const supabase = await createClient();

    const { data: row } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "app_branding_config")
      .single();

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
