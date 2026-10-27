import { notFound } from "next/navigation";
import { getPublicVendorPartnerByIdAction } from "@/actions/vendor-partner-actions";
import { WAButton } from "@/components/shared/whatsapp/wa-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  MapPin,
  Star,
  ShieldCheck,
  FileText,
  Package,
  Check,
  Zap,
  Users,
  MessageSquare,
  ArrowLeft,
  Share2,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ vendorId: string }>;
}): Promise<Metadata> {
  const { vendorId } = await props.params;
  const partner = await getPublicVendorPartnerByIdAction(vendorId);

  if (!partner) {
    return {
      title: "Vendor Tidak Ditemukan - NikahYuk",
    };
  }

  return {
    title: `${partner.company_name} (${partner.category}) - Vendor & Event Partner NikahYuk`,
    description: `Katalog & penawaran paket acara resmi dari ${partner.company_name} di ${partner.city}, ${partner.province}. Layanan Pernikahan, Lamaran, Birthday, Corporate Event & Spesial Gathering.`,
  };
}

export default async function PublicVendorPage(props: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await props.params;
  const partner = await getPublicVendorPartnerByIdAction(vendorId);

  if (!partner) {
    notFound();
  }

  const packages = partner.packages || [];
  const activePackages = packages.filter((p) => p.is_active !== false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Public Header */}
      <header className="border-b border-border bg-card sticky top-0 z-20 h-14 px-4 sm:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-serif text-xl font-bold text-primary">NikahYuk</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">• Partner & Event Catalog</span>
        </Link>

        <div className="flex items-center space-x-2">
          {partner.sanitized_phone && (
            <WAButton
              phone={partner.sanitized_phone}
              templateString="Halo {nama_vendor}, saya tertarik berkonsultasi untuk paket penawaran acara di NikahYuk."
              variables={{ nama_vendor: partner.company_name }}
              label="Tanya via WA"
              size="sm"
            />
          )}
          <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs gap-1.5">
            <Link href="/login">
              <Zap className="h-3.5 w-3.5 fill-white" /> Impor ke Acara Saya
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Vendor Public Landing Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Vendor Header Hero Card */}
        <Card className="border-border/80 bg-gradient-to-r from-amber-500/10 via-card to-card p-6 rounded-xl space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-3xl font-bold text-foreground">
                  {partner.company_name}
                </h1>
                {partner.is_verified && (
                  <Badge className="bg-emerald-600 text-white text-xs gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Official Partner Verified ✅
                  </Badge>
                )}
                <div className="flex items-center text-amber-500 font-bold text-sm gap-1 font-mono">
                  <Star className="h-4 w-4 fill-amber-500" />
                  <span>{partner.rating_avg || "5.0"}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> {partner.city}, {partner.province} • <span className="uppercase font-semibold text-foreground">{partner.category}</span>
              </p>

              <p className="text-xs text-foreground/80 leading-relaxed max-w-2xl whitespace-pre-line pt-1">
                {partner.description || "Mitra vendor & penyelenggara acara terverifikasi ekosistem NikahYuk SaaS."}
              </p>

              <div className="flex items-center space-x-3 text-xs pt-2">
                <span className="font-medium text-foreground">PIC: {partner.pic_name}</span>
                {partner.pricelist_r2_key && (
                  <a
                    href={`/api/storage/presign?key=${encodeURIComponent(partner.pricelist_r2_key)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <FileText className="h-3.5 w-3.5 text-primary" /> Unduh Brosur Pricelist (PDF R2)
                  </a>
                )}
              </div>
            </div>

            <div className="bg-amber-500/10 p-3.5 rounded-lg border border-amber-500/30 text-center shrink-0 space-y-1">
              <span className="text-[10px] text-amber-700 uppercase font-bold block">Kisaran Penawaran</span>
              <span className="font-mono font-bold text-emerald-600 text-lg block">
                Rp {Number(partner.min_price || 0).toLocaleString("id-ID")}
                {partner.max_price ? ` - Rp ${Number(partner.max_price).toLocaleString("id-ID")}` : ""}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                Tier: {partner.price_tier || "Standard"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Packages List Header */}
        <div className="space-y-1 pt-2">
          <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-500" /> Paket Penawaran Resmi ({activePackages.length} Paket)
          </h2>
          <p className="text-xs text-muted-foreground">
            Pilih paket penawaran yang sesuai dan klik impor untuk menambahkannya ke rencana anggaran acara Anda (Pernikahan, Lamaran, Ulang Tahun, atau Corporate Event).
          </p>
        </div>

        {/* Active Packages List View */}
        {activePackages.length === 0 ? (
          <Card className="p-8 text-center border-dashed space-y-2">
            <Building2 className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium text-foreground">Belum Ada Paket Penawaran Dipublikasikan</p>
            <p className="text-xs text-muted-foreground">
              Silakan hubungi PIC vendor via WhatsApp untuk meminta penawaran custom sesuai jenis acara Anda.
            </p>
          </Card>
        ) : (
          <div className="space-y-4 flex flex-col">
            {activePackages.map((pkg) => (
              <Card key={pkg.id} className="border-border/80 shadow-xs hover:shadow-md transition-all">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h3 className="font-serif font-bold text-lg text-foreground">
                        {pkg.package_name}
                      </h3>
                      {pkg.capacity_pax && pkg.capacity_pax > 0 ? (
                        <Badge variant="secondary" className="text-xs font-mono gap-1">
                          <Users className="h-3.5 w-3.5" /> {pkg.capacity_pax} Pax
                        </Badge>
                      ) : null}
                    </div>

                    {pkg.description && (
                      <p className="text-xs text-muted-foreground whitespace-pre-line">
                        {pkg.description}
                      </p>
                    )}

                    {pkg.features_include && pkg.features_include.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                          Fasilitas & Include Paket:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {pkg.features_include.map((feat, fIdx) => (
                            <span key={fIdx} className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/30">
                              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-stretch md:items-end justify-center space-y-3 shrink-0 border-t md:border-t-0 md:border-l border-border/60 pt-3 md:pt-0 md:pl-5">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Harga Resmi:</span>
                      <span className="font-mono font-bold text-emerald-600 text-xl">
                        Rp {Number(pkg.price).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs gap-1.5 shadow-xs">
                      <Link href="/login">
                        <Zap className="h-3.5 w-3.5 fill-white" /> Impor Paket Ini (1-Click)
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © 2026 NikahYuk SaaS Partner Ecosystem • All Rights Reserved.
      </footer>
    </div>
  );
}
