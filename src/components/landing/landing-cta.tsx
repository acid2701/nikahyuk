"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Heart } from "lucide-react";

export interface LandingCtaProps {
  appName: string;
  isLoggedIn?: boolean;
}

export function LandingCta({ appName, isLoggedIn = false }: LandingCtaProps) {
  return (
    <section className="py-16 md:py-24 border-t border-border/60 bg-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-8 sm:p-14 text-center space-y-6 shadow-sm">
          {/* Aesthetic Warm Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[240px] bg-gradient-to-tr from-[#ff385c]/15 via-rose-400/10 to-amber-300/10 blur-[110px] rounded-full pointer-events-none -z-10" />

          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#ff385c]/10 text-[#ff385c] border border-[#ff385c]/20 mx-auto shadow-xs">
            <Heart className="h-6 w-6 fill-[#ff385c]" />
          </div>

          <div className="space-y-2.5 max-w-xl mx-auto">
            <h2 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
              Bikin Momen Sekali Seumur Hidup Jadi Berkesan.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              Tinggalkan catatan berantakan. Mulai atur rundown, moodboard warna, dan RSVP tamu pernikahanmu bersama {appName} dalam hitungan menit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="h-12 px-9 rounded-full bg-[#ff385c] text-white hover:bg-[#e00b41] text-xs sm:text-sm font-bold gap-2 shadow-sm hover:shadow-md w-full sm:w-auto transition-all"
            >
              <Link href={isLoggedIn ? "/dashboard" : "/register"}>
                Mulai Gratis Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-7 rounded-full border-border/80 text-xs sm:text-sm font-semibold hover:bg-muted/80 w-full sm:w-auto transition-all bg-card/60"
            >
              <Link href="/vendor-register">
                Gabung Mitra Vendor
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
