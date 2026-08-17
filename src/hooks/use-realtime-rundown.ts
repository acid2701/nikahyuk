"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeRundown(eventId: string | null) {
  const [lastRundownEvent, setLastRundownEvent] = useState<any>(null);

  useEffect(() => {
    if (!eventId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-rundown-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rundowns",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          setLastRundownEvent(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  return lastRundownEvent;
}
