import { Metadata } from "next";
import Link from "next/link";
import { getAppBranding } from "@/lib/branding";
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";
import { PublicVendorRegistrationForm } from "@/components/modules/vendors/public-vendor-registration-form";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getAppBranding();
  return {
    title: `Pendaftaran Mitra Vendor Pernikahan | ${branding.appName}`,
    description: `Daftarkan layanan usaha vendor pernikahan Anda di platform ${branding.appName} SaaS dan dapatkan jangkauan ke ribuan calon pasangan pengantin di seluruh Indonesia.`,
  };
}

export default async function VendorRegisterPage() {
  const branding = await getAppBranding();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20">
      {/* 1. TOP RESPONSIVE NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.appName}
                className="h-8 w-auto max-w-[140px] object-contain rounded-md"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                NY
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-sans text-2xl font-bold tracking-tight text-primary">
                {branding.appName} Vendor
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono hidden sm:inline">
                Mitra Vendor Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex text-xs font-semibold">
              <Link href="/login">
                Masuk <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="sm:hidden text-xs">
              <Link href="/login">Masuk</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 2. MAIN FORM CONTAINER (CLEAN & CENTERED) */}
      <main className="flex-1 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <PublicVendorRegistrationForm
          appName={branding.appName}
          logoUrl={branding.logoUrl}
        />
      </main>

      {/* 4. CLEAN FOOTER */}
      <footer className="border-t border-border/60 py-6 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {branding.appName} Platform. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">Beranda</Link>
            <span>•</span>
            <Link href="/login" className="hover:text-foreground transition-colors">Masuk</Link>
            <span>•</span>
            <Link href="/register" className="hover:text-foreground transition-colors">Daftar Pengantin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
