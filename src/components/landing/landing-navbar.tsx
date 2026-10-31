"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";
import { Heart, ArrowRight, LayoutDashboard, LogOut } from "lucide-react";

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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center space-x-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={appName} className="h-8 w-8 object-contain" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-[#ff385c] flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <Heart className="h-5 w-5 fill-white stroke-white" />
            </div>
          )}
          <span className="font-sans text-xl font-bold tracking-tight text-foreground">
            {appName}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-muted/40 p-1 rounded-full border border-border/60 text-xs font-medium text-muted-foreground">
          <a href="#features" className="px-3.5 py-1.5 rounded-full hover:text-foreground hover:bg-background/80 transition-all">
            Fitur & Layanan
          </a>
          <a href="#faq" className="px-3.5 py-1.5 rounded-full hover:text-foreground hover:bg-background/80 transition-all">
            Tanya Jawab
          </a>
          <Link href="/vendor-register" className="px-3.5 py-1.5 rounded-full hover:text-foreground hover:bg-background/80 transition-all">
            Mitra Vendor
          </Link>
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <Button asChild size="sm" className="h-9 px-4 rounded-full bg-[#ff385c] text-white hover:bg-[#e00b41] gap-1.5 text-xs font-semibold shadow-xs">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-3.5 w-3.5" /> Buka Dashboard
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
                className="h-9 px-3 rounded-full text-xs text-muted-foreground hover:text-rose-600 gap-1 hover:bg-muted"
                title="Keluar dari akun"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{loggingOut ? "Keluar..." : "Keluar"}</span>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="h-9 px-3.5 rounded-full text-xs font-semibold hover:bg-muted">
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex h-9 px-5 rounded-full bg-[#ff385c] text-white hover:bg-[#e00b41] gap-1.5 text-xs font-semibold shadow-xs">
                <Link href="/register">
                  Mulai Gratis <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
