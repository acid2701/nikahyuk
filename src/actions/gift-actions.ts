"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordAuditLog } from "@/lib/audit/logger";
import { EventSideEnum, GiftTypeEnum } from "@/types/database.types";

export interface CreateGiftLogInput {
  weddingId: string;
  eventId: string;
  guestId?: string | null;
  giverName: string;
  giftType: GiftTypeEnum;
  amount?: number | null;
  itemDescription?: string | null;
  giverSide: EventSideEnum;
  notes?: string | null;
}

export async function createGiftLogAction(input: CreateGiftLogInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: gift, error } = await supabase
    .from("gifts_log")
    .insert({
      event_id: input.eventId,
      guest_id: input.guestId || null,
      giver_name: input.giverName.trim(),
      gift_type: input.giftType,
      amount: input.amount || 0,
      item_description: input.itemDescription || null,
      giver_side: input.giverSide,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error || !gift) {
    throw new Error(error?.message || "Gagal membuat pencatatan kado/angpao.");
  }

  await recordAuditLog({
    weddingId: input.weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Gifts Log",
    actionType: "CREATE",
    changeDiff: { giverName: input.giverName, giftType: input.giftType, amount: input.amount },
  });

  revalidatePath(`/dashboard/${input.weddingId}/gifts`);
  return gift;
}

export async function updateGiftLogAction(
  giftId: string,
  weddingId: string,
  updates: {
    giverName?: string;
    giftType?: GiftTypeEnum;
    amount?: number | null;
    itemDescription?: string | null;
    giverSide?: EventSideEnum;
    notes?: string | null;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: gift, error } = await supabase
    .from("gifts_log")
    .update({
      ...(updates.giverName !== undefined && { giver_name: updates.giverName.trim() }),
      ...(updates.giftType !== undefined && { gift_type: updates.giftType }),
      ...(updates.amount !== undefined && { amount: updates.amount || 0 }),
      ...(updates.itemDescription !== undefined && { item_description: updates.itemDescription || null }),
      ...(updates.giverSide !== undefined && { giver_side: updates.giverSide }),
      ...(updates.notes !== undefined && { notes: updates.notes || null }),
    })
    .eq("id", giftId)
    .select()
    .single();

  if (error || !gift) {
    throw new Error(error?.message || "Gagal memperbarui catatan kado.");
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Gifts Log",
    actionType: "UPDATE",
    changeDiff: { giftId, updates },
  });

  revalidatePath(`/dashboard/${weddingId}/gifts`);
  return gift;
}

export async function deleteGiftLogAction(giftId: string, weddingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("gifts_log").delete().eq("id", giftId);

  if (error) {
    throw new Error(error.message);
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Gifts Log",
    actionType: "DELETE",
    changeDiff: { giftId },
  });

  revalidatePath(`/dashboard/${weddingId}/gifts`);
  return { success: true };
}
