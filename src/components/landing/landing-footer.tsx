"use client";

import * as React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export interface LandingFooterProps {
  appName: string;
  tagline: string;
  logoUrl?: string;
  contactEmail?: string;
}

export function LandingFooter({
  appName,
  tagline,
  logoUrl,
  contactEmail = "support@nikahyu.my.id",
}: LandingFooterProps) {
  return (
    <footer className="border-t border-border bg-card py-12 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-center md:text-left">
          {/* Kolom 1: Brand & Tagline */}
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center space-x-2">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={appName} className="h-6 w-auto max-w-[120px] object-contain rounded" />
              ) : (
                <Heart className="h-4 w-4 text-primary fill-primary" />
              )}
              <span className="font-sans text-lg font-bold text-foreground">{appName}</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto md:mx-0">
              {tagline}
            </p>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Akses Cepat</h4>
            <div className="flex flex-wrap md:flex-col justify-center md:justify-start gap-2.5 text-xs text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Fitur Layanan</a>
              <a href="#faq" className="hover:text-foreground transition-colors">Tanya Jawab (FAQ)</a>
              <Link href="/login" className="hover:text-foreground transition-colors">Masuk ke Akun</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">Daftar Pengantin</Link>
              <Link href="/vendor-register" className="hover:text-foreground transition-colors">Gabung Mitra Vendor</Link>
            </div>
          </div>

          {/* Kolom 3: Kontak & Hak Cipta */}
          <div className="space-y-2 md:text-right">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Bantuan & Kontak</h4>
            <p className="text-xs text-muted-foreground">
              Dukungan Pelanggan:{" "}
              <a href={`mailto:${contactEmail}`} className="text-primary hover:underline font-medium">
                {contactEmail}
              </a>
            </p>
            <p className="text-[11px] text-muted-foreground/80 pt-2">
              © {new Date().getFullYear()} {appName} Platform.<br className="hidden md:inline" /> Hak Cipta Dilindungi Undang-Undang.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
