"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
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

function toEventDTO(e: any) {
  if (!e) return null;
  return {
    id: e.id,
    wedding_id: e.weddingId,
    event_name: e.eventName,
    event_date: e.eventDate
      ? e.eventDate instanceof Date
        ? e.eventDate.toISOString().split("T")[0]
        : String(e.eventDate).split("T")[0]
      : null,
    time_start: e.timeStart || null,
    time_end: e.timeEnd || null,
    event_side: e.eventSide || "joint",
    location_name: e.locationName || null,
    location_maps_url: e.locationMapsUrl || null,
    created_at: e.createdAt?.toISOString?.() || e.createdAt,
    updated_at: e.updatedAt?.toISOString?.() || e.updatedAt,
    weddingId: e.weddingId,
    eventName: e.eventName,
    eventDate: e.eventDate,
    timeStart: e.timeStart,
    timeEnd: e.timeEnd,
    eventSide: e.eventSide,
    locationName: e.locationName,
    locationMapsUrl: e.locationMapsUrl,
  };
}

export async function createEventAction(input: CreateEventInput) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const parsedDate = input.eventDate ? new Date(input.eventDate) : new Date();

  const event = await prisma.weddingEvent.create({
    data: {
      weddingId: input.weddingId,
      eventName: input.eventName.trim(),
      eventDate: parsedDate,
      timeStart: input.timeStart || null,
      timeEnd: input.timeEnd || null,
      eventSide: input.eventSide || "joint",
      locationName: input.locationName?.trim() || null,
      locationMapsUrl: input.locationMapsUrl?.trim() || null,
    },
  });

  await recordAuditLog({
    weddingId: input.weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Sub-Events",
    actionType: "CREATE",
    changeDiff: { eventName: input.eventName, eventDate: input.eventDate, side: input.eventSide },
  });

  revalidatePath(`/dashboard/${input.weddingId}`);
  return toEventDTO(event);
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
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const dataToUpdate: any = {};
  if (updates.eventName !== undefined) dataToUpdate.eventName = updates.eventName.trim();
  if (updates.eventDate !== undefined && updates.eventDate) {
    dataToUpdate.eventDate = new Date(updates.eventDate);
  }
  if (updates.timeStart !== undefined) dataToUpdate.timeStart = updates.timeStart || null;
  if (updates.timeEnd !== undefined) dataToUpdate.timeEnd = updates.timeEnd || null;
  if (updates.eventSide !== undefined) dataToUpdate.eventSide = updates.eventSide;
  if (updates.locationName !== undefined) dataToUpdate.locationName = updates.locationName?.trim() || null;
  if (updates.locationMapsUrl !== undefined) dataToUpdate.locationMapsUrl = updates.locationMapsUrl?.trim() || null;

  const event = await prisma.weddingEvent.update({
    where: { id: eventId },
    data: dataToUpdate,
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "User",
    moduleName: "Sub-Events",
    actionType: "UPDATE",
    changeDiff: { eventId, updates },
  });

  revalidatePath(`/dashboard/${weddingId}`);
  return toEventDTO(event);
}

export async function deleteEventAction(eventId: string, weddingId: string) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  await prisma.weddingEvent.delete({
    where: { id: eventId },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "User",
    moduleName: "Sub-Events",
    actionType: "DELETE",
    changeDiff: { eventId },
  });

  revalidatePath(`/dashboard/${weddingId}`);
  return { success: true };
}
