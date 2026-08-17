"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar, ChevronDown, Plus, Check } from "lucide-react";
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
  event_date?: string | null;
  event_side: "groom" | "bride" | "joint";
}

export interface EventSwitcherProps {
  events: SubEventOption[];
  activeEventId?: string;
  weddingId?: string;
  onAddEventClick?: () => void;
}

export function EventSwitcher({
  events,
  activeEventId,
  weddingId,
  onAddEventClick,
}: EventSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlEventId = searchParams.get("eventId");
  const [selectedId, setSelectedId] = React.useState<string | undefined>(
    activeEventId || urlEventId || events[0]?.id
  );

  React.useEffect(() => {
    if (urlEventId) {
      setSelectedId(urlEventId);
    } else if (activeEventId) {
      setSelectedId(activeEventId);
    } else if (events.length > 0) {
      setSelectedId(events[0].id);
    }
  }, [urlEventId, activeEventId, events]);

  const currentEvent =
    events.find((e) => e.id === selectedId) || events[0];

  function handleSelectEvent(eventId: string) {
    setSelectedId(eventId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("eventId", eventId);
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  }

  function handleNavigateToEvents() {
    if (weddingId) {
      router.push(`/dashboard/${weddingId}/events`);
    } else if (onAddEventClick) {
      onAddEventClick();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 h-9 px-3 border-border/80 bg-card hover:bg-accent text-sm font-medium shadow-xs"
        >
          <Calendar className="h-4 w-4 text-primary" />
          <span className="truncate max-w-[140px] font-semibold text-foreground">
            {currentEvent ? currentEvent.event_name : "Pilih Acara"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Sub-Event Pernikahan
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {events.length === 0 ? (
          <DropdownMenuItem disabled>Belum ada sub-event</DropdownMenuItem>
        ) : (
          events.map((event) => {
            const isSelected = event.id === currentEvent?.id;
            return (
              <DropdownMenuItem
                key={event.id}
                onClick={() => handleSelectEvent(event.id)}
                className={`flex items-center justify-between cursor-pointer ${
                  isSelected ? "bg-primary/10 font-semibold text-primary" : ""
                }`}
              >
                <div className="flex items-center space-x-2">
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                  <span className="text-sm">{event.event_name}</span>
                </div>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {event.event_side}
                </span>
              </DropdownMenuItem>
            );
          })
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleNavigateToEvents}
          className="flex items-center gap-2 text-primary font-medium cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Kelola / Tambah Sub-Event Baru
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
