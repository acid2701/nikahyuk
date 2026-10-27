"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/server";
import { recordAuditLog } from "@/lib/audit/logger";
import { EventSideEnum } from "@/types/database.types";

export interface CreateEventInput {
  weddingId: string;
  eventName: string;
  eventDate?: string | null;
  timeStart?: string | null;
  timeEnd?: string | null;
  eventSide?: EventSideEnum;
  locationName?: string | null;
  locationMapsUrl?: string | null;
}

export async function createEventAction(input: CreateEventInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: event, error } = await supabase
    .from("wedding_events")
    .insert({
      wedding_id: input.weddingId,
      event_name: input.eventName,
      event_date: input.eventDate || null,
      time_start: input.timeStart || null,
      time_end: input.timeEnd || null,
      event_side: input.eventSide || "joint",
      location_name: input.locationName || null,
      location_maps_url: input.locationMapsUrl || null,
    })
    .select()
    .single();

  if (error || !event) {
    throw new Error(error?.message || "Gagal membuat sub-event.");
  }

  await recordAuditLog({
    weddingId: input.weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Sub-Events",
    actionType: "CREATE",
    changeDiff: { eventName: input.eventName, eventDate: input.eventDate, side: input.eventSide },
  });

  revalidatePath(`/dashboard/${input.weddingId}`);
  return event;
}

export async function updateEventAction(
  eventId: string,
  weddingId: string,
  updates: {
    eventName?: string;
    eventDate?: string | null;
    timeStart?: string | null;
    timeEnd?: string | null;
    eventSide?: EventSideEnum;
    locationName?: string | null;
    locationMapsUrl?: string | null;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: event, error } = await supabase
    .from("wedding_events")
    .update({
      ...(updates.eventName !== undefined && { event_name: updates.eventName }),
      ...(updates.eventDate !== undefined && { event_date: updates.eventDate || null }),
      ...(updates.timeStart !== undefined && { time_start: updates.timeStart || null }),
      ...(updates.timeEnd !== undefined && { time_end: updates.timeEnd || null }),
      ...(updates.eventSide !== undefined && { event_side: updates.eventSide }),
      ...(updates.locationName !== undefined && { location_name: updates.locationName || null }),
      ...(updates.locationMapsUrl !== undefined && { location_maps_url: updates.locationMapsUrl || null }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .select()
    .single();

  if (error || !event) {
    throw new Error(error?.message || "Gagal memperbarui sub-event.");
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "User",
    moduleName: "Sub-Events",
    actionType: "UPDATE",
    changeDiff: { eventId, updates },
  });

  revalidatePath(`/dashboard/${weddingId}`);
  return event;
}

export async function deleteEventAction(eventId: string, weddingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("wedding_events")
    .delete()
    .eq("id", eventId);

  if (error) {
    throw new Error(error.message);
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "User",
    moduleName: "Sub-Events",
    actionType: "DELETE",
    changeDiff: { eventId },
  });

  revalidatePath(`/dashboard/${weddingId}`);
  return { success: true };
}
