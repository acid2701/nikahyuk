"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, Sparkles } from "lucide-react";

export interface LandingNavbarProps {
  appName: string;
  logoUrl?: string;
  isLoggedIn: boolean;
}

export function LandingNavbar({ appName, logoUrl, isLoggedIn }: LandingNavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center space-x-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={appName} className="h-8 w-8 object-contain" />
          ) : (
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Heart className="h-5 w-5 fill-primary" />
            </div>
          )}
          <span className="font-serif text-xl font-bold tracking-tight text-foreground">
            {appName}
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">
            Fitur Unggulan
          </a>
          <a href="#advantages" className="hover:text-foreground transition-colors">
            Keunggulan
          </a>
          <a href="#faq" className="hover:text-foreground transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <Button asChild size="sm" className="gap-1.5 text-xs font-semibold">
              <Link href="/dashboard">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Buka Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild size="sm" className="gap-1.5 text-xs font-semibold">
                <Link href="/register">
                  Daftar Gratis <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
