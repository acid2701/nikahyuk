"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Clock,
  Users,
  Palette,
  Heart,
  Calendar,
} from "lucide-react";

export interface LandingHeroProps {
  heroTitle: string;
  heroSubtitle: string;
  ctaButtonText: string;
  isLoggedIn: boolean;
}

export function LandingHero({
  heroTitle,
  heroSubtitle,
  ctaButtonText,
  isLoggedIn,
}: LandingHeroProps) {
  return (
    <section className="relative pt-12 pb-16 md:pt-18 md:pb-24 border-b border-border/50">
      <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
        {/* Simple Label Pill (No pulse, no multi-color gradient) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-border bg-muted/30 text-xs font-semibold text-foreground/80 mx-auto">
          <span>Manajemen Pernikahan & Hari-H</span>
        </div>

        {/* Clean, Humanist Editorial Headline (Solid typography, no AI gradient clips) */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <h1 className="font-sans text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Semua rencana pernikahan rapi di satu tempat.
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-normal">
            Susun jadwal rundown hari-H, undang tamu via WhatsApp, simpan palet warna tema, dan pantau pengeluaran bersama pasangan serta tim WO.
          </p>
        </div>

        {/* Straightforward Airbnb-Style Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <Button
            asChild
            size="lg"
            className="h-11 px-7 rounded-full bg-[#ff385c] text-white hover:bg-[#e00b41] text-xs sm:text-sm font-semibold gap-2 shadow-xs w-full sm:w-auto transition-colors"
          >
            <Link href={isLoggedIn ? "/dashboard" : "/register"}>
              {ctaButtonText || "Mulai Sekarang"} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-11 px-6 rounded-full border-border text-xs sm:text-sm font-medium hover:bg-muted w-full sm:w-auto transition-colors"
          >
            <a href="#features">Lihat Rincian Fitur</a>
          </Button>
        </div>

        {/* Honest Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-foreground/70" /> Gratis untuk pasangan
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-foreground/70" /> Akses kru via PIN tanpa instal aplikasi
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-foreground/70" /> Data tersimpan aman & bisa diekspor
          </span>
        </div>

        {/* REAL PRODUCT UI SHOWCASE (Authentic UI, no fake floating neon) */}
        <div className="pt-6 sm:pt-8 max-w-3xl mx-auto text-left">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground font-bold">
                  <Heart className="h-4 w-4 text-[#ff385c]" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-sm sm:text-base text-foreground">
                    Rama & Shinta
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Sabtu, 28 November 2026 • Gedung Pertemuan Utama
                  </p>
                </div>
              </div>

              <div className="self-start sm:self-auto px-3 py-1 rounded-full bg-muted text-foreground font-semibold text-xs border border-border">
                H-24 Menuju Acara
              </div>
            </div>

            {/* Product modules preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Box 1: Color palette */}
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2">
                <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Palette className="h-3.5 w-3.5 text-foreground/70" /> Warna Tema Acara
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="h-6 flex-1 rounded bg-[#9CAF88] border border-black/10" title="Sage Green" />
                  <div className="h-6 flex-1 rounded bg-[#D4AF37] border border-black/10" title="Champagne Gold" />
                  <div className="h-6 flex-1 rounded bg-[#FDFBF7] border border-border" title="Warm Ivory" />
                  <div className="h-6 flex-1 rounded bg-[#E8B4A2] border border-black/10" title="Dusty Blush" />
                  <div className="h-6 flex-1 rounded bg-[#3A3A3A] border border-black/10" title="Charcoal" />
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  Sage, Gold, Ivory, Blush, Charcoal
                </p>
              </div>

              {/* Box 2: Rundown agenda */}
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-foreground/70" /> Susunan Acara
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">09:30 WIB</span>
                </div>
                <p className="text-xs font-bold text-foreground truncate">
                  Akad Nikah & Ijab Qabul
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  Pelaminan Utama • PIC: Dimas
                </p>
              </div>

              {/* Box 3: Guests count */}
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-foreground/70" /> Konfirmasi Tamu
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">92% Hadir</span>
                </div>
                <div className="text-base font-bold font-mono text-foreground">
                  420 / 450 Pax
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  Tersinkronisasi otomatis via WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
