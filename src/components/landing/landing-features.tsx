"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  DollarSign,
  Palette,
  Share2,
  Gift,
  CheckCircle2,
  Sliders,
  Send,
  Sparkles,
} from "lucide-react";

export function LandingFeatures() {
  return (
    <section id="features" className="py-16 md:py-24 border-t border-border/60 bg-muted/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge
            variant="outline"
            className="rounded-full px-3.5 py-1 text-xs font-semibold border-primary/30 text-primary bg-primary/5"
          >
            Vibe Check: All-In-One Workspace
          </Badge>
          <h2 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
            Fitur Estetik, Kerjaannya Sat-Set.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
            Dibuat buat pasangan yang pengen pernikahannya tersusun estetik tanpa pusing mikirin format dokumen manual.
          </p>
        </div>

        {/* GEN-Z ASYMMETRIC BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* BENTO 1: LIVE RUNDOWN TIMELINE (Span 2 cols on desktop) */}
          <Card className="md:col-span-2 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-2xl bg-[#ff385c]/10 text-[#ff385c] flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  Anti-Molor Timeline
                </span>
              </div>

              <div className="space-y-1.5 max-w-lg">
                <h3 className="font-sans font-extrabold text-xl sm:text-2xl text-foreground">
                  Live Rundown & Aba-Aba Acara Realtime
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Jadwal acara mundur 15 menit? Cukup 1 sentuhan, seluruh jam agenda berikutnya otomatis bergeser tanpa perlu hitung ulang manual. Siap cetak PDF resmi pegangan kru.
                </p>
              </div>
            </div>

            {/* Interactive Timeline Mockup Snippet */}
            <div className="mt-6 pt-4 border-t border-border/60 space-y-2.5">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60">
                <span className="px-2.5 py-1 rounded-full bg-foreground text-background font-mono font-bold text-xs shrink-0">
                  08:00 - 09:00
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    Akad Nikah & Khutbah Nikah
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Penghulu KUA, Saksi, & Keluarga Inti
                  </p>
                </div>
                <Badge variant="outline" className="hidden sm:inline-flex text-[10px] rounded-full border-emerald-500/30 text-emerald-600 bg-emerald-50/50">
                  Selesai
                </Badge>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-background border border-border/80 shadow-xs">
                <span className="px-2.5 py-1 rounded-full bg-[#ff385c] text-white font-mono font-bold text-xs shrink-0">
                  09:30 - 10:15
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    Prosesi Sungkeman & Foto Keluarga
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Cue Musik: Akustik Syahdu • PIC: Kak Maya
                  </p>
                </div>
                <Badge className="text-[10px] rounded-full bg-[#ff385c]/10 text-[#ff385c] border-0">
                  Sedang Berlangsung
                </Badge>
              </div>
            </div>
          </Card>

          {/* BENTO 2: MOODBOARD & COLOR PALETTE (1 col, visual heavy) */}
          <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Palette className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  Visual Identity
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-sans font-extrabold text-xl text-foreground">
                  Moodboard & 5 Warna Tema
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Kurasi foto dekorasi, gaun, dan makeup impian. Lengkap dengan kode HEX yang siap dicopy untuk vendor & penjahit kain seragam.
                </p>
              </div>
            </div>

            {/* Swatch Preview Box */}
            <div className="mt-6 pt-4 border-t border-border/60 space-y-2">
              <div className="grid grid-cols-5 gap-1.5">
                <div className="h-12 rounded-xl bg-[#9CAF88] shadow-xs" title="Sage" />
                <div className="h-12 rounded-xl bg-[#D4AF37] shadow-xs" title="Gold" />
                <div className="h-12 rounded-xl bg-[#FDFBF7] border border-border shadow-xs" title="Ivory" />
                <div className="h-12 rounded-xl bg-[#E8B4A2] shadow-xs" title="Blush" />
                <div className="h-12 rounded-xl bg-[#3A3A3A] shadow-xs" title="Charcoal" />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium text-center pt-1">
                Mode Presentasi Fullscreen untuk WO
              </p>
            </div>
          </Card>

          {/* BENTO 3: GUEST BOOK & WHATSAPP RSVP (1 col) */}
          <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  RSVP Sat-Set
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-sans font-extrabold text-xl text-foreground">
                  Buku Tamu & Undangan WA
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Impor data kontak dari Excel/CSV, bagi meja VIP, kirim pesan personal via WhatsApp sekali klik, dan check-in barcode di venue.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 p-3 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Budi Santoso & Partner</span>
                <span className="font-mono text-emerald-600 font-bold">2 Pax Hadir</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Send className="h-3 w-3 text-primary" /> Pesan konfirmasi otomatis terkirim
              </div>
            </div>
          </Card>

          {/* BENTO 4: BUDGET & LOG ANGPAO (1 col) */}
          <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  Financial Control
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-sans font-extrabold text-xl text-foreground">
                  Kawal Anggaran & Rekap Kado
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Catat pos biaya dari uang muka (DP) sampai pelunasan vendor. Rekap amplop tunai & transfer langsung rapi tanpa takut bon hilang.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 p-3 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground block">
                Total Anggaran Terbayar
              </span>
              <div className="text-base font-mono font-bold text-emerald-600">
                Rp 85.000.000 <span className="text-[10px] font-normal text-muted-foreground font-sans">dari 110 Jt</span>
              </div>
            </div>
          </Card>

          {/* BENTO 5: ZERO APP FOR CREW (1 col) */}
          <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Share2 className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  Zero-Hassle Crew
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-sans font-extrabold text-xl text-foreground">
                  Buka Link via PIN, Tanpa App
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Kru penerima tamu dan MC lapangan cukup buka tautan aman dengan PIN 4-6 digit. Nggak perlu bikin akun atau download aplikasi.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono font-bold text-xs border border-primary/20">
                PIN: 8829
              </span>
              <span className="text-[11px] text-muted-foreground">
                Terkunci aman & anti-bocor
              </span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
