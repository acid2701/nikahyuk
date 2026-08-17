"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Shield } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";

export interface DashboardHeaderProps {
  groomName?: string;
  brideName?: string;
  userEmail?: string;
  events?: SubEventOption[];
  activeEventId?: string;
  onAddEventClick?: () => void;
}

export function DashboardHeader({
  groomName = "Pengantin Pria",
  brideName = "Pengantin Wanita",
  userEmail = "user@nikahyuk.com",
  events = [],
  activeEventId,
  onAddEventClick,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

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
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-4">
        <div>
          <h2 className="font-serif text-lg font-semibold tracking-tight text-foreground">
            {groomName} & {brideName}
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Workspace Pernikahan
          </p>
        </div>

        {events.length > 0 && (
          <div className="pl-4 border-l border-border">
            <EventSwitcher
              events={events}
              activeEventId={activeEventId}
              onAddEventClick={onAddEventClick}
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
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
              onClick={() => router.push("/admin/storage-config")}
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
    </header>
  );
}
