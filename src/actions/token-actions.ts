"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/audit/logger";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface CreateShareTokenInput {
  weddingId: string;
  pin?: string | null;
  expiresDays?: number;
  moduleAccess?: {
    canCheckin?: boolean;
    canViewRundown?: boolean;
    canViewGuests?: boolean;
  };
  hideInternalNotes?: boolean;
}

function toTokenDTO(t: any) {
  if (!t) return null;
  return {
    id: t.id,
    wedding_id: t.weddingId,
    token_hash: t.tokenHash,
    pin_hash: t.pinHash,
    module_access: t.moduleAccess,
    hide_internal_notes: t.hideInternalNotes,
    expires_at: t.expiresAt?.toISOString?.() || t.expiresAt,
    is_active: t.isActive,
    created_at: t.createdAt?.toISOString?.() || t.createdAt,
    weddingId: t.weddingId,
    tokenHash: t.tokenHash,
    pinHash: t.pinHash,
    moduleAccess: t.moduleAccess,
    hideInternalNotes: t.hideInternalNotes,
    expiresAt: t.expiresAt,
    isActive: t.isActive,
  };
}

export async function createShareTokenAction(input: CreateShareTokenInput) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const plainToken = "vt_" + crypto.randomBytes(12).toString("hex");
  const pinHash = input.pin ? await bcrypt.hash(input.pin, 10) : null;

  const expiresDays = input.expiresDays || 30;
  const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

  const moduleAccess = input.moduleAccess || {
    canCheckin: true,
    canViewRundown: true,
    canViewGuests: true,
  };

  const tokenRecord = await prisma.shareableToken.create({
    data: {
      weddingId: input.weddingId,
      tokenHash: plainToken,
      pinHash,
      moduleAccess: moduleAccess as any,
      hideInternalNotes: input.hideInternalNotes ?? true,
      expiresAt,
      isActive: true,
    },
  });

  await recordAuditLog({
    weddingId: input.weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Shareable Tokens",
    actionType: "CREATE",
    changeDiff: { tokenHash: plainToken, expiresAt: expiresAt.toISOString() },
  });

  revalidatePath(`/dashboard/${input.weddingId}/share`);
  revalidatePath(`/dashboard/${input.weddingId}`);
  return { tokenRecord: toTokenDTO(tokenRecord), plainToken };
}

export async function toggleShareTokenActiveAction(
  tokenId: string,
  weddingId: string,
  isActive: boolean
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const tokenRecord = await prisma.shareableToken.update({
    where: { id: tokenId },
    data: { isActive },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Shareable Tokens",
    actionType: "UPDATE",
    changeDiff: { tokenId, isActive },
  });

  revalidatePath(`/dashboard/${weddingId}/share`);
  revalidatePath(`/dashboard/${weddingId}`);
  return toTokenDTO(tokenRecord);
}

export async function resetShareTokenPINAction(
  tokenId: string,
  weddingId: string,
  newPin: string | null
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const pinHash = newPin ? await bcrypt.hash(newPin, 10) : null;

  const tokenRecord = await prisma.shareableToken.update({
    where: { id: tokenId },
    data: { pinHash },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Shareable Tokens",
    actionType: "UPDATE",
    changeDiff: { tokenId, hasPin: Boolean(newPin) },
  });

  revalidatePath(`/dashboard/${weddingId}/share`);
  revalidatePath(`/dashboard/${weddingId}`);
  return toTokenDTO(tokenRecord);
}

export async function deleteShareTokenAction(tokenId: string, weddingId: string) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  await prisma.shareableToken.delete({
    where: { id: tokenId },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Shareable Tokens",
    actionType: "DELETE",
    changeDiff: { tokenId },
  });

  revalidatePath(`/dashboard/${weddingId}/share`);
  revalidatePath(`/dashboard/${weddingId}`);
  return { success: true };
}
