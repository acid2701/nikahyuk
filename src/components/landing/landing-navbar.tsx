"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";
import {
  Heart,
  ArrowRight,
  LayoutDashboard,
  LogOut,
  Clock,
  Palette,
  Users,
  HelpCircle,
} from "lucide-react";

export interface LandingNavbarProps {
  appName: string;
  logoUrl?: string;
  isLoggedIn: boolean;
}

export function LandingNavbar({ appName, logoUrl, isLoggedIn }: LandingNavbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
      window.location.reload();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-3 sm:top-4 z-50 w-full px-3.5 sm:px-6">
      <div className="max-w-5xl mx-auto rounded-full border border-border/80 bg-background/85 backdrop-blur-xl shadow-xs hover:shadow-md transition-all duration-300 px-3.5 sm:px-5 h-14 flex items-center justify-between">
        {/* Brand Area */}
        <Link href="/" className="flex items-center space-x-2.5 group shrink-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={appName} className="h-7 w-7 object-contain rounded-md" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-[#ff385c] flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              <Heart className="h-4 w-4 fill-white stroke-white" />
            </div>
          )}
          <span className="font-sans text-lg font-extrabold tracking-tight text-foreground">
            {appName}
          </span>
        </Link>

        {/* Center Pill Navigation (Airbnb Segmented Island) */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/40 p-1 rounded-full border border-border/60 text-xs font-medium text-muted-foreground">
          <Link
            href="/#features"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full hover:text-foreground hover:bg-background/90 transition-all text-[11px] font-semibold"
          >
            <Clock className="h-3 w-3 text-primary" />
            <span>Rundown</span>
          </Link>
          <Link
            href="/#features"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full hover:text-foreground hover:bg-background/90 transition-all text-[11px] font-semibold"
          >
            <Palette className="h-3 w-3 text-emerald-600" />
            <span>Moodboard</span>
          </Link>
          <Link
            href="/#features"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full hover:text-foreground hover:bg-background/90 transition-all text-[11px] font-semibold"
          >
            <Users className="h-3 w-3 text-amber-600" />
            <span>Buku Tamu</span>
          </Link>
          <Link
            href="/#faq"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full hover:text-foreground hover:bg-background/90 transition-all text-[11px] font-semibold"
          >
            <HelpCircle className="h-3 w-3 text-blue-600" />
            <span>FAQ</span>
          </Link>
        </nav>

        {/* Right CTA & Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          <ThemeToggle />

          {isLoggedIn ? (
            <>
              <Button
                asChild
                size="sm"
                className="h-8 sm:h-9 px-3.5 sm:px-4 rounded-full bg-[#ff385c] text-white hover:bg-[#e00b41] gap-1.5 text-xs font-semibold shadow-xs"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
                className="h-8 sm:h-9 w-8 sm:w-9 p-0 rounded-full text-xs text-muted-foreground hover:text-rose-600 hover:bg-muted"
                title="Keluar"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-full text-xs font-semibold hover:bg-muted"
              >
                <Link href="/login">Masuk</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="h-8 sm:h-9 px-3.5 sm:px-4 rounded-full bg-[#ff385c] text-white hover:bg-[#e00b41] gap-1 text-xs font-semibold shadow-xs"
              >
                <Link href="/register">
                  Mulai Gratis <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
