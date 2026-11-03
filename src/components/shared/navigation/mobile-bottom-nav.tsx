"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Users,
  DollarSign,
  Grid,
  Palette,
  CheckSquare,
  Briefcase,
  LayoutGrid,
  Gift,
  Share2,
  Settings,
  User,
  Calendar,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface MobileBottomNavProps {
  weddingId: string;
}

export function MobileBottomNav({ weddingId }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [openMore, setOpenMore] = React.useState(false);

  const baseUrl = `/dashboard/${weddingId}`;

  // 4 Primary Tab Links (Jempol-Friendly)
  const primaryTabs = [
    {
      label: "Beranda",
      href: baseUrl,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Rundown",
      href: `${baseUrl}/rundown`,
      icon: Clock,
      exact: false,
    },
    {
      label: "Checklist",
      href: `${baseUrl}/checklists`,
      icon: CheckSquare,
      exact: false,
    },
    {
      label: "Anggaran",
      href: `${baseUrl}/budget`,
      icon: DollarSign,
      exact: false,
    },
  ];

  // Secondary Menu Categories in Slide-up Bottom Sheet
  const menuCategories = [
    {
      category: "Persiapan & Konsep",
      items: [
        {
          title: "Moodboard & Palet Warna",
          desc: "Swatch warna HEX & inspirasi tema dekorasi",
          href: `${baseUrl}/moodboard`,
          icon: Palette,
          color: "text-rose-500 bg-rose-500/10",
        },
        {
          title: "Vendor Hub & SPK",
          desc: "Katalog vendor & kontrak dokumen PDF",
          href: `${baseUrl}/vendors`,
          icon: Briefcase,
          color: "text-purple-500 bg-purple-500/10",
        },
      ],
    },
    {
      category: "Operasional Hari-H",
      items: [
        {
          title: "Master Tamu & RSVP",
          desc: "Buku tamu undangan, kehadiran & kuota pax",
          href: `${baseUrl}/guests`,
          icon: Users,
          color: "text-blue-500 bg-blue-500/10",
        },
        {
          title: "Rangkaian Acara (Sub-Events)",
          desc: "Lamaran, Akad Nikah, Resepsi & Unduh Mantu",
          href: `${baseUrl}/events`,
          icon: Calendar,
          color: "text-amber-500 bg-amber-500/10",
        },
        {
          title: "Penataan Meja Tamu",
          desc: "Layout denah meja VIP & kapasitas kursi",
          href: `${baseUrl}/seating`,
          icon: LayoutGrid,
          color: "text-sky-500 bg-sky-500/10",
        },
        {
          title: "Log Kado & Angpao",
          desc: "Catatan amplop tunai & kado fisik",
          href: `${baseUrl}/gifts`,
          icon: Gift,
          color: "text-indigo-500 bg-indigo-500/10",
        },
      ],
    },
    {
      category: "Akses & Pengaturan",
      items: [
        {
          title: "Berbagi Link Kru (Share)",
          desc: "Tautan PWA mobile untuk panitia lapangan",
          href: `${baseUrl}/share`,
          icon: Share2,
          color: "text-teal-500 bg-teal-500/10",
        },
        {
          title: "Tim Kolaborator",
          desc: "Hak akses pasangan, keluarga & WO",
          href: `${baseUrl}/settings/collaborators`,
          icon: Settings,
          color: "text-slate-500 bg-slate-500/10",
        },
        {
          title: "Profil Pernikahan",
          desc: "Nama kedua mempelai & orang tua kandung",
          href: `${baseUrl}/settings/profile`,
          icon: User,
          color: "text-primary bg-primary/10",
        },
      ],
    },
  ];

  // Cek apakah halaman saat ini merupakan salah satu dari item di menu drawer
  const isMoreActive = !primaryTabs.some((t) =>
    t.exact ? pathname === t.href : pathname.startsWith(t.href)
  );

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/80 px-2 py-1.5 shadow-lg safe-area-bottom">
        <div className="grid grid-cols-5 items-center justify-around">
          {primaryTabs.map((item) => {
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

          {/* 5th Tab: Trigger Slide-up Bottom Sheet "Menu Lainnya" */}
          <Dialog open={openMore} onOpenChange={setOpenMore}>
            <DialogTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all meld-bouncy cursor-pointer",
                  isMoreActive || openMore
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Buka Menu Fitur Lainnya"
              >
                <div
                  className={cn(
                    "p-1 rounded-full transition-all",
                    isMoreActive || openMore ? "bg-primary/10" : ""
                  )}
                >
                  <Grid
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isMoreActive || openMore ? "scale-110 stroke-[2.5]" : "stroke-[1.8]"
                    )}
                  />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">
                  Lainnya
                </span>
              </button>
            </DialogTrigger>

            <DialogContent className="p-5 pb-8 max-h-[85vh] overflow-y-auto">
              <DialogHeader className="text-left pb-2 border-b border-border/60">
                <DialogTitle className="font-sans text-lg font-bold text-foreground">
                  Semua Fitur Workspace
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 pt-2">
                {menuCategories.map((cat) => (
                  <div key={cat.category} className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {cat.category}
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {cat.items.map((item) => {
                        const Icon = item.icon;
                        const isCurrent = pathname.startsWith(item.href);

                        return (
                          <Link
                            key={item.title}
                            href={item.href}
                            onClick={() => setOpenMore(false)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-2xl border transition-all meld-bouncy",
                              isCurrent
                                ? "bg-primary/5 border-primary text-foreground font-semibold"
                                : "bg-card border-border/70 hover:border-border hover:bg-muted/50 text-foreground"
                            )}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div
                                className={cn(
                                  "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border border-border/40",
                                  item.color
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate">
                                  {item.title}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </nav>
    </>
  );
}
