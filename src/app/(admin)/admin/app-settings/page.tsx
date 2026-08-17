"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Sparkles, CheckCircle2, Heart, ArrowRight } from "lucide-react";

export default function AdminAppSettingsPage() {
  const [appName, setAppName] = React.useState("NikahYuk");
  const [tagline, setTagline] = React.useState("Wedding & Event Companion");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [faviconUrl, setFaviconUrl] = React.useState("");
  const [heroTitle, setHeroTitle] = React.useState(
    "Kelola Pernikahan Impian Anda dengan Mudah & Terstruktur"
  );
  const [heroSubtitle, setHeroSubtitle] = React.useState(
    "Platform all-in-one terdepan untuk Pasangan Pengantin & Wedding Organizer (WO) di Indonesia. Dari Live Rundown, RSVP Tamu & WA Blast, hingga Anggaran Finansial."
  );
  const [ctaButtonText, setCtaButtonText] = React.useState("Mulai Workspace Gratis");
  const [contactEmail, setContactEmail] = React.useState("support@nikahyuk.com");

  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const loadBranding = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const result = await res.json();
        const rows: Array<{ key: string; value: Record<string, unknown> }> = result.data || [];
        const brandingRow = rows.find((r) => r.key === "app_branding_config");
        if (brandingRow && brandingRow.value) {
          const val = brandingRow.value;
          if (val.appName) setAppName(val.appName as string);
          if (val.tagline) setTagline(val.tagline as string);
          if (val.logoUrl) setLogoUrl(val.logoUrl as string);
          if (val.faviconUrl) setFaviconUrl(val.faviconUrl as string);
          if (val.heroTitle) setHeroTitle(val.heroTitle as string);
          if (val.heroSubtitle) setHeroSubtitle(val.heroSubtitle as string);
          if (val.ctaButtonText) setCtaButtonText(val.ctaButtonText as string);
          if (val.contactEmail) setContactEmail(val.contactEmail as string);
        }
      }
    } catch {
      // Ignore load error
    }
  }, []);

  React.useEffect(() => {
    loadBranding();
  }, [loadBranding]);

  async function handleSaveBranding(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const brandingValue = {
      appName,
      tagline,
      logoUrl,
      faviconUrl,
      heroTitle,
      heroSubtitle,
      ctaButtonText,
      contactEmail,
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "app_branding_config", value: brandingValue }),
      });

      if (res.ok) {
        toast({
          title: "Branding & Landing Page Disimpan",
          description: "Nama aplikasi, logo, dan konten landing page diperbarui di seluruh platform.",
          variant: "success",
        });
      } else {
        const err = await res.json();
        toast({
          title: "Gagal Menyimpan",
          description: err.error || "Internal error",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Kesalahan Jaringan",
        description: "Gagal menghubungkan ke server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Pengaturan Aplikasi & Landing Page
        </h1>
        <p className="text-sm text-muted-foreground">
          Atur Nama Aplikasi, Logo Icon, Favicon, Tagline, dan Konten Landing Page secara dinamis.
        </p>
      </div>

      <form onSubmit={handleSaveBranding} className="space-y-6">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" /> Identitas Branding Utama
            </CardTitle>
            <CardDescription>
              Nama aplikasi, tagline, dan aset logo icon yang tampil di sidebar & navbar.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Nama Aplikasi (App Name)</label>
              <Input
                type="text"
                placeholder="NikahYuk"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Tagline Sub-Judul</label>
              <Input
                type="text"
                placeholder="Wedding & Event Companion"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">URL Logo Icon (.png / .svg)</label>
              <Input
                type="text"
                placeholder="https://pub-cdn.nikahyuk.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Kosongkan untuk menggunakan ikon bawaan Heart.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">URL Favicon (.ico / .png)</label>
              <Input
                type="text"
                placeholder="https://pub-cdn.nikahyuk.com/favicon.ico"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Konten Landing Page (Hero Section)</CardTitle>
            <CardDescription>
              Atur pesan sambutan utama, deskripsi, dan tombol aksi di halaman depan `/`.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Hero Title (Judul Utama)</label>
                <Input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Hero Subtitle (Deskripsi Singkat)</label>
                <Input
                  type="text"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Teks Tombol CTA</label>
                  <Input
                    type="text"
                    value={ctaButtonText}
                    onChange={(e) => setCtaButtonText(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Email Kontak Support</label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-background to-accent/30 border border-border flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Live Preview Hero Landing Page
              </span>

              <div className="flex items-center space-x-2">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="h-6 w-6 object-contain" />
                ) : (
                  <Heart className="h-5 w-5 text-primary fill-primary" />
                )}
                <span className="font-serif text-lg font-bold text-primary">{appName}</span>
              </div>

              <h2 className="font-serif text-sm font-bold text-foreground max-w-xs leading-snug">
                {heroTitle}
              </h2>
              <p className="text-[11px] text-muted-foreground max-w-xs line-clamp-2">
                {heroSubtitle}
              </p>

              <Button size="sm" className="h-8 text-xs gap-1">
                {ctaButtonText} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>

          <CardFooter className="justify-end">
            <Button type="submit" disabled={loading} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {loading ? "Menyimpan..." : "Simpan Pengaturan Application Branding"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
