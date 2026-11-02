"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Users,
  DollarSign,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MobileBottomNavProps {
  weddingId: string;
}

export function MobileBottomNav({ weddingId }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Ringkasan",
      href: `/dashboard/${weddingId}`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Rundown",
      href: `/dashboard/${weddingId}/rundown`,
      icon: Clock,
      exact: false,
    },
    {
      label: "Tamu",
      href: `/dashboard/${weddingId}/guests`,
      icon: Users,
      exact: false,
    },
    {
      label: "Anggaran",
      href: `/dashboard/${weddingId}/budget`,
      icon: DollarSign,
      exact: false,
    },
    {
      label: "Moodboard",
      href: `/dashboard/${weddingId}/moodboard`,
      icon: Palette,
      exact: false,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/80 px-2 py-1.5 shadow-lg safe-area-bottom">
      <div className="grid grid-cols-5 items-center justify-around">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all meld-bouncy",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-full transition-all",
                  isActive ? "bg-primary/10" : ""
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.8]"
                  )}
                />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
