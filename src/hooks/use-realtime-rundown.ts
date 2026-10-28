"use client";

import { useEffect, useState } from "react";

export function useRealtimeRundown(eventId: string | null) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!eventId) return;

    // Smart Polling: poll updates every 8 seconds when window/tab is active
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        setTick((prev) => prev + 1);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [eventId]);

  return tick > 0 ? { timestamp: Date.now(), eventId } : null;
}
