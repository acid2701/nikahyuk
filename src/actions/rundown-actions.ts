"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordAuditLog } from "@/lib/audit/logger";
import { RundownItemInput, RundownItemInputSchema } from "@/types/rundown.types";
import { calculateTimelineShift } from "@/lib/utils/timeline-math";

export async function createRundownItemAction(input: RundownItemInput) {
  const parsed = RundownItemInputSchema.parse(input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: existing } = await supabase
    .from("rundowns")
    .select("sort_order")
    .eq("event_id", parsed.eventId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data: item, error: itemErr } = await supabase
    .from("rundowns")
    .insert({
      event_id: parsed.eventId,
      time_start: parsed.timeStart,
      time_end: parsed.timeEnd,
      activity_title: parsed.activityTitle,
      pic_name: parsed.picName || null,
      location: parsed.location || null,
      contingency_plan: parsed.contingencyPlan || null,
      is_internal_only: parsed.isInternalOnly || false,
      sort_order: nextSortOrder,
    })
    .select()
    .single();

  if (itemErr || !item) {
    throw new Error(itemErr?.message || "Gagal membuat item rundown.");
  }

  if (parsed.cues && parsed.cues.length > 0) {
    const cueRows = parsed.cues.map((c) => ({
      rundown_id: item.id,
      cue_type: c.cueType,
      instruction: c.instruction,
    }));
    await supabase.from("rundown_cues").insert(cueRows);
  }

  await recordAuditLog({
    weddingId: parsed.weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Rundowns",
    actionType: "CREATE",
    changeDiff: { activityTitle: parsed.activityTitle, timeStart: parsed.timeStart },
  });

  revalidatePath(`/dashboard/${parsed.weddingId}/rundown`);
  return item;
}

export async function toggleRundownItemCompleteAction(
  rundownId: string,
  weddingId: string,
  isCompleted: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: item, error } = await supabase
    .from("rundowns")
    .update({
      is_completed: isCompleted,
      updated_at: new Date().toISOString(),
    })
    .eq("id", rundownId)
    .select()
    .single();

  if (error || !item) {
    throw new Error(error?.message || "Gagal memperbarui status checklist agenda.");
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Rundown Checklist",
    actionType: "UPDATE",
    changeDiff: { rundownId, isCompleted },
  });

  revalidatePath(`/dashboard/${weddingId}/rundown`);
  return item;
}

export async function shiftRundownTimelineAction(
  eventId: string,
  weddingId: string,
  targetRundownId: string,
  deltaMinutes: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: items, error: fetchErr } = await supabase
    .from("rundowns")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  if (fetchErr || !items || items.length === 0) {
    throw new Error("Tidak ada item rundown yang dapat digeser.");
  }

  const startIndex = items.findIndex((i) => i.id === targetRundownId);
  if (startIndex === -1) {
    throw new Error("Item rundown sasaran tidak ditemukan.");
  }

  const mappedForMath = items.map((i) => ({
    id: i.id,
    timeStart: i.time_start,
    timeEnd: i.time_end,
    orderIndex: i.sort_order,
  }));

  const shiftedMath = calculateTimelineShift(mappedForMath, startIndex, deltaMinutes);

  for (let i = startIndex; i < items.length; i++) {
    const updatedTimes = shiftedMath[i];
    await supabase
      .from("rundowns")
      .update({
        time_start: updatedTimes.timeStart,
        time_end: updatedTimes.timeEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("id", updatedTimes.id);
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Timeline Shift Engine",
    actionType: "UPDATE",
    changeDiff: { eventId, targetRundownId, deltaMinutes, shiftedCount: items.length - startIndex },
  });

  revalidatePath(`/dashboard/${weddingId}/rundown`);
  return { success: true, shiftedCount: items.length - startIndex };
}

export async function deleteRundownItemAction(rundownId: string, weddingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("rundowns")
    .delete()
    .eq("id", rundownId);

  if (error) {
    throw new Error(error.message);
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Rundowns",
    actionType: "DELETE",
    changeDiff: { rundownId },
  });

  revalidatePath(`/dashboard/${weddingId}/rundown`);
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: item, error } = await supabase
    .from("rundowns")
    .update({
      ...(updates.timeStart !== undefined && { time_start: updates.timeStart }),
      ...(updates.timeEnd !== undefined && { time_end: updates.timeEnd }),
      ...(updates.activityTitle !== undefined && { activity_title: updates.activityTitle }),
      ...(updates.picName !== undefined && { pic_name: updates.picName || null }),
      ...(updates.location !== undefined && { location: updates.location || null }),
      ...(updates.contingencyPlan !== undefined && { contingency_plan: updates.contingencyPlan || null }),
      ...(updates.isInternalOnly !== undefined && { is_internal_only: updates.isInternalOnly }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", rundownId)
    .select()
    .single();

  if (error || !item) {
    throw new Error(error?.message || "Gagal memperbarui item rundown.");
  }

  if (updates.cues !== undefined) {
    await supabase.from("rundown_cues").delete().eq("rundown_id", rundownId);

    if (updates.cues.length > 0) {
      const cueRows = updates.cues.map((c) => ({
        rundown_id: rundownId,
        cue_type: c.cueType,
        instruction: c.instruction,
      }));
      await supabase.from("rundown_cues").insert(cueRows);
    }
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Rundowns",
    actionType: "UPDATE",
    changeDiff: { rundownId, updates },
  });

  revalidatePath(`/dashboard/${weddingId}/rundown`);
  return item;
}
