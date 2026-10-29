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
  let giverName = g.guest?.fullName || "";
  let itemDesc = g.itemDescription || "";

  if (!giverName) {
    if (g.giftType === "cash") {
      giverName = g.itemDescription || "Tamu";
      itemDesc = "Angpao Tunai";
    } else if (itemDesc.includes(" - ")) {
      const parts = itemDesc.split(" - ");
      giverName = parts[0]?.trim() || "Tamu";
      itemDesc = parts.slice(1).join(" - ")?.trim() || "Kado Fisik";
    } else {
      giverName = g.itemDescription || "Tamu";
    }
  }

  return {
    id: g.id,
    event_id: g.eventId,
    guest_id: g.guestId || null,
    giver_name: giverName,
    gift_type: g.giftType,
    amount: Number(g.cashAmount) || 0,
    cash_amount: Number(g.cashAmount) || 0,
    item_description: itemDesc,
    giver_side: g.receivedBy || "joint",
    received_by: g.receivedBy || "joint",
    notes: null,
    created_at: g.receivedAt?.toISOString?.() || String(g.receivedAt || new Date().toISOString()),
    received_at: g.receivedAt?.toISOString?.() || String(g.receivedAt || new Date().toISOString()),
    eventId: g.eventId,
    guestId: g.guestId || null,
    giftType: g.giftType,
    cashAmount: Number(g.cashAmount) || 0,
    itemDescription: itemDesc,
    receivedBy: g.receivedBy || "joint",
    receivedAt: g.receivedAt,
  };
}

export async function createGiftLogAction(input: CreateGiftLogInput) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const fullDesc =
    input.giftType === "cash"
      ? input.giverName?.trim() || "Tamu"
      : `${input.giverName?.trim() || "Tamu"} - ${input.itemDescription?.trim() || "Kado Fisik"}`;

  const gift = await prisma.giftLog.create({
    data: {
      eventId: input.eventId,
      guestId: input.guestId || null,
      giftType: input.giftType || "cash",
      cashAmount: input.amount || 0,
      itemDescription: fullDesc,
      receivedBy: input.giverSide || "joint",
    },
    include: {
      guest: true,
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
  revalidatePath(`/dashboard/${input.weddingId}`);
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
  if (updates.giverName !== undefined || updates.itemDescription !== undefined) {
    const gName = updates.giverName?.trim() || "Tamu";
    const gType = updates.giftType || "cash";
    dataToUpdate.itemDescription =
      gType === "cash"
        ? gName
        : `${gName} - ${updates.itemDescription?.trim() || "Kado Fisik"}`;
  }
  if (updates.giverSide !== undefined) dataToUpdate.receivedBy = updates.giverSide;

  const gift = await prisma.giftLog.update({
    where: { id: giftId },
    data: dataToUpdate,
    include: {
      guest: true,
    },
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
  revalidatePath(`/dashboard/${weddingId}`);
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
  revalidatePath(`/dashboard/${weddingId}`);
  return { success: true };
}
