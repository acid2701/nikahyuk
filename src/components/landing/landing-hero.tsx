"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Clock, Users, DollarSign, Smartphone } from "lucide-react";

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
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[200px] bg-accent/30 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          {heroTitle}
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {heroSubtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            asChild
            size="lg"
            className="h-12 px-7 rounded-full bg-foreground text-background hover:bg-foreground/90 text-sm font-semibold gap-2 shadow-xs w-full sm:w-auto transition-all"
          >
            <Link href={isLoggedIn ? "/dashboard" : "/register"}>
              {ctaButtonText} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-7 rounded-full border-border/80 text-sm font-medium hover:bg-muted w-full sm:w-auto transition-all"
          >
            <a href="#features">Pelajari Fitur →</a>
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-4">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Tanpa Biaya Pendaftaran
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sinkronisasi Realtime Terenkripsi
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> PWA Mobile Kru Lapangan
          </span>
        </div>

        {/* App Showcase Card */}
        <div className="pt-8 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xs p-4 sm:p-5 shadow-xs grid gap-3 grid-cols-2 sm:grid-cols-4 text-left">
            <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1 hover:border-foreground/30 transition-all">
              <Clock className="h-5 w-5 text-emerald-500" />
              <p className="font-bold text-xs">Live Rundown</p>
              <p className="text-[10px] text-muted-foreground">Timeline shift 1-klik</p>
            </div>
            <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1 hover:border-foreground/30 transition-all">
              <Users className="h-5 w-5 text-amber-500" />
              <p className="font-bold text-xs">Buku Tamu & Meja</p>
              <p className="text-[10px] text-muted-foreground">Check-in QR & Seating</p>
            </div>
            <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1 hover:border-foreground/30 transition-all">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <p className="font-bold text-xs">RAB Anggaran</p>
              <p className="text-[10px] text-muted-foreground">DP, Termin & Bukti Bayar</p>
            </div>
            <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1 hover:border-foreground/30 transition-all">
              <Smartphone className="h-5 w-5 text-purple-500" />
              <p className="font-bold text-xs">Portal Kru & WO</p>
              <p className="text-[10px] text-muted-foreground">Akses token tanpa login</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
