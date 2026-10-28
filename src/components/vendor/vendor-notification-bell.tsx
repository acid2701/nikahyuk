"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, CheckCircle2, Package, Heart, FileText } from "lucide-react";

export function VendorNotificationBell() {
  const [notifications] = React.useState([
    {
      id: "1",
      title: "Profil Vendor Aktif di Katalog",
      time: "Baru saja",
      desc: "Usaha Anda telah aktif dan dapat dilihat oleh calon pengantin di seluruh Indonesia.",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      id: "2",
      title: "Tips: Tambahkan Paket Penawaran",
      time: "1 jam lalu",
      desc: "Vendor dengan 3+ paket penawaran mendapat 4x lebih banyak impor dari pengantin.",
      icon: FileText,
      color: "text-amber-600 bg-amber-500/10",
    },
  ]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 border-border bg-card hover:bg-muted"
          title="Notifikasi Vendor"
        >
          <Bell className="h-4 w-4 text-foreground" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white shadow-xs">
            2
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 p-0 shadow-lg border-border" align="end">
        <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-amber-500" />
            <h4 className="font-sans font-bold text-sm text-foreground">
              Notifikasi Mitra Vendor
            </h4>
          </div>
          <Badge className="bg-emerald-600 text-white text-[10px]">
            Akun Aktif ✅
          </Badge>
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="p-3 flex items-start space-x-2.5 hover:bg-muted/40 transition-colors text-xs">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground leading-snug">{item.title}</p>
                    <span className="text-[10px] text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
