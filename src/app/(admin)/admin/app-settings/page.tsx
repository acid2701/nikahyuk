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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MediaUploaderDropzone, UploadedFileMeta } from "@/components/shared/media-uploader/dropzone";
import { Settings, Sparkles, CheckCircle2, Heart, ArrowRight, UploadCloud, Image as ImageIcon } from "lucide-react";

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

  function handleLogoUploaded(meta: UploadedFileMeta) {
    const finalUrl = meta.public_url || `/api/storage/presign?key=${encodeURIComponent(meta.r2_file_key)}`;
    setLogoUrl(finalUrl);
    toast({
      title: "Logo Icon Diunggah ke R2!",
      description: `File '${meta.file_name}' tersimpan di Cloudflare R2 bucket.`,
      variant: "success",
    });
  }

  function handleFaviconUploaded(meta: UploadedFileMeta) {
    const finalUrl = meta.public_url || `/api/storage/presign?key=${encodeURIComponent(meta.r2_file_key)}`;
    setFaviconUrl(finalUrl);
    toast({
      title: "Favicon Diunggah ke R2!",
      description: `Favicon '${meta.file_name}' tersimpan di Cloudflare R2 bucket.`,
      variant: "success",
    });
  }

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
          title: "Branding & Asset R2 Disimpan",
          description: "Pengaturan logo icon R2 & landing page diperbarui di seluruh platform.",
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
          Pengaturan Aplikasi & Branding Asset R2
        </h1>
        <p className="text-sm text-muted-foreground">
          Unggah Logo Icon & Favicon langsung ke Cloudflare R2 Bucket dan atur konten Landing Page secara dinamis.
        </p>
      </div>

      <form onSubmit={handleSaveBranding} className="space-y-6">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" /> Identitas App & Unggah Asset ke Cloudflare R2
            </CardTitle>
            <CardDescription>
              Nama aplikasi, tagline, serta dropzone pengunggahan berkas Logo & Favicon langsung ke S3 R2.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
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
            </div>

            {/* R2 DROPZONES FOR LOGO AND FAVICON */}
            <div className="grid gap-6 md:grid-cols-2 border-t border-border pt-4">
              {/* Logo Upload Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-primary" /> Upload Logo Icon ke R2
                  </label>
                  {logoUrl && (
                    <Badge variant="success" className="text-[10px] gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Logo Active
                    </Badge>
                  )}
                </div>

                <MediaUploaderDropzone
                  weddingId="system"
                  folder="documents"
                  allowedMimeTypes={["image/jpeg", "image/png", "image/webp", "image/svg+xml"]}
                  onUploadSuccess={handleLogoUploaded}
                  onUploadError={(msg) =>
                    toast({
                      title: "Gagal Upload Logo",
                      description: msg,
                      variant: "destructive",
                    })
                  }
                />

                {logoUrl && (
                  <div className="p-3 bg-muted/40 rounded-lg border border-border flex items-center space-x-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo Preview" className="h-10 w-10 object-contain p-1 bg-white rounded border" />
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">Asset Logo Terpasang</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">{logoUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Favicon Upload Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <UploadCloud className="h-4 w-4 text-purple-500" /> Upload Favicon ke R2
                  </label>
                  {faviconUrl && (
                    <Badge variant="success" className="text-[10px] gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Favicon Active
                    </Badge>
                  )}
                </div>

                <MediaUploaderDropzone
                  weddingId="system"
                  folder="documents"
                  allowedMimeTypes={["image/jpeg", "image/png", "image/x-icon", "image/vnd.microsoft.icon", "image/svg+xml"]}
                  onUploadSuccess={handleFaviconUploaded}
                  onUploadError={(msg) =>
                    toast({
                      title: "Gagal Upload Favicon",
                      description: msg,
                      variant: "destructive",
                    })
                  }
                />

                {faviconUrl && (
                  <div className="p-3 bg-muted/40 rounded-lg border border-border flex items-center space-x-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={faviconUrl} alt="Favicon Preview" className="h-8 w-8 object-contain p-1 bg-white rounded border" />
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">Asset Favicon Terpasang</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">{faviconUrl}</p>
                    </div>
                  </div>
                )}
              </div>
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
