import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";

export default async function HomePage() {
  const user = await getCurrentUser();

  const row = await prisma.systemSetting.findUnique({
    where: { key: "app_branding_config" },
  });

  const branding = (row?.value as any) || {};

  const appName = branding.appName || "NikahYuk";
  const tagline = branding.tagline || "Wedding & Event Companion";
  const logoUrl = branding.logoUrl || "";
  const heroTitle =
    branding.heroTitle || "Kelola Pernikahan Impian Anda dengan Mudah & Terstruktur";
  const heroSubtitle =
    branding.heroSubtitle ||
    "Platform all-in-one terdepan untuk Pasangan Pengantin & Wedding Organizer (WO) di Indonesia. Dari Live Rundown, RSVP Tamu & WA Blast, hingga Anggaran Finansial.";
  const ctaButtonText = branding.ctaButtonText || "Mulai Workspace Gratis";
  const contactEmail = branding.contactEmail || "support@nikahyuk.com";

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      <LandingNavbar appName={appName} logoUrl={logoUrl} isLoggedIn={!!user} />

      <main className="flex-1">
        <LandingHero
          heroTitle={heroTitle}
          heroSubtitle={heroSubtitle}
          ctaButtonText={ctaButtonText}
          isLoggedIn={!!user}
        />

        <LandingFeatures />

        <LandingFaq />
      </main>

      <LandingFooter
        appName={appName}
        tagline={tagline}
        logoUrl={logoUrl}
        contactEmail={contactEmail}
      />
    </div>
  );
}
