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
import { ScopeEventSelector, SubEventOption } from "@/components/layout/scope-event-selector";
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";
import { useToast } from "@/components/ui/use-toast";
import { NotificationBell } from "./notification-bell";
import Link from "next/link";

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
  budget: "Anggaran Biaya",
  vendors: "Vendor Hub",
  guests: "Buku Tamu & RSVP",
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
  userEmail = "user@nikahyu.my.id",
  events = [],
}: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const isRootDashboard =
    pathname === `/dashboard/${weddingId}` || pathname === "/dashboard";

  // Ambil judul halaman saat ini
  const currentSegment = pathname.split("/").filter(Boolean).pop() || "";
  const currentTitle = PAGE_TITLES[currentSegment] || "NikahYuk";

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
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-md safe-area-top select-none shrink-0">
      <div className="max-w-5xl mx-auto h-14 px-3.5 sm:px-6 flex items-center justify-between gap-2">
        {/* SISI KIRI: Brand / Back Button + Sub-Event Pill */}
        <div className="flex items-center space-x-2 min-w-0">
          {!isRootDashboard && weddingId ? (
            <div className="flex items-center space-x-2">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full border border-border/70 hover:bg-muted text-foreground shrink-0 meld-bouncy"
                aria-label="Kembali ke Beranda"
              >
                <Link href={`/dashboard/${weddingId}`}>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="font-sans text-sm sm:text-base font-extrabold tracking-tight text-foreground truncate max-w-[170px] sm:max-w-xs">
                {currentTitle}
              </h1>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5">
              {/* Brand Mark Minimalis */}
              <Link
                href="/"
                className="h-8 w-8 rounded-full bg-[#ff385c] flex items-center justify-center text-white font-extrabold text-xs shadow-xs shrink-0 hover:scale-105 transition-transform"
              >
                N
              </Link>

              {/* Scope Acara Terintegrasi (Bebas Sesak di Mobile) */}
              {weddingId && events.length > 0 && (
                <ScopeEventSelector
                  weddingId={weddingId}
                  events={events}
                />
              )}
            </div>
          )}
        </div>

        {/* SISI KANAN: Theme Toggle + Bell Notifikasi + Avatar Akun */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <ThemeToggle />
          <NotificationBell weddingId={weddingId} />

          {/* Avatar Lingkaran Elegan (Tanpa Teks Email Panjang) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full border border-border/80 bg-secondary/50 hover:bg-secondary text-primary font-bold text-xs shadow-2xs shrink-0 meld-bouncy"
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
