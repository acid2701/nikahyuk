"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LogOut,
  User,
  Shield,
  Home,
  Building2,
  ChevronLeft,
  Heart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EventSwitcher, SubEventOption } from "./event-switcher";
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";
import { useToast } from "@/components/ui/use-toast";
import { NotificationBell } from "./notification-bell";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface DashboardHeaderProps {
  weddingId?: string;
  groomName?: string;
  brideName?: string;
  userEmail?: string;
  events?: SubEventOption[];
  activeEventId?: string;
  onAddEventClick?: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  events: "Rangkaian Acara",
  budget: "Anggaran & Biaya",
  vendors: "Vendor Hub",
  guests: "Master Tamu & RSVP",
  seating: "Penataan Meja",
  rundown: "Susunan Acara",
  checklists: "Checklist Persiapan",
  gifts: "Catatan Kado & Angpao",
  "audit-logs": "Catatan Aktivitas",
  settings: "Pengaturan",
  collaborators: "Tim Kolaborator",
  profile: "Profil Pernikahan",
  "user-profile": "Profil Akun Saya",
  share: "Tautan Akses Kru",
  moodboard: "Moodboard & Palet",
};

export function DashboardHeader({
  weddingId,
  groomName = "Pengantin Pria",
  brideName = "Pengantin Wanita",
  userEmail = "user@nikahyu.my.id",
  events = [],
  activeEventId,
  onAddEventClick,
}: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const isRootDashboard =
    pathname === `/dashboard/${weddingId}` || pathname === "/dashboard";

  // Ambil segmen terakhir untuk judul halaman aktif
  const currentSegment = pathname.split("/").filter(Boolean).pop() || "";
  const currentTitle = PAGE_TITLES[currentSegment] || `${groomName} & ${brideName}`;

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast({
      title: "Berhasil Keluar",
      description: "Anda telah keluar dari akun NikahYuk.",
      variant: "success",
    });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur-md safe-area-top select-none shrink-0">
      <div className="max-w-7xl mx-auto h-14 px-3.5 sm:px-6 flex items-center justify-between gap-3">
        {/* Sisi Kiri: Back Button (Sub-page) atau Inisial Pasangan */}
        <div className="flex items-center space-x-2.5 min-w-0">
          {!isRootDashboard && weddingId ? (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 meld-bouncy"
              aria-label="Kembali ke Beranda Workspace"
            >
              <Link href={`/dashboard/${weddingId}`}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="h-8 w-8 rounded-full bg-rose-500/10 border border-rose-200 text-rose-500 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              <Heart className="h-4 w-4 fill-rose-500/20" />
            </div>
          )}

          {/* Judul Halaman Mobile-First Ringkas */}
          <div className="min-w-0">
            <h1 className="font-sans text-sm sm:text-base font-extrabold tracking-tight text-foreground truncate max-w-[170px] sm:max-w-xs md:max-w-md">
              {isRootDashboard ? `${groomName} & ${brideName}` : currentTitle}
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium truncate">
              {isRootDashboard ? "Workspace Pernikahan" : `${groomName} & ${brideName}`}
            </p>
          </div>

          {/* Desktop Sub-Event Scope Switcher */}
          {events.length > 0 && (
            <div className="hidden md:block pl-3 border-l border-border shrink-0">
              <EventSwitcher
                events={events}
                activeEventId={activeEventId}
                weddingId={weddingId}
                onAddEventClick={onAddEventClick}
              />
            </div>
          )}
        </div>

        {/* Sisi Kanan: Theme Toggle + Lonceng Notifikasi + Avatar Akun Ringkas */}
        <div className="flex items-center space-x-2 shrink-0">
          <ThemeToggle />
          <NotificationBell weddingId={weddingId} />

          {/* Avatar Profil Akun Ringkas (Clean Circle, No Long Text) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full border border-border/80 bg-secondary/40 hover:bg-secondary text-primary font-bold text-xs shadow-2xs shrink-0 meld-bouncy"
                aria-label="Menu Pengguna"
              >
                <span>{userEmail.charAt(0).toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-md">
              <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1 font-semibold truncate">
                {userEmail}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    weddingId
                      ? `/dashboard/${weddingId}/settings/user-profile`
                      : "/dashboard/profile"
                  )
                }
                className="text-xs font-medium cursor-pointer rounded-xl"
              >
                <User className="h-3.5 w-3.5 mr-2 text-primary" />
                Profil Akun Saya
              </DropdownMenuItem>
              {weddingId && (
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/${weddingId}/settings/profile`)}
                  className="text-xs font-medium cursor-pointer rounded-xl"
                >
                  <Home className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  Profil Pernikahan
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => router.push("/vendor/dashboard")}
                className="text-xs font-medium cursor-pointer rounded-xl"
              >
                <Building2 className="h-3.5 w-3.5 mr-2 text-amber-500" />
                Portal Mitra Vendor
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/admin")}
                className="text-xs font-medium cursor-pointer rounded-xl"
              >
                <Shield className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                Superadmin Panel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-xs text-destructive font-semibold cursor-pointer rounded-xl"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Keluar Akun
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
