"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DonationQrisModal } from "@/components/shared/modal/donation-qris-modal";

export interface AppSidebarProps {
  weddingId?: string;
  className?: string;
}

export function AppSidebar({ weddingId, className }: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const baseUrl = weddingId ? `/dashboard/${weddingId}` : "/dashboard";

  const navigationItems = [
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
    {
      title: "Checklist Persiapan",
      href: `${baseUrl}/checklists`,
      icon: CheckSquare,
    },
    {
      title: "Live Rundown",
      href: `${baseUrl}/rundown`,
      icon: Clock,
    },
    {
      title: "Anggaran (Budget)",
      href: `${baseUrl}/budget`,
      icon: DollarSign,
    },
    {
      title: "Vendor Hub",
      href: `${baseUrl}/vendors`,
      icon: Briefcase,
    },
    {
      title: "Master Tamu & RSVP",
      href: `${baseUrl}/guests`,
      icon: Users,
    },
    {
      title: "Penataan Tempat Duduk",
      href: `${baseUrl}/seating`,
      icon: LayoutGrid,
    },
    {
      title: "Berbagi Link (Share)",
      href: `${baseUrl}/share`,
      icon: Share2,
    },
    {
      title: "Log Kado & Angpao",
      href: `${baseUrl}/gifts`,
      icon: Gift,
    },
    {
      title: "Profil Pernikahan",
      href: `${baseUrl}/settings/profile`,
      icon: User,
    },
    {
      title: "Profil Saya (Akun)",
      href: `${baseUrl}/settings/user-profile`,
      icon: User,
    },
    {
      title: "Kolaborator",
      href: `${baseUrl}/settings/collaborators`,
      icon: Settings,
    },
  ];

  const [openDonationModal, setOpenDonationModal] = React.useState(false);

  return (
    <>
      <DonationQrisModal open={openDonationModal} onOpenChange={setOpenDonationModal} />
      <aside
        className={cn(
          "w-64 border-r border-border bg-card flex flex-col justify-between h-full min-h-screen p-4 select-none",
          className
        )}
      >
        <div className="space-y-6">
          <div className="px-2 space-y-1">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-primary">
                NikahYuk
              </span>
            </Link>
            <p className="text-[11px] text-muted-foreground">
              Wedding & Event Companion
            </p>
          </div>

          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== baseUrl && pathname.startsWith(item.href));
              const Icon = item.icon;

              const fullHref = eventId ? `${item.href}?eventId=${eventId}` : item.href;

              return (
                <Link
                  key={item.title}
                  href={fullHref}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
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

        <div className="pt-4 border-t border-border space-y-3">
          <button
            type="button"
            onClick={() => setOpenDonationModal(true)}
            className="w-full text-left rounded-lg p-3 bg-secondary/60 hover:bg-secondary border border-border/80 text-secondary-foreground space-y-2 transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-2">
              <HeartHandshake className="h-4 w-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">KlikQRIS Tip Jar</span>
            </div>
            <p className="text-[11px] leading-tight text-muted-foreground">
              Dukung pengembangan NikahYuk via donasi sukarela.
            </p>
            <div className="flex items-center space-x-2 bg-background p-2 rounded border border-border/50">
              <QrCode className="h-6 w-6 text-primary shrink-0" />
              <div className="text-[10px] leading-none">
                <p className="font-semibold text-foreground">Scan QRIS</p>
                <p className="text-muted-foreground mt-0.5">Semua e-Wallet/Bank</p>
              </div>
            </div>
          </button>

          <div className="px-2 text-center text-[10px] text-muted-foreground">
            NikahYuk SaaS v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
}
