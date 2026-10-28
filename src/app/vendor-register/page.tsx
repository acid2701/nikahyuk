import { Metadata } from "next";
import Link from "next/link";
import { getAppBranding } from "@/lib/branding";
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";
import { PublicVendorRegistrationForm } from "@/components/modules/vendors/public-vendor-registration-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Layers, ShieldCheck, ArrowRight } from "lucide-react";

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

      {/* 2. RESPONSIVE HERO VALUE PROPOSITION */}
      <section className="relative overflow-hidden pt-8 pb-6 sm:pt-12 sm:pb-10 px-4 sm:px-6 lg:px-8 bg-muted/20 border-b border-border/60">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          {/* Account Type Pill Toggle */}
          <div className="flex items-center justify-center p-1 bg-muted/80 rounded-full border border-border/60 max-w-xs mx-auto">
            <Link
              href="/register"
              className="flex-1 py-1 px-3 text-xs font-medium rounded-full text-muted-foreground hover:text-foreground text-center transition-colors"
            >
              Calon Pengantin
            </Link>
            <span className="flex-1 py-1 px-3 text-xs font-semibold rounded-full bg-background text-foreground shadow-xs text-center">
              Mitra Vendor
            </span>
          </div>

          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 font-medium mx-auto inline-flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" /> Program Kemitraan Vendor B2B
          </Badge>

          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Perluas Jangkauan Usaha Pernikahan Anda Bersama <span className="text-primary">{branding.appName}</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Terhubung langsung dengan ribuan calon pasangan pengantin yang sedang merencanakan hari bahagia mereka. Promosikan paket, portofolio brosur digital, dan terima pesanan tanpa potongan rumit.
          </p>

          {/* Value Prop Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-foreground">0% Komisi Pendaftaran</h4>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Daftar instan gratis tanpa biaya langganan awal tersembunyi.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-foreground">Akses Calon Pengantin</h4>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Klien menjangkau nomor WhatsApp resmi Anda secara langsung.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
                <Layers className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-foreground">Katalog Brosur R2</h4>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Upload file PDF dan pricelist berkecepatan tinggi Cloudflare R2.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN FORM CONTAINER (RESPONSIVE FOR ALL SCREEN SIZES) */}
      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
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
