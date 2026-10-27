"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/db/client";

export function useRealtimeCheckin(eventId: string | null) {
  const [lastCheckinEvent, setLastCheckinEvent] = useState<any>(null);

  useEffect(() => {
    if (!eventId) return;

    const db = createClient();
    const channel = db
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
      db.removeChannel(channel);
    };
  }, [eventId]);

  return lastCheckinEvent;
}
