"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
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

function toGiftDTO(g: any) {
  if (!g) return null;
  return {
    id: g.id,
    event_id: g.eventId,
    guest_id: g.guestId || null,
    giver_name: g.itemDescription || "Tamu",
    gift_type: g.giftType,
    amount: Number(g.cashAmount) || 0,
    cash_amount: Number(g.cashAmount) || 0,
    item_description: g.itemDescription || null,
    giver_side: g.receivedBy || "joint",
    received_by: g.receivedBy || "joint",
    received_at: g.receivedAt?.toISOString?.() || g.receivedAt,
    eventId: g.eventId,
    guestId: g.guestId || null,
    giftType: g.giftType,
    cashAmount: Number(g.cashAmount) || 0,
    itemDescription: g.itemDescription || null,
    receivedBy: g.receivedBy || "joint",
    receivedAt: g.receivedAt,
  };
}

export async function createGiftLogAction(input: CreateGiftLogInput) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const gift = await prisma.giftLog.create({
    data: {
      eventId: input.eventId,
      guestId: input.guestId || null,
      giftType: input.giftType || "cash",
      cashAmount: input.amount || 0,
      itemDescription: input.itemDescription || input.giverName || null,
      receivedBy: input.giverSide || "joint",
    },
  });

  await recordAuditLog({
    weddingId: input.weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Gifts Log",
    actionType: "CREATE",
    changeDiff: { giverName: input.giverName, giftType: input.giftType, amount: input.amount },
  });

  revalidatePath(`/dashboard/${input.weddingId}/gifts`);
  return toGiftDTO(gift);
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
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const dataToUpdate: any = {};
  if (updates.giftType !== undefined) dataToUpdate.giftType = updates.giftType;
  if (updates.amount !== undefined) dataToUpdate.cashAmount = updates.amount || 0;
  if (updates.itemDescription !== undefined || updates.giverName !== undefined) {
    dataToUpdate.itemDescription = updates.itemDescription || updates.giverName || null;
  }
  if (updates.giverSide !== undefined) dataToUpdate.receivedBy = updates.giverSide;

  const gift = await prisma.giftLog.update({
    where: { id: giftId },
    data: dataToUpdate,
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Gifts Log",
    actionType: "UPDATE",
    changeDiff: { giftId, updates },
  });

  revalidatePath(`/dashboard/${weddingId}/gifts`);
  return toGiftDTO(gift);
}

export async function deleteGiftLogAction(giftId: string, weddingId: string) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  await prisma.giftLog.delete({
    where: { id: giftId },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Gifts Log",
    actionType: "DELETE",
    changeDiff: { giftId },
  });

  revalidatePath(`/dashboard/${weddingId}/gifts`);
  return { success: true };
}
