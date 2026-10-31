"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";
import { ArrowRight, LayoutDashboard, LogOut } from "lucide-react";

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
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Link */}
        <Link href="/" className="flex items-center space-x-2.5 shrink-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={appName} className="h-7 w-7 object-contain rounded" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-[#ff385c] flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
              {appName ? appName.charAt(0).toUpperCase() : "N"}
            </div>
          )}
          <span className="font-sans text-lg sm:text-xl font-bold tracking-tight text-foreground">
            {appName}
          </span>
        </Link>

        {/* Center Navigation: Clean Editorial Text Links (Zero AI Icons) */}
        <nav className="hidden md:flex items-center space-x-7 text-xs font-medium text-muted-foreground">
          <Link
            href="/#features"
            className="hover:text-foreground transition-colors"
          >
            Fitur
          </Link>
          <Link
            href="/#features"
            className="hover:text-foreground transition-colors"
          >
            Alur Acara
          </Link>
          <Link
            href="/#faq"
            className="hover:text-foreground transition-colors"
          >
            Tanya Jawab
          </Link>
        </nav>

        {/* Right Action Controls: Fully Responsive */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <ThemeToggle />

          {isLoggedIn ? (
            <>
              <Button
                asChild
                size="sm"
                className="h-9 px-4 rounded-full bg-[#ff385c] text-white hover:bg-[#e00b41] text-xs font-semibold shadow-xs transition-colors"
              >
                <Link href="/dashboard" className="flex items-center gap-1.5">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
                className="h-9 w-9 p-0 rounded-full text-muted-foreground hover:text-rose-600 hover:bg-muted"
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-9 px-3.5 rounded-full text-xs font-semibold hover:bg-muted transition-colors"
              >
                <Link href="/login">Masuk</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="hidden sm:inline-flex h-9 px-4 sm:px-5 rounded-full bg-[#ff385c] text-white hover:bg-[#e00b41] gap-1 text-xs font-semibold shadow-xs transition-colors"
              >
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
