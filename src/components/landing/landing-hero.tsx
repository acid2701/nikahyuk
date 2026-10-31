"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  Palette,
  Heart,
  Calendar,
  MapPin,
  Send,
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
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24">
      {/* Aesthetic Ambient Glow Blurs */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[520px] h-[320px] bg-gradient-to-tr from-[#ff385c]/15 via-rose-400/10 to-amber-200/15 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-6 right-8 w-[280px] h-[220px] bg-emerald-400/10 blur-[110px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto text-center px-4 space-y-6">
        {/* Gen-Z Mood Tag Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/80 bg-background/80 backdrop-blur-md shadow-xs text-xs font-semibold text-foreground/90 mx-auto">
          <span className="flex h-2 w-2 rounded-full bg-[#ff385c] animate-pulse" />
          <span>The New Aesthetic Way to Plan Weddings</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground font-normal">No More Messy Excel</span>
        </div>

        {/* Big Bold Aesthetic Title */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
            Nikah Tanpa Drama <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#ff385c] via-rose-500 to-amber-500 bg-clip-text text-transparent">
              Spreadsheet Ribet.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Rundown hari-H yang rapi, RSVP tamu via WhatsApp, moodboard warna tema, sampai hitungan amplop. 
            Semuanya sat-set di satu tempat, bareng pasangan & WO favoritmu.
          </p>
        </div>

        {/* Airbnb Pill Action CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            asChild
            size="lg"
            className="h-12 px-8 rounded-full bg-[#ff385c] text-white hover:bg-[#e00b41] text-xs sm:text-sm font-bold gap-2 shadow-sm hover:shadow-md w-full sm:w-auto transition-all"
          >
            <Link href={isLoggedIn ? "/dashboard" : "/register"}>
              {ctaButtonText || "Bikin Workspace Gratis"} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-7 rounded-full border-border/80 text-xs sm:text-sm font-semibold hover:bg-muted/80 w-full sm:w-auto transition-all bg-card/60 backdrop-blur-xs"
          >
            <a href="#features">Eksplor Fitur Cantik ↓</a>
          </Button>
        </div>

        {/* Minimalist Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-2">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 100% Gratis untuk Pengantin
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Akses Kru via PIN (Tanpa App)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Tampilan Estetik & Mobile-First
          </span>
        </div>

        {/* AESTHETIC INTERACTIVE MINI-COCKPIT SHOWCASE */}
        <div className="pt-6 sm:pt-8 max-w-4xl mx-auto text-left">
          <div className="relative rounded-3xl border border-border/80 bg-card/90 backdrop-blur-md p-4 sm:p-7 shadow-lg space-y-4 overflow-hidden">
            {/* Top Bar Workspace Header Mock */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-2xl bg-[#ff385c]/10 text-[#ff385c] flex items-center justify-center font-bold">
                  <Heart className="h-5 w-5 fill-[#ff385c]" />
                </div>
                <div>
                  <h3 className="font-sans font-extrabold text-base text-foreground">
                    Rama & Shinta
                  </h3>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Sabtu, 28 November 2026 • Royal Ambarrukmo
                  </p>
                </div>
              </div>

              {/* Countdown Pill Badge */}
              <div className="self-start sm:self-auto px-3.5 py-1 rounded-full bg-[#ff385c]/10 text-[#ff385c] font-bold text-xs border border-[#ff385c]/20">
                Menuju Hari Bahagia • H-24
              </div>
            </div>

            {/* Bento Highlights Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1: Color Palette Moodboard */}
              <div className="p-3.5 rounded-2xl border border-border/80 bg-background/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Palette className="h-3.5 w-3.5 text-primary" /> Moodboard Warna
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">5 Warna</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-7 flex-1 rounded-lg bg-[#9CAF88] shadow-xs" title="Sage Green" />
                  <div className="h-7 flex-1 rounded-lg bg-[#D4AF37] shadow-xs" title="Champagne Gold" />
                  <div className="h-7 flex-1 rounded-lg bg-[#FDFBF7] border border-border shadow-xs" title="Warm Ivory" />
                  <div className="h-7 flex-1 rounded-lg bg-[#E8B4A2] shadow-xs" title="Dusty Blush" />
                  <div className="h-7 flex-1 rounded-lg bg-[#3A3A3A] shadow-xs" title="Charcoal" />
                </div>
                <p className="text-[11px] text-muted-foreground font-medium truncate">
                  Tema: Botanical Sage & Champagne
                </p>
              </div>

              {/* Card 2: Next Live Rundown */}
              <div className="p-3.5 rounded-2xl border border-border/80 bg-background/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary" /> Live Rundown
                  </span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 rounded-full border-emerald-500/30 text-emerald-600 bg-emerald-50/50">
                    Next Cue
                  </Badge>
                </div>
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded-full bg-foreground text-background font-mono font-bold text-[10px]">
                    09:30 - 10:15
                  </span>
                  <p className="text-xs font-bold text-foreground truncate">
                    Prosesi Ijab Qabul & Tukar Cincin
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" /> Pelaminan Utama • PIC: Mas Dimas (WO)
                  </p>
                </div>
              </div>

              {/* Card 3: Guest & WhatsApp RSVP */}
              <div className="p-3.5 rounded-2xl border border-border/80 bg-background/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary" /> Tamu & RSVP
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">92% Terisi</span>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold font-mono text-foreground">
                    420 / 450 <span className="text-xs font-sans font-normal text-muted-foreground">Pax Hadir</span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[92%] rounded-full" />
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1 pt-0.5">
                    <Send className="h-2.5 w-2.5 text-primary" /> Undangan WA terkirim otomatis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
