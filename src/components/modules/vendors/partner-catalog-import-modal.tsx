"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getApprovedVendorPartnersAction,
  importPartnerPackageToWeddingAction,
} from "@/actions/vendor-partner-actions";
import { VendorPartnerItem, VendorPackageItem } from "@/types/vendor-partner.types";
import { useToast } from "@/components/ui/use-toast";
import { WAButton } from "@/components/shared/whatsapp/wa-button";
import {
  fetchProvinces,
  fetchRegencies,
  formatRegionName,
  RegionItem,
} from "@/lib/location/indonesia-regions";
import {
  Building2,
  Search,
  Zap,
  MapPin,
  FileText,
  Star,
  Package,
  ChevronLeft,
  ChevronRight,
  Flame,
  Check,
  Info,
  Users,
} from "lucide-react";

interface PartnerCatalogImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: string;
  eventId?: string;
  onImportSuccess?: () => void;
}

export function PartnerCatalogImportModal({
  open,
  onOpenChange,
  weddingId,
  eventId,
  onImportSuccess,
}: PartnerCatalogImportModalProps) {
  const [partners, setPartners] = React.useState<VendorPartnerItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [importingId, setImportingId] = React.useState<string | null>(null);

  // Selected package per partner map
  const [selectedPackages, setSelectedPackages] = React.useState<Record<string, string>>({});

  // Full Package Detail Breakdown Modal State
  const [inspectingPackage, setInspectingPackage] = React.useState<{
    partner: VendorPartnerItem;
    pkg: VendorPackageItem;
  } | null>(null);

  // Filter States
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [selectedProvId, setSelectedProvId] = React.useState("all");
  const [city, setCity] = React.useState("all");
  const [priceTier, setPriceTier] = React.useState("all");

  // Sorting & Pagination States
  const [sortBy, setSortBy] = React.useState("popular"); // popular | rating_desc | price_asc | price_desc | latest
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 6;

  // Region API States
  const [provinces, setProvinces] = React.useState<RegionItem[]>([]);
  const [regencies, setRegencies] = React.useState<RegionItem[]>([]);

  const { toast } = useToast();

  React.useEffect(() => {
    async function loadProvinces() {
      const data = await fetchProvinces();
      setProvinces(data);
    }
    if (open) {
      loadProvinces();
    }
  }, [open]);

  React.useEffect(() => {
    if (selectedProvId === "all") {
      setRegencies([]);
      setCity("all");
      return;
    }

    async function loadRegencies() {
      const data = await fetchRegencies(selectedProvId);
      setRegencies(data);
    }
    loadRegencies();
  }, [selectedProvId]);

  const fetchPartners = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getApprovedVendorPartnersAction({
        search,
        category,
        city: city !== "all" ? city : undefined,
        priceTier,
      });
      setPartners(data);
      setCurrentPage(1); // Reset page on filter change
    } catch (err) {
      console.warn("Failed fetching approved vendor partners:", err);
    } finally {
      setLoading(false);
    }
  }, [search, category, city, priceTier]);

  React.useEffect(() => {
    if (open) {
      fetchPartners();
    }
  }, [open, fetchPartners]);

  // POPULARITY SORTING ALGORITHM
  const sortedPartners = React.useMemo(() => {
    return [...partners].sort((a, b) => {
      if (sortBy === "popular") {
        const ratingDiff = (b.rating_avg || 5) - (a.rating_avg || 5);
        if (ratingDiff !== 0) return ratingDiff;
        const pkgDiff = (b.packages?.length || 0) - (a.packages?.length || 0);
        return pkgDiff;
      }
      if (sortBy === "rating_desc") return (b.rating_avg || 5) - (a.rating_avg || 5);
      if (sortBy === "price_asc") return (a.min_price || 0) - (b.min_price || 0);
      if (sortBy === "price_desc") return (b.max_price || 0) - (a.max_price || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [partners, sortBy]);

  // PAGINATION COMPUTATION
  const totalPages = Math.ceil(sortedPartners.length / pageSize) || 1;
  const paginatedPartners = sortedPartners.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  async function handleImportPackage(partner: VendorPartnerItem) {
    const pkgId = selectedPackages[partner.id] || null;
    setImportingId(partner.id);

    try {
      await importPartnerPackageToWeddingAction(partner.id, pkgId, weddingId, eventId);
      toast({
        title: "Vendor & Paket Berhasil Diimpor!",
        description: `'${partner.company_name}' otomatis ditambahkan ke daftar vendor & budget pernikahan Anda.`,
        variant: "success",
      });
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      toast({
        title: "Gagal Mengimpor Vendor",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setImportingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[11px] gap-1">
              <Star className="h-3 w-3 fill-amber-500" /> Katalog Vendor Rekomendasi Partner
            </Badge>
            <div className="flex items-center space-x-2 text-xs">
              <Flame className="h-4 w-4 text-amber-500" />
              <span className="font-semibold text-foreground">Diurutkan Berdasarkan Popularitas</span>
            </div>
          </div>
          <DialogTitle className="font-serif text-2xl pt-1">
            Jelajahi & Impor Vendor Partner NikahYuk
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Cari calon vendor terpercaya berdasarkan provinsi, kota/kabupaten, dan kategori. Pilih paket penawaran yang sesuai dan klik tombol <span className="font-semibold text-foreground">1-Click Import</span>.
          </DialogDescription>
        </DialogHeader>

        {/* 6 SMART FILTERS & SORTING BAR */}
        <div className="grid gap-2 sm:grid-cols-6 bg-muted/40 p-3 rounded-lg border border-border/60 text-xs">
          {/* Keyword Search */}
          <div className="relative col-span-1 sm:col-span-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          {/* Kategori Filter */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Kategori Layanan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="Catering">🍱 Catering</SelectItem>
              <SelectItem value="Venue">🏛️ Venue & Gedung</SelectItem>
              <SelectItem value="Dekorasi">🌸 Dekorasi</SelectItem>
              <SelectItem value="MUA & Busana">💄 MUA & Busana</SelectItem>
              <SelectItem value="Dokumentasi">📷 Dokumentasi</SelectItem>
              <SelectItem value="Entertainment">🎵 Entertainment</SelectItem>
              <SelectItem value="Wedding Organizer">📋 Wedding Organizer</SelectItem>
            </SelectContent>
          </Select>

          {/* Dynamic Provinsi Filter (API Wilayah) */}
          <Select value={selectedProvId} onValueChange={(val) => {
            setSelectedProvId(val);
            setCity("all");
          }}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Semua Provinsi" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">Semua Provinsi</SelectItem>
              {provinces.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  {formatRegionName(p.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Dynamic Kota Filter (API Wilayah) */}
          <Select
            value={city}
            onValueChange={setCity}
            disabled={selectedProvId === "all"}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder={selectedProvId === "all" ? "Semua Kota" : "Pilih Kota..."} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">Semua Kota</SelectItem>
              {regencies.map((r) => {
                const formattedName = formatRegionName(r.name);
                return (
                  <SelectItem key={r.id} value={formattedName} className="text-xs">
                    {formattedName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Budget Tier Filter */}
          <Select value={priceTier} onValueChange={setPriceTier}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Tier Budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tier Budget</SelectItem>
              <SelectItem value="budget">🟢 Budget / Terjangkau</SelectItem>
              <SelectItem value="standard">🔵 Standard / Menengah</SelectItem>
              <SelectItem value="premium">🟡 Premium / Mewah</SelectItem>
              <SelectItem value="luxury">👑 Luxury / Exclusive</SelectItem>
            </SelectContent>
          </Select>

          {/* POPULARITY & SORT DROPDOWN */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 text-xs bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 font-semibold">
              <SelectValue placeholder="Urutkan..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">🔥 Urutkan: Terpopuler</SelectItem>
              <SelectItem value="rating_desc">⭐ Rating Tertinggi</SelectItem>
              <SelectItem value="price_asc">💰 Harga Terendah</SelectItem>
              <SelectItem value="price_desc">💎 Harga Tertinggi</SelectItem>
              <SelectItem value="latest">🆕 Pendaftaran Terbaru</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* VENDOR HORIZONTAL LIST VIEW WITH ULTRA-INFORMATIVE PACKAGE SUMMARY BOX */}
        {loading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Memuat Katalog Vendor Partner Terpopuler...
          </div>
        ) : sortedPartners.length === 0 ? (
          <div className="py-12 text-center space-y-2 border border-dashed rounded-lg">
            <Building2 className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium text-foreground">Tidak Ada Vendor Sesuai Filter</p>
            <p className="text-xs text-muted-foreground">
              Coba ubah filter pencarian provinsi, kota, kategori, atau tier budget.
            </p>
          </div>
        ) : (
          <div className="space-y-3 flex flex-col pt-2">
            {paginatedPartners.map((partner) => {
              const activePkgId = selectedPackages[partner.id] || (partner.packages && partner.packages[0]?.id);
              const activePkg = partner.packages?.find((p) => p.id === activePkgId);
              const activePrice = activePkg ? Number(activePkg.price) : Number(partner.min_price || 0);

              return (
                <Card
                  key={partner.id}
                  className="border-border/80 shadow-xs hover:shadow-md transition-all"
                >
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* LEFT SECTION: Name, Verified Badge, Rating, Category, Location, PIC & WA */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="font-serif font-bold text-base text-foreground leading-none">
                          {partner.company_name}
                        </h3>
                        {partner.is_verified && (
                          <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0 font-sans">
                            Partner ✅
                          </Badge>
                        )}
                        <div className="flex items-center text-amber-500 font-bold text-xs gap-1 font-mono">
                          <Star className="h-3.5 w-3.5 fill-amber-500" />
                          <span>{partner.rating_avg || "5.0"}</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                          {partner.category}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> {partner.city}, {partner.province}
                      </p>

                      <div className="flex items-center space-x-2 text-xs pt-0.5">
                        <span className="font-medium text-foreground">PIC: {partner.pic_name}</span>
                        {partner.sanitized_phone && (
                          <WAButton
                            phone={partner.sanitized_phone}
                            templateString="Halo {nama_vendor}, dari pengantin NikahYuk SaaS."
                            variables={{ nama_vendor: partner.company_name }}
                            label="WA"
                            size="sm"
                          />
                        )}
                      </div>
                    </div>

                    {/* MIDDLE SECTION: ULTRA-INFORMATIVE PACKAGE SUMMARY BOX */}
                    <div className="flex-1 max-w-sm space-y-2 bg-amber-500/5 p-3 rounded-lg border border-amber-500/20 text-xs">
                      {partner.packages && partner.packages.length > 0 ? (
                        <>
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1">
                              <Package className="h-3.5 w-3.5" /> Pilih Paket Penawaran:
                            </label>
                            {activePkg && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setInspectingPackage({ partner, pkg: activePkg })}
                                className="h-6 text-[10px] text-primary gap-1 font-semibold hover:underline p-0"
                              >
                                <Info className="h-3 w-3" /> Detail Paket Lengkap
                              </Button>
                            )}
                          </div>

                          <Select
                            value={activePkgId || ""}
                            onValueChange={(val) =>
                              setSelectedPackages((prev) => ({ ...prev, [partner.id]: val }))
                            }
                          >
                            <SelectTrigger className="h-8 text-xs bg-background font-semibold">
                              <SelectValue placeholder="Pilih Paket..." />
                            </SelectTrigger>
                            <SelectContent>
                              {partner.packages.map((pkg) => (
                                <SelectItem key={pkg.id} value={pkg.id} className="text-xs">
                                  {pkg.package_name} - Rp {Number(pkg.price).toLocaleString("id-ID")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* DYNAMIC PACKAGE DETAILS BOX */}
                          {activePkg && (
                            <div className="space-y-1.5 pt-1.5 border-t border-amber-500/20 text-[11px]">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-emerald-600 text-sm">
                                  Rp {Number(activePkg.price).toLocaleString("id-ID")}
                                </span>
                                {activePkg.capacity_pax && activePkg.capacity_pax > 0 ? (
                                  <Badge variant="secondary" className="text-[10px] font-mono gap-1">
                                    <Users className="h-3 w-3" /> {activePkg.capacity_pax} Pax
                                  </Badge>
                                ) : null}
                              </div>

                              {/* INLINE FACILITY CHECKMARKS */}
                              {activePkg.features_include && activePkg.features_include.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                  {activePkg.features_include.slice(0, 3).map((feat, fIdx) => (
                                    <span key={fIdx} className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded border border-emerald-500/30">
                                      <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                      {feat}
                                    </span>
                                  ))}
                                  {activePkg.features_include.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground font-semibold">
                                      +{activePkg.features_include.length - 3} fasilitas lainnya
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-muted-foreground block">Kisaran Penawaran:</span>
                            <span className="font-mono font-bold text-emerald-600">
                              Rp {Number(partner.min_price || 0).toLocaleString("id-ID")}
                              {partner.max_price ? ` - Rp ${Number(partner.max_price).toLocaleString("id-ID")}` : ""}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {partner.price_tier}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* RIGHT SECTION: 1-Click Import Button & R2 Pricelist Link */}
                    <div className="flex flex-col items-stretch md:items-end justify-center space-y-2 shrink-0 border-t md:border-t-0 md:border-l border-border/60 pt-3 md:pt-0 md:pl-4">
                      {partner.pricelist_r2_key && (
                        <a
                          href={`/api/storage/presign?key=${encodeURIComponent(partner.pricelist_r2_key)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          <FileText className="h-3.5 w-3.5 text-primary" /> Brosur PDF (R2)
                        </a>
                      )}

                      <Button
                        onClick={() => handleImportPackage(partner)}
                        disabled={importingId === partner.id}
                        className="text-xs font-semibold gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                      >
                        <Zap className="h-3.5 w-3.5 fill-white" />
                        {importingId === partner.id
                          ? "Mengimpor Data..."
                          : activePkg
                          ? `⚡ 1-Click Import ${activePkg.package_name}`
                          : "⚡ 1-Click Import Paket"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* PAGINATION CONTROLS AT BOTTOM */}
        {sortedPartners.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs">
            <p className="text-muted-foreground">
              Menampilkan <span className="font-semibold text-foreground">{(currentPage - 1) * pageSize + 1}</span> -{" "}
              <span className="font-semibold text-foreground">
                {Math.min(currentPage * pageSize, sortedPartners.length)}
              </span>{" "}
              dari <span className="font-semibold text-foreground">{sortedPartners.length}</span> Vendor Partner
            </p>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 text-xs gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Sebelumnya
              </Button>

              <span className="font-semibold text-foreground px-2">
                Halaman {currentPage} dari {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 text-xs gap-1"
              >
                Selanjutnya <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* FULL PACKAGE BREAKDOWN DIALOG MODAL */}
      {inspectingPackage && (
        <Dialog open={Boolean(inspectingPackage)} onOpenChange={() => setInspectingPackage(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader className="pb-2 border-b border-border">
              <Badge className="w-fit bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
                {inspectingPackage.partner.company_name}
              </Badge>
              <DialogTitle className="font-serif text-xl pt-1">
                {inspectingPackage.pkg.package_name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Rincian lengkap fasilitas, kapasitas, dan harga paket penawaran vendor.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Harga Penawaran Resmi:</span>
                  <span className="font-mono font-bold text-emerald-600 text-lg">
                    Rp {Number(inspectingPackage.pkg.price).toLocaleString("id-ID")}
                  </span>
                </div>
                {inspectingPackage.pkg.capacity_pax ? (
                  <Badge variant="secondary" className="text-xs font-mono gap-1">
                    <Users className="h-3.5 w-3.5" /> {inspectingPackage.pkg.capacity_pax} Pax
                  </Badge>
                ) : null}
              </div>

              {inspectingPackage.pkg.description && (
                <div className="space-y-1">
                  <span className="font-semibold text-foreground">Deskripsi / Catatan Paket:</span>
                  <p className="text-xs text-muted-foreground whitespace-pre-line bg-muted/40 p-2.5 rounded border border-border/60">
                    {inspectingPackage.pkg.description}
                  </p>
                </div>
              )}

              {inspectingPackage.pkg.features_include && inspectingPackage.pkg.features_include.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block">
                    Fasilitas & Include Paket ({inspectingPackage.pkg.features_include.length} Item):
                  </span>
                  <div className="space-y-1 bg-card p-3 rounded-lg border border-border">
                    {inspectingPackage.pkg.features_include.map((feat, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-foreground">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => setInspectingPackage(null)}>
                Tutup
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const partner = inspectingPackage.partner;
                  setInspectingPackage(null);
                  handleImportPackage(partner);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold gap-1.5"
              >
                <Zap className="h-3.5 w-3.5 fill-white" /> Impor Paket Ini Sekarang
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
