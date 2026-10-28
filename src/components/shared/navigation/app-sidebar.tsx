"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  Users,
  LayoutGrid,
  Gift,
  Settings,
  User,
  QrCode,
  HeartHandshake,
  CheckSquare,
  Share2,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DonationQrisModal } from "@/components/shared/modal/donation-qris-modal";

export interface AppSidebarProps {
  weddingId?: string;
  className?: string;
  onNavigate?: () => void;
  appName?: string;
  tagline?: string;
  logoUrl?: string;
}

export function AppSidebar({
  weddingId,
  className,
  onNavigate,
  appName = "NikahYuk",
  tagline = "Wedding & Event Companion",
  logoUrl,
}: AppSidebarProps) {

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

  const eventId = searchParams.get("eventId");

  const baseUrl = weddingId ? `/dashboard/${weddingId}` : "/dashboard";

  const navigationGroups = [
    {
      label: "Utama",
      items: [
        {
          title: "Ringkasan",
          href: baseUrl,
          icon: LayoutDashboard,
        },
        {
          title: "Sub-Events Hub",
          href: `${baseUrl}/events`,
          icon: Calendar,
        },
      ],
    },
    {
      label: "Hari-H & Tamu",
      items: [
        {
          title: "Live Rundown",
          href: `${baseUrl}/rundown`,
          icon: Clock,
        },
        {
          title: "Master Tamu & RSVP",
          href: `${baseUrl}/guests`,
          icon: Users,
        },
        {
          title: "Penataan Meja",
          href: `${baseUrl}/seating`,
          icon: LayoutGrid,
        },
        {
          title: "Log Kado & Angpao",
          href: `${baseUrl}/gifts`,
          icon: Gift,
        },
      ],
    },
    {
      label: "Persiapan & Biaya",
      items: [
        {
          title: "Checklist Persiapan",
          href: `${baseUrl}/checklists`,
          icon: CheckSquare,
        },
        {
          title: "Anggaran (Budget)",
          href: `${baseUrl}/budget`,
          icon: DollarSign,
        },
        {
          title: "Vendor Hub & SPK",
          href: `${baseUrl}/vendors`,
          icon: Briefcase,
        },
      ],
    },
    {
      label: "Akses & Akun",
      items: [
        {
          title: "Berbagi Link (Share)",
          href: `${baseUrl}/share`,
          icon: Share2,
        },
        {
          title: "Kolaborator",
          href: `${baseUrl}/settings/collaborators`,
          icon: Settings,
        },
        {
          title: "Profil Pernikahan",
          href: `${baseUrl}/settings/profile`,
          icon: User,
        },
        {
          title: "Profil Akun",
          href: `${baseUrl}/settings/user-profile`,
          icon: User,
        },
      ],
    },
  ];

  const [openDonationModal, setOpenDonationModal] = React.useState(false);

  return (
    <>
      <DonationQrisModal open={openDonationModal} onOpenChange={setOpenDonationModal} />
      <aside
        className={cn(
          "w-64 border-r border-border/70 bg-card/95 backdrop-blur-xs flex flex-col justify-between h-full min-h-screen select-none",
          className
        )}
      >
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          <div className="px-2 space-y-1">
            <Link href="/dashboard" className="flex items-center space-x-2.5">
              {logoUrl ? (
                <img src={logoUrl} alt={appName} className="h-7 w-auto max-w-[120px] object-contain rounded" />
              ) : (
                <div className="h-7 w-7 rounded-full bg-[#ff385c] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <span className="text-xs font-black">N</span>
                </div>
              )}
              <span className="font-sans text-xl font-bold tracking-tight text-foreground truncate">
                {appName}
              </span>
            </Link>
            <p className="text-[11px] text-muted-foreground truncate pl-0.5">
              {tagline}
            </p>
          </div>

          <nav className="space-y-4">
            {navigationGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== baseUrl && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    const fullHref = eventId ? `${item.href}?eventId=${eventId}` : item.href;

                    return (
                      <Link
                        key={item.title}
                        href={fullHref}
                        prefetch={true}
                        onClick={onNavigate}
                        className={cn(
                          "group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150",
                          isActive
                            ? "bg-[#ff385c]/10 text-[#ff385c] font-semibold"
                            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#ff385c]" />
                        )}
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isActive ? "text-[#ff385c]" : "text-muted-foreground group-hover:text-foreground"
                          )}
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
          <button
            type="button"
            onClick={() => setOpenDonationModal(true)}
            className="w-full text-left rounded-xl p-2.5 bg-muted/60 hover:bg-muted border border-border/70 text-foreground space-y-1.5 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <HeartHandshake className="h-3.5 w-3.5 text-[#ff385c] shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold">Tip Jar & Donasi</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#ff385c]/10 text-[#ff385c] font-bold">QRIS</span>
            </div>
            <p className="text-[10px] leading-tight text-muted-foreground line-clamp-1">
              Dukung maintenance platform ini.
            </p>
          </button>

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
      </aside>
    </>
  );
}
