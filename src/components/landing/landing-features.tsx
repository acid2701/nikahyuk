"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  DollarSign,
  Palette,
  Share2,
  Send,
} from "lucide-react";

export function LandingFeatures() {
  return (
    <section id="features" className="py-16 md:py-24 border-t border-border/50 bg-muted/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge
            variant="outline"
            className="rounded-full px-3.5 py-1 text-xs font-semibold border-border text-muted-foreground bg-muted/40"
          >
            Fitur Utama Workspace
          </Badge>
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Dirancang praktis untuk hari bahagia Anda.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed">
            Semua kebutuhan koordinasi acara terintegrasi dalam antarmuka yang bersih dan mudah digunakan.
          </p>
        </div>

        {/* CLEAN ASYMMETRIC BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* BENTO 1: LIVE RUNDOWN TIMELINE (Span 2 cols on desktop) */}
          <Card className="md:col-span-2 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-foreground">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground font-mono">
                  Susunan Acara
                </span>
              </div>

              <div className="space-y-1.5 max-w-lg">
                <h3 className="font-sans font-bold text-xl sm:text-2xl text-foreground">
                  Live Rundown & Penyesuaian Jadwal
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Jika salah satu sesi molor, sesuaikan jam mulai dengan satu klik. Seluruh jadwal berikutnya otomatis tersinkronisasi dan siap diekspor ke PDF untuk pegangan kru.
                </p>
              </div>
            </div>

            {/* Timeline Snippet */}
            <div className="mt-6 pt-4 border-t border-border space-y-2.5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                <span className="px-2.5 py-1 rounded-full bg-foreground text-background font-mono font-bold text-xs shrink-0">
                  08:00 - 09:00
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    Akad Nikah & Ijab Qabul
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Penghulu KUA, Saksi, & Keluarga Inti
                  </p>
                </div>
                <Badge variant="outline" className="hidden sm:inline-flex text-[10px] rounded-full border-border text-muted-foreground">
                  Selesai
                </Badge>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border shadow-xs">
                <span className="px-2.5 py-1 rounded-full bg-[#ff385c] text-white font-mono font-bold text-xs shrink-0">
                  09:30 - 10:15
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    Sungkeman & Foto Bersama
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Pelaminan Utama • PIC: Kak Maya (WO)
                  </p>
                </div>
                <Badge className="text-[10px] rounded-full bg-[#ff385c]/10 text-[#ff385c] border-0">
                  Sesi Berjalan
                </Badge>
              </div>
            </div>
          </Card>

          {/* BENTO 2: MOODBOARD & COLOR PALETTE */}
          <Card className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-foreground">
                  <Palette className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground font-mono">
                  Identitas Visual
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-sans font-bold text-xl text-foreground">
                  Moodboard & Palet Warna
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Kumpulkan referensi dekorasi, gaun, dan riasan wajah. Kode warna HEX siap disalin untuk kebutuhan seragam keluarga dan cetak undangan.
                </p>
              </div>
            </div>

            {/* Swatch Preview Box */}
            <div className="mt-6 pt-4 border-t border-border space-y-2">
              <div className="grid grid-cols-5 gap-1.5">
                <div className="h-10 rounded-lg bg-[#9CAF88] border border-black/10" title="Sage" />
                <div className="h-10 rounded-lg bg-[#D4AF37] border border-black/10" title="Gold" />
                <div className="h-10 rounded-lg bg-[#FDFBF7] border border-border" title="Ivory" />
                <div className="h-10 rounded-lg bg-[#E8B4A2] border border-black/10" title="Blush" />
                <div className="h-10 rounded-lg bg-[#3A3A3A] border border-black/10" title="Charcoal" />
              </div>
              <p className="text-[11px] text-muted-foreground text-center pt-1 font-medium">
                Dilengkapi mode presentasi bersih untuk vendor
              </p>
            </div>
          </Card>

          {/* BENTO 3: GUEST BOOK & WHATSAPP RSVP */}
          <Card className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-foreground">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground font-mono">
                  Manajemen Tamu
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-sans font-bold text-xl text-foreground">
                  Buku Tamu & RSVP WhatsApp
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Impor kontak dari Excel/CSV, atur meja VIP, kirim pesan personal via WhatsApp sekali klik, dan catat kehadiran di meja registrasi.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border p-3 rounded-xl bg-muted/20 border border-border space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Budi Santoso & Keluarga</span>
                <span className="font-mono text-emerald-600 font-bold">2 Pax Hadir</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Send className="h-3 w-3 text-muted-foreground" /> Konfirmasi kehadiran tersimpan
              </div>
            </div>
          </Card>

          {/* BENTO 4: BUDGET & LOG ANGPAO */}
          <Card className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-foreground">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground font-mono">
                  Keuangan Acara
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-sans font-bold text-xl text-foreground">
                  Anggaran & Rekap Kado
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pantau pembayaran uang muka (DP) dan sisa tagihan vendor. Rekap penerimaan amplop tunai dan kado fisik tercatat rapi.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border p-3 rounded-xl bg-muted/20 border border-border space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground block">
                Total Anggaran Terbayar
              </span>
              <div className="text-base font-mono font-bold text-emerald-600">
                Rp 85.000.000 <span className="text-[10px] font-normal text-muted-foreground font-sans">dari 110 Jt</span>
              </div>
            </div>
          </Card>

          {/* BENTO 5: ZERO APP FOR CREW */}
          <Card className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-foreground">
                  <Share2 className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground font-mono">
                  Akses Lapangan
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-sans font-bold text-xl text-foreground">
                  Tautan Kru Berproteksi PIN
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Kru registrasi dan MC cukup membuka tautan dengan PIN 4-6 digit melalui peramban ponsel tanpa perlu mengunduh aplikasi tambahan.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-muted font-mono font-bold text-xs border border-border">
                PIN: 8829
              </span>
              <span className="text-[11px] text-muted-foreground">
                Akses terproteksi & aman
              </span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
