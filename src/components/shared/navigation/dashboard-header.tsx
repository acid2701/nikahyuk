"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, User, Shield, ChevronRight, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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
import { MobileSidebarDrawer } from "./mobile-sidebar-drawer";
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

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  events: "Sub-Events",
  budget: "Anggaran",
  vendors: "Vendor Hub",
  guests: "Master Tamu",
  seating: "Penataan Duduk",
  rundown: "Live Rundown",
  checklists: "Checklist",
  gifts: "Log Kado",
  "audit-logs": "Audit Trail",
  settings: "Pengaturan",
  collaborators: "Kolaborator",
  profile: "Profil Acara",
  "user-profile": "Profil Saya",
  share: "Berbagi Link",
  tokens: "Token Publik",
  "export-delete": "Ekspor & Hapus",
};

function generateBreadcrumbs(
  pathname: string,
  weddingId?: string
): { label: string; href: string }[] {
  const crumbs: { label: string; href: string }[] = [];

  crumbs.push({ label: "Dashboard", href: "/dashboard" });

  if (!weddingId) return crumbs;

  const weddingBase = `/dashboard/${weddingId}`;
  const afterWedding = pathname.replace(weddingBase, "").replace(/^\//, "");

  if (!afterWedding) {
    crumbs.push({ label: "Ringkasan", href: weddingBase });
    return crumbs;
  }

  const segments = afterWedding.split("/").filter(Boolean);
  let currentPath = weddingBase;

  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = BREADCRUMB_LABELS[segment] || segment;
    crumbs.push({ label, href: currentPath });
  }

  return crumbs;
}

export function DashboardHeader({

  weddingId,
  groomName = "Pengantin Pria",
  brideName = "Pengantin Wanita",
  userEmail = "user@nikahyuk.com",
  events = [],
  activeEventId,
  onAddEventClick,
}: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const supabase = createClient();

  const breadcrumbs = generateBreadcrumbs(pathname, weddingId);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast({
      title: "Berhasil Keluar",
      description: "Anda telah keluar dari akun NikahYuk.",
      variant: "success",
    });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-border bg-card shrink-0">
      {/* Top Bar: Mobile Hamburger + Couple Name + Event Switcher + Theme Toggle + User Profile */}
      <div className="h-14 px-3 sm:px-6 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <MobileSidebarDrawer weddingId={weddingId} />
          <div className="min-w-0">
            <h2 className="font-serif text-xs sm:text-base font-semibold tracking-tight text-foreground leading-tight truncate max-w-[130px] sm:max-w-xs md:max-w-md">
              {groomName} & {brideName}
            </h2>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight truncate">
              Workspace Pernikahan
            </p>
          </div>

          {events.length > 0 && (
            <div className="hidden sm:block pl-3 sm:pl-4 border-l border-border shrink-0">
              <EventSwitcher
                events={events}
                activeEventId={activeEventId}
                weddingId={weddingId}
                onAddEventClick={onAddEventClick}
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <ThemeToggle />
          <NotificationBell weddingId={weddingId} />



          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 rounded-full px-3 py-1 bg-secondary/50 hover:bg-secondary"
              >
                <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-foreground max-w-[120px] truncate">
                  {userEmail}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Akun Terhubung
              </DropdownMenuLabel>
              <DropdownMenuItem className="text-xs font-medium truncate">
                <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                {userEmail}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    weddingId
                      ? `/dashboard/${weddingId}/settings/user-profile`
                      : "/dashboard/profile"
                  )
                }
                className="text-xs font-medium cursor-pointer"
              >
                <User className="h-3.5 w-3.5 mr-2 text-primary" />
                Profil Akun Saya
              </DropdownMenuItem>
              {weddingId && (
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/${weddingId}/settings/profile`)}
                  className="text-xs font-medium cursor-pointer"
                >
                  <Home className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  Profil Pernikahan
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => router.push("/admin")}
                className="text-xs font-medium cursor-pointer"
              >
                <Shield className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                Superadmin Panel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-xs text-destructive font-medium cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Keluar Akun
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Breadcrumbs Bar */}
      {breadcrumbs.length > 1 && (
        <div className="h-8 px-6 flex items-center bg-muted/30 border-t border-border/50">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center space-x-1 text-[11px]"
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.href}>
                  {index > 0 && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                  )}
                  {isLast ? (
                    <span className="font-semibold text-foreground truncate max-w-[160px]">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-muted-foreground hover:text-primary transition-colors truncate max-w-[120px]"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
