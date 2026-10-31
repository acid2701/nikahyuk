"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";

export interface LandingCtaProps {
  appName: string;
  isLoggedIn?: boolean;
}

export function LandingCta({ appName, isLoggedIn = false }: LandingCtaProps) {
  return (
    <section className="py-16 md:py-20 border-t border-border/50 bg-muted/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center space-y-6 shadow-xs">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-muted text-[#ff385c] border border-border mx-auto">
            <Heart className="h-5 w-5 fill-[#ff385c]" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Mulai atur pernikahan Anda hari ini.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
              Susun jadwal rundown, tentukan warna tema, dan kelola konfirmasi kehadiran bersama {appName}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <Button
              asChild
              size="lg"
              className="h-11 px-8 rounded-full bg-[#ff385c] text-white hover:bg-[#e00b41] text-xs sm:text-sm font-semibold gap-2 shadow-xs w-full sm:w-auto transition-colors"
            >
              <Link href={isLoggedIn ? "/dashboard" : "/register"}>
                Daftar Gratis <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 px-6 rounded-full border-border text-xs sm:text-sm font-medium hover:bg-muted w-full sm:w-auto transition-colors"
            >
              <Link href="/vendor-register">
                Pendaftaran Mitra Vendor
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
