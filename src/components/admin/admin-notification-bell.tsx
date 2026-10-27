"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Building2, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/db/client";

export function AdminNotificationBell() {
  const [pendingCount, setPendingCount] = React.useState(0);
  const [recentVendors, setRecentVendors] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const supabase = createClient();

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await (supabase.from("vendor_partners" as any) as any)
        .select("*", { count: "exact" })
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      setPendingCount(count || 0);
      setRecentVendors(data || []);
    } catch (err) {
      console.warn("Failed fetching notification bell count:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Auto poll 15s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 border-border bg-card hover:bg-muted"
          title="Notifikasi Admin"
        >
          <Bell className="h-4 w-4 text-foreground" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 p-0 shadow-lg border-border" align="end">
        <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-amber-500" />
            <h4 className="font-serif font-bold text-sm text-foreground">
              Notifikasi Sistem Admin
            </h4>
          </div>
          {pendingCount > 0 && (
            <Badge className="bg-amber-500 text-white text-[10px]">
              {pendingCount} Pending
            </Badge>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
          {pendingCount === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="font-semibold text-foreground">Tidak Ada Pengajuan Menunggu</p>
              <p className="text-[11px]">Semua pendaftaran vendor telah disetujui.</p>
            </div>
          ) : (
            recentVendors.map((vendor) => (
              <Link
                key={vendor.id}
                href="/admin/vendor-partners"
                className="p-3 flex items-start space-x-2.5 hover:bg-muted/50 transition-colors block text-xs"
              >
                <div className="h-7 w-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="font-semibold text-foreground leading-snug">
                    {vendor.company_name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {vendor.category} • {vendor.city}
                  </p>
                  <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1 pt-0.5">
                    <Clock className="h-3 w-3" /> Menunggu Persetujuan
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 self-center" />
              </Link>
            ))
          )}
        </div>

        <div className="p-2 border-t border-border bg-muted/20 text-center">
          <Button asChild variant="ghost" size="sm" className="w-full text-xs text-primary font-semibold h-8">
            <Link href="/admin/vendor-partners">
              Buka Halaman Persetujuan Vendor →
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
