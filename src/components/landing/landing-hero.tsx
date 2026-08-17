"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, CheckCircle2, Clock, Users, DollarSign, Smartphone } from "lucide-react";

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
        <Badge
          variant="outline"
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border-primary/30 bg-primary/5 text-primary shadow-xs"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Platform Wedding & Event Companion #1 di Indonesia</span>
        </Badge>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
          {heroTitle}
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {heroSubtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild size="lg" className="h-12 px-6 text-sm font-bold gap-2 shadow-md w-full sm:w-auto">
            <Link href={isLoggedIn ? "/dashboard" : "/register"}>
              {ctaButtonText} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-6 text-sm font-medium w-full sm:w-auto">
            <a href="#features">Pelajari Fitur →</a>
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-4">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Tanpa Biaya Pendaftaran
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Realtime WebSocket CDC
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> PWA Mobile Field Crew
          </span>
        </div>

        {/* App Showcase Card */}
        <div className="pt-8 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-4 shadow-xl grid gap-3 grid-cols-2 sm:grid-cols-4 text-left">
            <div className="p-3 rounded-xl bg-background border border-border space-y-1">
              <Clock className="h-5 w-5 text-primary" />
              <p className="font-bold text-xs">Live Rundown</p>
              <p className="text-[10px] text-muted-foreground">Timeline shift 1-klik</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border space-y-1">
              <Users className="h-5 w-5 text-amber-500" />
              <p className="font-bold text-xs">RSVP & WA Blast</p>
              <p className="text-[10px] text-muted-foreground">Template pesan instan</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border space-y-1">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <p className="font-bold text-xs">Anggaran Core</p>
              <p className="text-[10px] text-muted-foreground">Multiple Milestones</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border space-y-1">
              <Smartphone className="h-5 w-5 text-purple-500" />
              <p className="font-bold text-xs">Mobile PWA</p>
              <p className="text-[10px] text-muted-foreground">Check-in desk offline</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
