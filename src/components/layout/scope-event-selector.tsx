"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Layers, Calendar, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface SubEventOption {
  id: string;
  event_name: string;
  event_side?: string | null;
}

export interface ScopeEventSelectorProps {
  weddingId: string;
  events: SubEventOption[];
  allowedEventIds?: string[] | null;
  className?: string;
}

export function ScopeEventSelector({
  weddingId,
  events = [],
  allowedEventIds,
  className,
}: ScopeEventSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openSheet, setOpenSheet] = React.useState(false);

  const currentEventId = searchParams.get("eventId") || "all";

  // Filter jika ada pembatasan hak akses
  const isRestricted =
    Array.isArray(allowedEventIds) &&
    allowedEventIds.length > 0 &&
    !allowedEventIds.includes("all");

  const visibleEvents = isRestricted
    ? events.filter((e) => allowedEventIds.includes(e.id))
    : events;

  // Nama acara aktif untuk label pill
  const activeEvent = visibleEvents.find((e) => e.id === currentEventId);
  const activeLabel =
    currentEventId === "all"
      ? "Semua Acara"
      : activeEvent?.event_name || "Pilih Acara";

  function handleSelect(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") {
      params.delete("eventId");
    } else {
      params.set("eventId", id);
    }
    router.push(`${pathname}?${params.toString()}`);
    setOpenSheet(false);
  }

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <>
      {/* 1. MOBILE VIEW (< sm): SLIDE-UP BOTTOM SHEET CHOICE */}
      <div className="sm:hidden">
        <Dialog open={openSheet} onOpenChange={setOpenSheet}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-border/80 bg-secondary/50 text-[11px] font-semibold text-foreground hover:bg-secondary transition-all meld-bouncy cursor-pointer max-w-[130px] truncate",
                className
              )}
            >
              <span className="truncate">{activeLabel}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
            </button>
          </DialogTrigger>

          <DialogContent className="p-5 pb-8 max-h-[80vh] overflow-y-auto">
            <DialogHeader className="text-left pb-2 border-b border-border/60">
              <DialogTitle className="font-sans text-base font-bold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Pilih Fokus Rangkaian Acara
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-1.5 pt-2">
              {!isRestricted && (
                <button
                  type="button"
                  onClick={() => handleSelect("all")}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all meld-bouncy",
                    currentEventId === "all"
                      ? "border-primary bg-primary/5 font-bold text-foreground"
                      : "border-border/70 hover:bg-muted/50 text-foreground"
                  )}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Semua Acara</p>
                      <p className="text-[10px] text-muted-foreground">Akumulasi total seluruh sub-event</p>
                    </div>
                  </div>
                  {currentEventId === "all" && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              )}

              {visibleEvents.map((evt) => {
                const isSelected = currentEventId === evt.id;
                return (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => handleSelect(evt.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all meld-bouncy",
                      isSelected
                        ? "border-primary bg-primary/5 font-bold text-foreground"
                        : "border-border/70 hover:bg-muted/50 text-foreground"
                    )}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-muted text-foreground flex items-center justify-center font-bold text-xs shrink-0">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{evt.event_name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">
                          {evt.event_side === "joint" ? "Kedua Mempelai" : evt.event_side || "Acara"}
                        </p>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                );
              })}

              <div className="pt-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full h-9 rounded-2xl text-xs font-semibold border-border/80"
                  onClick={() => setOpenSheet(false)}
                >
                  <Link href={`/dashboard/${weddingId}/events`}>
                    <Plus className="h-3.5 w-3.5 mr-1 text-primary" /> Kelola / Tambah Sub-Acara
                  </Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 2. DESKTOP VIEW (>= sm): COMPACT DROPDOWN MENU */}
      <div className="hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-secondary/50 text-xs font-semibold text-foreground hover:bg-secondary transition-all meld-bouncy cursor-pointer max-w-[160px] truncate shadow-2xs",
                className
              )}
            >
              <Layers className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate">{activeLabel}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-56 rounded-2xl p-1.5 shadow-md">
            <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1">
              Fokus Sub-Acara
            </DropdownMenuLabel>

            {!isRestricted && (
              <DropdownMenuItem
                onClick={() => handleSelect("all")}
                className={cn(
                  "text-xs font-medium cursor-pointer rounded-xl flex items-center justify-between",
                  currentEventId === "all" && "bg-primary/10 text-primary font-bold"
                )}
              >
                <span>Semua Acara</span>
                {currentEventId === "all" && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {visibleEvents.map((evt) => {
              const isSelected = currentEventId === evt.id;
              return (
                <DropdownMenuItem
                  key={evt.id}
                  onClick={() => handleSelect(evt.id)}
                  className={cn(
                    "text-xs font-medium cursor-pointer rounded-xl flex items-center justify-between",
                    isSelected && "bg-primary/10 text-primary font-bold"
                  )}
                >
                  <span className="truncate">{evt.event_name}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-xs text-primary font-semibold cursor-pointer rounded-xl">
              <Link href={`/dashboard/${weddingId}/events`}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Kelola Rangkaian Acara
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
