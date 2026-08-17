"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar, ChevronDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface SubEventOption {
  id: string;
  event_name: string;
  event_date: string;
  event_side: "groom" | "bride" | "joint";
}

export interface EventSwitcherProps {
  events: SubEventOption[];
  activeEventId?: string;
  onAddEventClick?: () => void;
}

export function EventSwitcher({
  events,
  activeEventId,
  onAddEventClick,
}: EventSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentEvent =
    events.find((e) => e.id === activeEventId) || events[0];

  function handleSelectEvent(eventId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("eventId", eventId);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 h-9 px-3 border-border/80 bg-card hover:bg-accent text-sm font-medium"
        >
          <Calendar className="h-4 w-4 text-primary" />
          <span className="truncate max-w-[140px] font-semibold">
            {currentEvent ? currentEvent.event_name : "Pilih Acara"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Sub-Event Pernikahan
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {events.length === 0 ? (
          <DropdownMenuItem disabled>Belum ada sub-event</DropdownMenuItem>
        ) : (
          events.map((event) => (
            <DropdownMenuItem
              key={event.id}
              onClick={() => handleSelectEvent(event.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="font-medium text-sm">{event.event_name}</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {event.event_side}
              </span>
            </DropdownMenuItem>
          ))
        )}
        {onAddEventClick && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onAddEventClick}
              className="flex items-center gap-2 text-primary font-medium cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Tambah Sub-Event
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
