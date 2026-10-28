"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  HardDrive,
  ShieldCheck,
  Database,
  History,
  ArrowLeft,
  Crown,
  Users,
  UserCheck,
  TrendingUp,
  HeartHandshake,
  Settings,
  Building2,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminSidebar({
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

  const navGroups = [
    {
      label: "Operasional & Bisnis",
      items: [
        {
          title: "Overview Platform",
          href: "/admin",
          icon: LayoutDashboard,
        },
        {
          title: "Persetujuan Mitra Vendor",
          href: "/admin/vendor-partners",
          icon: Building2,
        },
        {
          title: "Keuangan & Donasi KlikQRIS",
          href: "/admin/payments",
          icon: HeartHandshake,
        },
        {
          title: "Analitik SaaS & Penggunaan",
          href: "/admin/analytics",
          icon: TrendingUp,
        },
        {
          title: "User Pendaftar Platform",
          href: "/admin/users",
          icon: Users,
        },
      ],
    },
    {
      label: "Keamanan & RBAC",
      items: [
        {
          title: "Akses Staf Admin (RBAC)",
          href: "/admin/staff-permissions",
          icon: UserCheck,
        },
        {
          title: "Template Role Defaults",
          href: "/admin/rbac-templates",
          icon: ShieldCheck,
        },
        {
          title: "Cross-Tenant Audit Logs",
          href: "/admin/audit-logs",
          icon: History,
        },
      ],
    },
    {
      label: "Infrastruktur & Sistem",
      items: [
        {
          title: "Konfigurasi Storage R2",
          href: "/admin/storage-config",
          icon: HardDrive,
        },
        {
          title: "Encrypted Backups",
          href: "/admin/backups",
          icon: Database,
        },
        {
          title: "App Branding & Auth",
          href: "/admin/app-settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "w-64 border-r border-border/70 bg-card/95 backdrop-blur-xs flex flex-col justify-between select-none",
        className ? className : "h-full min-h-screen"
      )}
    >
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        <div className="px-2 space-y-1.5">
          <div className="flex items-center space-x-2">
            {logoUrl ? (
              <img src={logoUrl} alt={appName} className="h-6 w-auto max-w-[100px] object-contain rounded" />
            ) : (
              <div className="h-7 w-7 rounded-full bg-[#ff385c]/10 text-[#ff385c] border border-[#ff385c]/20 flex items-center justify-center shrink-0">
                <Crown className="h-4 w-4" />
              </div>
            )}
            <span className="font-sans text-base font-bold text-foreground truncate">
              {appName} Admin
            </span>
          </div>
          <div className="flex items-center gap-1.5 pl-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff385c]/10 text-[#ff385c] border border-[#ff385c]/20 uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff385c] animate-pulse" />
              Control Plane
            </span>
          </div>
        </div>

        <nav className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onClick={onNavigate}
                      className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-[#ff385c]/10 text-[#ff385c] font-semibold"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#ff385c]" />
                      )}
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? "text-[#ff385c]" : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="p-3.5 border-t border-border/70 space-y-2.5 shrink-0 bg-background/50">
        <div className="px-1 text-[11px] text-muted-foreground truncate">
          <p className="font-semibold text-foreground truncate">{userEmail}</p>
          <p className="text-[10px] text-muted-foreground/80">Role: Superadmin</p>
        </div>

        <div className="flex flex-col gap-1.5 pt-0.5">
          <Button asChild variant="outline" size="sm" className="w-full h-8 rounded-full text-xs gap-1.5 font-medium border-border/80 hover:bg-muted">
            <Link
              href="/dashboard"
              onClick={onNavigate}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard Pengantin
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full h-8 rounded-full text-xs gap-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 font-medium transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            {loggingOut ? "Keluar..." : "Keluar"}
          </Button>
        </div>
      </div>
    </aside>
  );
}
