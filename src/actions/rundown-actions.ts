"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/audit/logger";
import { RundownItemInput, RundownItemInputSchema } from "@/types/rundown.types";
import { calculateTimelineShift } from "@/lib/utils/timeline-math";

function toRundownDTO(item: any) {
  if (!item) return null;
  return {
    id: item.id,
    event_id: item.eventId,
    time_start: item.timeStart,
    time_end: item.timeEnd,
    activity_title: item.activityTitle,
    pic_name: item.picName || null,
    location: item.location || null,
    contingency_plan: item.contingencyPlan || null,
    is_internal_only: item.isInternalOnly || false,
    is_completed: item.isCompleted || false,
    sort_order: item.sortOrder || 0,
    created_at: item.createdAt?.toISOString?.() || item.createdAt,
    updated_at: item.updatedAt?.toISOString?.() || item.updatedAt,
    eventId: item.eventId,
    timeStart: item.timeStart,
    timeEnd: item.timeEnd,
    activityTitle: item.activityTitle,
    picName: item.picName || null,
    contingencyPlan: item.contingencyPlan || null,
    isInternalOnly: item.isInternalOnly || false,
    isCompleted: item.isCompleted || false,
    sortOrder: item.sortOrder || 0,
    cues: item.cues
      ? item.cues.map((c: any) => ({
          id: c.id,
          rundown_id: c.rundownId,
          cue_type: c.cueType,
          instruction: c.instruction,
          cueType: c.cueType,
        }))
      : [],
  };
}

export async function createRundownItemAction(input: RundownItemInput) {
  const parsed = RundownItemInputSchema.parse(input);
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const existingMax = await prisma.rundown.findFirst({
    where: { eventId: parsed.eventId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const nextSortOrder = existingMax ? existingMax.sortOrder + 1 : 0;

  const item = await prisma.rundown.create({
    data: {
      eventId: parsed.eventId,
      timeStart: parsed.timeStart,
      timeEnd: parsed.timeEnd,
      activityTitle: parsed.activityTitle,
      picName: parsed.picName || null,
      location: parsed.location || null,
      contingencyPlan: parsed.contingencyPlan || null,
      isInternalOnly: parsed.isInternalOnly || false,
      sortOrder: nextSortOrder,
      cues:
        parsed.cues && parsed.cues.length > 0
          ? {
              create: parsed.cues.map((c) => ({
                cueType: c.cueType,
                instruction: c.instruction,
              })),
            }
          : undefined,
    },
    include: {
      cues: true,
    },
  });

  await recordAuditLog({
    weddingId: parsed.weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Rundowns",
    actionType: "CREATE",
    changeDiff: { activityTitle: parsed.activityTitle, timeStart: parsed.timeStart },
  });

  revalidatePath(`/dashboard/${parsed.weddingId}/rundown`);
  revalidatePath(`/dashboard/${parsed.weddingId}`);
  return toRundownDTO(item);
}

export async function toggleRundownItemCompleteAction(
  rundownId: string,
  weddingId: string,
  isCompleted: boolean
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const item = await prisma.rundown.update({
    where: { id: rundownId },
    data: {
      isCompleted,
    },
    include: {
      cues: true,
    },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Rundown Checklist",
    actionType: "UPDATE",
    changeDiff: { rundownId, isCompleted },
  });

  revalidatePath(`/dashboard/${weddingId}/rundown`);
  revalidatePath(`/dashboard/${weddingId}`);
  return toRundownDTO(item);
}

export async function shiftRundownTimelineAction(
  eventId: string,
  weddingId: string,
  targetRundownId: string,
  deltaMinutes: number
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const items = await prisma.rundown.findMany({
    where: { eventId },
    orderBy: { sortOrder: "asc" },
  });

  if (!items || items.length === 0) {
    throw new Error("Tidak ada item rundown yang dapat digeser.");
  }

  const startIndex = items.findIndex((i) => i.id === targetRundownId);
  if (startIndex === -1) {
    throw new Error("Item rundown sasaran tidak ditemukan.");
  }

  const mappedForMath = items.map((i) => ({
    id: i.id,
    timeStart: i.timeStart,
    timeEnd: i.timeEnd,
    orderIndex: i.sortOrder,
  }));

  const shiftedMath = calculateTimelineShift(mappedForMath, startIndex, deltaMinutes);

  await prisma.$transaction(
    shiftedMath.slice(startIndex).map((updatedTimes) =>
      prisma.rundown.update({
        where: { id: updatedTimes.id },
        data: {
          timeStart: updatedTimes.timeStart,
          timeEnd: updatedTimes.timeEnd,
        },
      })
    )
  );

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Timeline Shift Engine",
    actionType: "UPDATE",
    changeDiff: { eventId, targetRundownId, deltaMinutes, shiftedCount: items.length - startIndex },
  });

  revalidatePath(`/dashboard/${weddingId}/rundown`);
  revalidatePath(`/dashboard/${weddingId}`);
  return { success: true, shiftedCount: items.length - startIndex };
}

export async function deleteRundownItemAction(rundownId: string, weddingId: string) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  await prisma.rundown.delete({
    where: { id: rundownId },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Rundowns",
    actionType: "DELETE",
    changeDiff: { rundownId },
  });

  revalidatePath(`/dashboard/${weddingId}/rundown`);
  revalidatePath(`/dashboard/${weddingId}`);
  return { success: true };
}

export async function updateRundownItemAction(
  rundownId: string,
  weddingId: string,
  updates: {
    timeStart?: string;
    timeEnd?: string;
    activityTitle?: string;
    picName?: string | null;
    location?: string | null;
    contingencyPlan?: string | null;
    isInternalOnly?: boolean;
    cues?: { cueType: "sound" | "lighting" | "multimedia" | "music"; instruction: string }[];
  }
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const dataToUpdate: any = {};
  if (updates.timeStart !== undefined) dataToUpdate.timeStart = updates.timeStart;
  if (updates.timeEnd !== undefined) dataToUpdate.timeEnd = updates.timeEnd;
  if (updates.activityTitle !== undefined) dataToUpdate.activityTitle = updates.activityTitle.trim();
  if (updates.picName !== undefined) dataToUpdate.picName = updates.picName?.trim() || null;
  if (updates.location !== undefined) dataToUpdate.location = updates.location?.trim() || null;
  if (updates.contingencyPlan !== undefined) dataToUpdate.contingencyPlan = updates.contingencyPlan?.trim() || null;
  if (updates.isInternalOnly !== undefined) dataToUpdate.isInternalOnly = updates.isInternalOnly;

  if (updates.cues !== undefined) {
    await prisma.rundownCue.deleteMany({
      where: { rundownId },
    });

    if (updates.cues.length > 0) {
      await prisma.rundownCue.createMany({
        data: updates.cues.map((c) => ({
          rundownId,
          cueType: c.cueType,
          instruction: c.instruction.trim(),
        })),
      });
    }
  }

  const item = await prisma.rundown.update({
    where: { id: rundownId },
    data: dataToUpdate,
    include: {
      cues: true,
    },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Rundowns",
    actionType: "UPDATE",
    changeDiff: { rundownId, updates },
  });

  revalidatePath(`/dashboard/${weddingId}/rundown`);
  revalidatePath(`/dashboard/${weddingId}`);
  return toRundownDTO(item);
}
