"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, ArrowLeft } from "lucide-react";
import { VendorItem } from "./vendor-manager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VendorBriefingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendors: VendorItem[];
  weddingTitle?: string;
}

export function VendorBriefingModal({
  open,
  onOpenChange,
  vendors,
  weddingTitle = "Pernikahan Pengantin",
}: VendorBriefingModalProps) {
  const selectedVendors = vendors.filter((v) => v.status === "selected" || v.status === "shortlisted");
  const totalContract = selectedVendors.reduce((acc, v) => acc + Number(v.contract_value || 0), 0);

  function handlePrint() {
    window.print();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-border print:hidden">
          <DialogTitle className="font-serif text-xl">
            Preview Vendor Briefing Sheet
          </DialogTitle>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="gap-2 text-xs">
              <Printer className="h-4 w-4" /> Cetak / Export PDF
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)} className="text-xs">
              Tutup
            </Button>
          </div>
        </DialogHeader>

        {/* PRINTABLE CONTAINER */}
        <div className="space-y-6 pt-2 font-sans text-foreground print:p-0 print:m-0">
          {/* Header Briefing Sheet */}
          <div className="text-center space-y-1 pb-4 border-b border-border/80">
            <h1 className="font-serif text-2xl font-bold tracking-wide text-foreground">
              LEMBAR BRIEFING VENDOR PERNIKAHAN
            </h1>
            <p className="text-sm text-muted-foreground font-medium">{weddingTitle}</p>
            <p className="text-xs text-muted-foreground italic">
              Dicetak pada: {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* KPI Summary Banner */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-muted/40 rounded-lg border border-border text-center text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Total Vendor Terpilih</span>
              <span className="font-bold text-base text-foreground font-mono">{selectedVendors.length} Vendor</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Total Nilai Komitmen Kontrak</span>
              <span className="font-bold text-base text-emerald-600 font-mono">Rp {totalContract.toLocaleString("id-ID")}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Status Dokumen R2</span>
              <span className="font-bold text-base text-blue-600 font-mono">
                {selectedVendors.reduce((acc, v) => acc + (v.vendor_documents?.length || 0), 0)} Berkas
              </span>
            </div>
          </div>

          {/* Vendor Table List */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-base text-foreground flex items-center justify-between">
              <span>Daftar Mitra Vendor Utama (Selected & Shortlisted)</span>
            </h3>

            {selectedVendors.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-6 border border-dashed rounded-md">
                Belum ada vendor dengan status &apos;Pilihan Utama&apos; atau &apos;Kandidat Terkuat&apos;.
              </p>
            ) : (
              <div className="overflow-hidden border border-border rounded-lg shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/70 text-foreground border-b border-border">
                      <th className="p-2.5 font-semibold text-center w-10">No.</th>
                      <th className="p-2.5 font-semibold">Nama Vendor & Kategori</th>
                      <th className="p-2.5 font-semibold">PIC & Kontak WA</th>
                      <th className="p-2.5 font-semibold text-right">Nilai Kontrak</th>
                      <th className="p-2.5 font-semibold">Rincian Menu / Fasilitas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedVendors.map((v, i) => (
                      <tr key={v.id} className="hover:bg-muted/20">
                        <td className="p-2.5 text-center font-mono text-muted-foreground">{i + 1}</td>
                        <td className="p-2.5">
                          <p className="font-bold font-serif text-sm text-foreground">{v.vendor_name}</p>
                          <span className="inline-block text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground mt-0.5">
                            {v.category}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <p className="font-medium text-foreground">{v.pic_name || "-"}</p>
                          {v.sanitized_phone && (
                            <p className="text-[11px] text-emerald-600 font-mono">+{v.sanitized_phone}</p>
                          )}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-foreground">
                          Rp {Number(v.contract_value || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="p-2.5 text-muted-foreground text-[11px] leading-relaxed max-w-xs">
                          {(v as any).package_details || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notes for WO & Family */}
          <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-1 text-xs">
            <h4 className="font-bold text-amber-700 uppercase text-[11px]">Catatan Koordinasi untuk WO & Panitia:</h4>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              1. Harap lakukan konfirmasi ulang kedatangan (*loading time*) H-1 sebelum acara kepada seluruh PIC WhatsApp tertera.<br />
              2. Semua berkas kontrak SPK dan daftar menu tersimpan aman di Cloudflare R2 NikahYuk SaaS.<br />
              3. Pelunasan sisa kontrak disesuaikan dengan termin pembayaran pada modul Anggaran.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
