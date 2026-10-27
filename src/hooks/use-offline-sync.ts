"use client";

import { useEffect, useState, useCallback } from "react";
import { offlineDB, MutationQueueItem } from "@/lib/db/dexie-offline";
import { createClient } from "@/lib/db/client";
import { useToast } from "@/components/ui/use-toast";

export function useOfflineSync(eventId: string | null) {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const { toast } = useToast();

  const updatePendingCount = useCallback(async () => {
    try {
      const count = await offlineDB.mutationQueue.count();
      setPendingSyncCount(count);
    } catch {
      setPendingSyncCount(0);
    }
  }, []);

  const flushMutationQueue = useCallback(async () => {
    if (!eventId || isSyncing) return;

    try {
      const pendingMutations = await offlineDB.mutationQueue.orderBy("timestamp").toArray();
      if (pendingMutations.length === 0) return;

      setIsSyncing(true);
      const db = createClient();
      let flushedCount = 0;

      for (const item of pendingMutations) {
        try {
          if (item.actionType === "CHECKIN") {
            await db
              .from("event_guest_assignments")
              .update({
                attendance_status: item.payload.attendanceStatus,
                checkin_timestamp: item.payload.checkinTimestamp,
                updated_at: new Date(item.timestamp).toISOString(),
              })
              .eq("id", item.payload.assignmentId);
          } else if (item.actionType === "SOUVENIR") {
            await db
              .from("event_guest_assignments")
              .update({
                souvenir_received: item.payload.souvenirReceived,
                updated_at: new Date(item.timestamp).toISOString(),
              })
              .eq("id", item.payload.assignmentId);
          } else if (item.actionType === "WALKIN") {
            const { data: newGuest } = await db
              .from("guests")
              .insert({
                wedding_id: item.payload.weddingId,
                full_name: `${item.payload.walkinName} (Walk-in)`,
                default_pax: item.payload.walkinPax || 1,
              })
              .select()
              .single();

            if (newGuest) {
              await db.from("event_guest_assignments").insert({
                event_id: item.payload.eventId,
                guest_id: newGuest.id,
                actual_pax: item.payload.walkinPax || 1,
                attendance_status: "checked_in",
                is_walk_in: true,
                checkin_timestamp: new Date(item.timestamp).toISOString(),
              });
            }
          }

          if (item.id !== undefined) {
            await offlineDB.mutationQueue.delete(item.id);
          }
          flushedCount++;
        } catch (err) {
          console.error("Failed to flush single mutation", err);
        }
      }

      await updatePendingCount();

      if (flushedCount > 0) {
        toast({
          title: "Sinkronisasi Offline Selesai",
          description: `Berhasil mengunggah ${flushedCount} perubahan data saat offline ke server.`,
          variant: "success",
        });
      }
    } catch (err) {
      console.error("Error flushing mutation queue:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [eventId, isSyncing, toast, updatePendingCount]);

  useEffect(() => {
    updatePendingCount();

    function handleOnline() {
      setIsOnline(true);
      flushMutationQueue();
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (navigator.onLine) {
      flushMutationQueue();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [flushMutationQueue, updatePendingCount]);

  return {
    isOnline,
    pendingSyncCount,
    isSyncing,
    flushMutationQueue,
    updatePendingCount,
  };
}
