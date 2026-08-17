"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeCheckin(eventId: string | null) {
  const [lastCheckinEvent, setLastCheckinEvent] = useState<any>(null);

  useEffect(() => {
    if (!eventId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-checkin-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_guest_assignments",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          setLastCheckinEvent(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  return lastCheckinEvent;
}
