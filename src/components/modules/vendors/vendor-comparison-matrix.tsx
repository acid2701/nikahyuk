"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WAButton } from "@/components/shared/whatsapp/wa-button";
import { updateVendorStatusAction } from "@/actions/vendor-actions";
import { useToast } from "@/components/ui/use-toast";
import {
  CheckCircle2,
  Award,
  FileText,
  Building2,
  Phone,
  ThumbsUp,
  SlidersHorizontal,
  ExternalLink,
  Ban,
  Sparkles,
} from "lucide-react";
import { VendorItem } from "./vendor-manager";

export interface VendorComparisonMatrixProps {
  weddingId: string;
  vendors: VendorItem[];
  categories: string[];
  onStatusUpdated?: () => void;
}

export function VendorComparisonMatrix({
  weddingId,
  vendors,
  categories,
  onStatusUpdated,
}: VendorComparisonMatrixProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>(
    categories[0] || "Catering"
  );
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const { toast } = useToast();

  const filteredVendors = React.useMemo(() => {
    return vendors.filter(
      (v) => v.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [vendors, selectedCategory]);

  const selectedVendor = React.useMemo(() => {
    return filteredVendors.find((v) => (v.status as string) === "selected");
  }, [filteredVendors]);

  async function handleSetStatus(
    vendorId: string,
    vendorName: string,
    newStatus: "candidate" | "shortlisted" | "selected" | "rejected"
  ) {
    setUpdatingId(vendorId);
    try {
      await updateVendorStatusAction(vendorId, weddingId, newStatus);
      toast({
        title: newStatus === "selected" ? "Vendor Pilihan Ditetapkan!" : "Status Diperbarui",
        description:
          newStatus === "selected"
            ? `'${vendorName}' resmi ditetapkan sebagai Vendor Pilihan Utama untuk kategori ${selectedCategory}.`
            : `Status '${vendorName}' diubah menjadi ${newStatus.toUpperCase()}.`,
        variant: "success",
      });
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      toast({
        title: "Gagal Mengubah Status",
        description: err instanceof Error ? err.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  }

  function renderStatusBadge(status?: string) {
    switch (status) {
      case "selected":
        return (
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 gap-1 shadow-xs">
            <CheckCircle2 className="h-3 w-3" /> Pilihan Utama
          </Badge>
        );
      case "shortlisted":
        return (
          <Badge className="bg-sky-600 text-white hover:bg-sky-700 gap-1 shadow-xs">
            <Award className="h-3 w-3" /> Kandidat Terkuat
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-muted-foreground border-border gap-1">
            <Ban className="h-3 w-3 text-rose-500" /> Batal / Ditolak
          </Badge>
        );
      case "candidate":
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Calon / Survei
          </Badge>
        );
    }
  }

  function renderDocTypeLabel(docType?: string) {
    switch (docType) {
      case "menu":
        return <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">Daftar Menu</Badge>;
      case "pricelist":
        return <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20">Brosur & Pricelist</Badge>;
      case "contract":
        return <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Kontrak SPK</Badge>;
      case "receipt":
        return <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20">Kuitansi / DP</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Dokumen</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      {/* Category Selection Filter Pills */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-serif flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" /> Matriks Perbandingan Vendor
              </CardTitle>
              <CardDescription className="text-xs">
                Bandingkan penawaran, daftar menu, brosur pricelist, dan tentukan vendor pilihan utama.
              </CardDescription>
            </div>
            {selectedVendor && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Pilihan: {selectedVendor.vendor_name}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = cat.toLowerCase() === selectedCategory.toLowerCase();
              const count = vendors.filter((v) => v.category.toLowerCase() === cat.toLowerCase()).length;

              return (
                <Button
                  key={cat}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="h-8 text-xs font-medium gap-1.5 rounded-full"
                >
                  {cat}
                  <span className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Grid (Side-by-Side) */}
      {filteredVendors.length === 0 ? (
        <Card className="border-dashed border-border p-8 text-center space-y-3">
          <Building2 className="h-10 w-10 text-muted-foreground/60 mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">
            Belum Ada Calon Vendor Kategori "{selectedCategory}"
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Silakan tambahkan calon vendor pada kategori {selectedCategory} untuk mulai melakukan perbandingan penawaran, brosur menu, dan harga.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 align-stretch">
          {filteredVendors.map((vendor) => {
            const isWinner = (vendor.status as string) === "selected";
            const docs = vendor.vendor_documents || [];

            return (
              <Card
                key={vendor.id}
                className={`flex flex-col justify-between transition-all shadow-xs relative overflow-hidden ${
                  isWinner
                    ? "border-emerald-500/80 bg-emerald-500/[0.02] ring-2 ring-emerald-500/20"
                    : "border-border/80 hover:border-border"
                }`}
              >
                {isWinner && (
                  <div className="bg-emerald-600 text-white text-[10px] font-semibold text-center py-0.5 px-2 tracking-wide uppercase">
                    ★ Vendor Terpilih ★
                  </div>
                )}

                <CardHeader className="pb-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base text-foreground line-clamp-1">
                      {vendor.vendor_name}
                    </h3>
                    {renderStatusBadge(vendor.status)}
                  </div>

                  <div className="text-xl font-bold font-mono text-primary">
                    Rp {Number(vendor.contract_value || 0).toLocaleString("id-ID")}
                  </div>

                  {vendor.pic_name || vendor.sanitized_phone ? (
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span className="truncate flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" /> {vendor.pic_name || "PIC Vendor"}
                      </span>
                      {vendor.sanitized_phone && (
                        <WAButton
                          phone={vendor.sanitized_phone}
                          templateString="Halo {vendor_name}, saya mau menanyakan detail penawaran paket."
                          variables={{ vendor_name: vendor.vendor_name }}
                          label="Chat WA"
                          size="sm"
                          variant="ghost"
                        />
                      )}
                    </div>
                  ) : null}
                </CardHeader>

                <CardContent className="space-y-3 text-xs flex-1 border-t border-border/40 pt-3">
                  {/* Rincian Paket & Menu */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-1 text-[11px] uppercase tracking-wider">
                      Rincian Paket & Menu
                    </h4>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line bg-secondary/30 p-2.5 rounded border border-border/50 text-[11px]">
                      {(vendor as any).package_details || vendor.category + " Standard Package"}
                    </p>
                  </div>

                  {/* Catatan Kelebihan vs Kekurangan */}
                  {(vendor as any).pros_cons_notes && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-1 text-[11px] uppercase tracking-wider flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3 text-amber-500" /> Catatan & Pertimbangan
                      </h4>
                      <p className="text-muted-foreground leading-relaxed bg-amber-500/5 p-2.5 rounded border border-amber-500/20 text-[11px]">
                        {(vendor as any).pros_cons_notes}
                      </p>
                    </div>
                  )}

                  {/* Dokumen Pamflet, Menu, Pricelist */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-1 text-[11px] uppercase tracking-wider flex items-center justify-between">
                      <span>Dokumen ({docs.length})</span>
                    </h4>

                    {docs.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground italic">Belum ada brosur/menu diunggah.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {docs.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2 rounded bg-background border border-border/60 text-[11px]"
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="truncate font-medium">{doc.document_title}</span>
                            </div>
                            <div className="flex items-center space-x-1.5 shrink-0">
                              {renderDocTypeLabel((doc as any).doc_type)}
                              <a
                                href={`https://r2.nikahyuk.com/${doc.r2_file_key}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline flex items-center gap-0.5"
                                title="Lihat Berkas"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Footer Action Buttons */}
                <div className="p-3 bg-secondary/20 border-t border-border/60 flex flex-col gap-1.5">
                  {!isWinner ? (
                    <Button
                      size="sm"
                      variant="default"
                      disabled={updatingId === vendor.id}
                      onClick={() => handleSetStatus(vendor.id, vendor.vendor_name, "selected")}
                      className="w-full gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {updatingId === vendor.id ? "Memproses..." : "Pilih Vendor Ini (Pilihan Utama)"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === vendor.id}
                      onClick={() => handleSetStatus(vendor.id, vendor.vendor_name, "candidate")}
                      className="w-full text-xs text-muted-foreground hover:text-foreground"
                    >
                      Ubah Kembali ke Calon
                    </Button>
                  )}

                  <div className="flex items-center justify-between gap-1 text-[11px] text-muted-foreground pt-1">
                    <span>Ubah status:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSetStatus(vendor.id, vendor.vendor_name, "shortlisted")}
                        className="hover:underline text-sky-600 font-medium"
                      >
                        Kandidat
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => handleSetStatus(vendor.id, vendor.vendor_name, "rejected")}
                        className="hover:underline text-rose-500 font-medium"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
