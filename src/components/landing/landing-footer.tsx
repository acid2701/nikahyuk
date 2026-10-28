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
    <footer className="border-t border-border bg-card py-10 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="space-y-1">
          <Link href="/" className="flex items-center justify-center md:justify-start space-x-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={appName} className="h-6 w-6 object-contain" />
            ) : (
              <Heart className="h-4 w-4 text-primary fill-primary" />
            )}
            <span className="font-serif text-lg font-bold text-foreground">{appName}</span>
          </Link>
          <p className="text-xs text-muted-foreground">{tagline}</p>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>© {new Date().getFullYear()} {appName} Platform. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="text-[11px]">Dukungan & Kontak: <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a></p>
        </div>
      </div>
    </footer>
  );
}
