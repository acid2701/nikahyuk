"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Layers, Sparkles, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SubEventOption {
  id: string;
  event_name: string;
  event_side?: string | null;
}

export interface EventScopeHeaderProps {
  weddingId: string;
  events: SubEventOption[];
  allowedEventIds?: string[] | null; // null/empty means owner (all allowed)
  className?: string;
}

export function EventScopeHeader({
  weddingId,
  events,
  allowedEventIds,
  className,
}: EventScopeHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentEventId = searchParams.get("eventId") || "all";

  // Filter events based on collaborator permission if restricted
  const isRestricted =
    Array.isArray(allowedEventIds) &&
    allowedEventIds.length > 0 &&
    !allowedEventIds.includes("all");

  const visibleEvents = isRestricted
    ? events.filter((e) => allowedEventIds.includes(e.id))
    : events;

  // Determine if the current page requires strict event scoping (e.g., rundown, seating)
  const isStrictEventPage =
    pathname.includes("/rundown") ||
    pathname.includes("/seating") ||
    pathname.includes("/gifts");

  function handleSelectEvent(selectedId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedId === "all") {
      params.delete("eventId");
    } else {
      params.set("eventId", selectedId);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-card/80 backdrop-blur-xs border-b border-border/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs",
        className
      )}
    >
      <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar">
        <span className="text-[11px] font-semibold text-muted-foreground shrink-0 uppercase tracking-wider flex items-center gap-1">
          <Layers className="h-3.5 w-3.5 text-primary" /> Scope Acara:
        </span>

        {/* 'Semua Acara' Option (Only available for non-strict pages and non-restricted users) */}
        {!isStrictEventPage && !isRestricted && (
          <button
            type="button"
            onClick={() => handleSelectEvent("all")}
            className={cn(
              "px-3 py-1 rounded-full font-medium text-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer",
              currentEventId === "all"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "bg-secondary/60 text-secondary-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Sparkles className="h-3 w-3" />
            Semua Acara (Akumulasi Total)
          </button>
        )}

        {/* Sub-Events List */}
        {visibleEvents.map((evt) => {
          const isActive = currentEventId === evt.id;
          const isLamaran = evt.event_name.toLowerCase().includes("lamaran") || evt.event_name.toLowerCase().includes("tunangan");
          const isAkad = evt.event_name.toLowerCase().includes("akad");

          return (
            <button
              key={evt.id}
              type="button"
              onClick={() => handleSelectEvent(evt.id)}
              className={cn(
                "px-3 py-1 rounded-full font-medium text-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs ring-2 ring-primary/30"
                  : "bg-secondary/60 text-secondary-foreground hover:bg-secondary hover:text-foreground border border-border/50"
              )}
            >
              <span>
                {isLamaran ? "💍" : isAkad ? "🕌" : "💒"}
              </span>
              <span>{evt.event_name}</span>
            </button>
          );
        })}
      </div>

      {isRestricted && (
        <div className="flex items-center gap-1 text-[11px] text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
          <Lock className="h-3 w-3 shrink-0" />
          <span>Akses Terbatas: Hanya Sub-Event Berizin</span>
        </div>
      )}
    </div>
  );
}
