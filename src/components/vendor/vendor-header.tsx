"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogOut, User, Shield, ChevronRight, Home, Heart, Building2 } from "lucide-react";
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
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";
import { VendorNotificationBell } from "./vendor-notification-bell";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export function VendorHeader({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const { toast } = useToast();
  const supabase = createClient();

  const tabLabels: Record<string, string> = {
    overview: "Ringkasan",
    packages: "Kelola Paket Penawaran",
    crm: "CRM Client & Deals",
    profile: "Profil Usaha & Pricelist R2",
    analytics: "Visibilitas & Kontak",
  };

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast({
      title: "Berhasil Keluar",
      description: "Anda telah keluar dari akun NikahYuk.",
    });
    router.push("/login");
    router.refresh();
  }

  const initialLetter = userEmail.charAt(0).toUpperCase();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-20 shrink-0 select-none">
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between">
        {/* Left Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs">
          <Link href="/vendor/dashboard" className="text-muted-foreground hover:text-foreground font-medium">
            Portal Vendor
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-semibold text-foreground">
            {tabLabels[tab] || "Ringkasan"}
          </span>
        </div>

        {/* Right Controls matching DashboardHeader */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <VendorNotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 p-0 border border-primary/30"
              >
                <span className="font-serif font-bold text-xs text-primary">
                  {initialLetter}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Mitra Vendor Terhubung
              </DropdownMenuLabel>
              <DropdownMenuItem className="text-xs font-medium truncate">
                <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                {userEmail}
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => router.push("/dashboard")}
                className="text-xs font-medium cursor-pointer"
              >
                <Heart className="h-3.5 w-3.5 mr-2 text-rose-500 fill-rose-500/20" />
                Workspace Pengantin Saya
              </DropdownMenuItem>

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
    </header>
  );
}
