"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, HeartHandshake } from "lucide-react";

export interface LandingCtaProps {
  appName: string;
  isLoggedIn?: boolean;
}

export function LandingCta({ appName, isLoggedIn = false }: LandingCtaProps) {
  return (
    <section className="py-16 md:py-20 border-t border-border/60 bg-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-8 sm:p-12 text-center space-y-6 shadow-sm">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[200px] bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#ff385c]/10 text-[#ff385c] border border-[#ff385c]/20 mx-auto">
            <HeartHandshake className="h-6 w-6" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Siap Mengatur Hari Bahagia Anda?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Buat susunan acara terstruktur, bagikan jadwal kepada seluruh tim, dan nikmati momen pernikahan tanpa rasa cemas bersama {appName}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="h-11 px-8 rounded-full bg-[#ff385c] text-white hover:bg-[#e00b41] text-xs font-semibold gap-2 shadow-xs w-full sm:w-auto transition-all"
            >
              <Link href={isLoggedIn ? "/dashboard" : "/register"}>
                Mulai Gratis <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 px-6 rounded-full border-border/80 text-xs font-medium hover:bg-muted w-full sm:w-auto transition-all"
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
