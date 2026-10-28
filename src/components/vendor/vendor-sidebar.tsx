"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Building2,
  TrendingUp,
  Heart,
  ShieldCheck,
  Users,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function VendorSidebar({
  userEmail,
  onNavigate,
  className,
  appName = "NikahYuk",
  logoUrl,
}: {
  userEmail: string;
  onNavigate?: () => void;
  className?: string;
  appName?: string;
  logoUrl?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loggingOut, setLoggingOut] = React.useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/login";
    } finally {
      setLoggingOut(false);
    }
  }
  const currentTab = searchParams.get("tab") || "overview";

  const navItems = [
    {
      title: "Ringkasan Vendor",
      href: "/vendor/dashboard?tab=overview",
      tabValue: "overview",
      icon: LayoutDashboard,
    },
    {
      title: "Kelola Paket Penawaran",
      href: "/vendor/dashboard?tab=packages",
      tabValue: "packages",
      icon: Package,
    },
    {
      title: "CRM Client & Deals",
      href: "/vendor/dashboard?tab=crm",
      tabValue: "crm",
      icon: Users,
    },
    {
      title: "Profil & Pricelist R2",
      href: "/vendor/dashboard?tab=profile",
      tabValue: "profile",
      icon: Building2,
    },
    {
      title: "Visibilitas & Kontak",
      href: "/vendor/dashboard?tab=analytics",
      tabValue: "analytics",
      icon: TrendingUp,
    },
  ];

  return (
    <aside
      className={cn(
        "hidden lg:flex w-64 border-r border-border bg-card flex-col justify-between h-screen sticky top-0 shrink-0 p-4 select-none",
        className
      )}
    >
      <div className="space-y-6">
        {/* BRAND LOGO HEADER IDENTICAL TO USER DASHBOARD */}
        <div className="px-2 space-y-1">
          <Link href="/vendor/dashboard" className="flex items-center space-x-2">
            {logoUrl ? (
              <img src={logoUrl} alt={appName} className="h-7 w-auto max-w-[120px] object-contain rounded" />
            ) : null}
            <span className="font-sans text-2xl font-bold tracking-tight text-primary truncate">
              {appName}
            </span>
          </Link>
          <p className="text-[11px] text-muted-foreground truncate">
            Portal Partner Ecosystem
          </p>
        </div>

        {/* NAV ITEMS STYLED EXACTLY LIKE APP-SIDEBAR */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.tabValue;

            return (
              <Link
                key={item.title}
                href={item.href}
                prefetch={true}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER ACTIONS & ACCOUNT INFO */}
      <div className="space-y-2.5 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="w-full text-xs gap-2 border-border hover:bg-muted text-foreground font-semibold h-9"
        >
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />
          Workspace Pengantin Saya
        </Button>

        <div className="p-2.5 rounded-lg bg-secondary/60 border border-border/80 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 truncate">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <p className="font-semibold text-foreground truncate">{userEmail}</p>
              <p className="text-[10px] text-muted-foreground">Official Partner</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Keluar Akun Vendor"
            className="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 ml-1"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
