"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/server";
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

export async function createShareTokenAction(input: CreateShareTokenInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const plainToken = "vt_" + crypto.randomBytes(12).toString("hex");
  const pinHash = input.pin ? await bcrypt.hash(input.pin, 10) : null;

  const expiresDays = input.expiresDays || 30;
  const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString();

  const moduleAccess = input.moduleAccess || {
    canCheckin: true,
    canViewRundown: true,
    canViewGuests: true,
  };

  const { data: tokenRecord, error } = await supabase
    .from("shareable_tokens")
    .insert({
      wedding_id: input.weddingId,
      token_hash: plainToken,
      pin_hash: pinHash,
      module_access: moduleAccess as any,
      hide_internal_notes: input.hideInternalNotes ?? true,
      expires_at: expiresAt,
      is_active: true,
    })
    .select()
    .single();

  if (error || !tokenRecord) {
    throw new Error(error?.message || "Gagal membuat token akses publik.");
  }

  await recordAuditLog({
    weddingId: input.weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Shareable Tokens",
    actionType: "CREATE",
    changeDiff: { tokenHash: plainToken, expiresAt },
  });

  revalidatePath(`/dashboard/${input.weddingId}/share`);
  return { tokenRecord, plainToken };
}

export async function toggleShareTokenActiveAction(
  tokenId: string,
  weddingId: string,
  isActive: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: tokenRecord, error } = await supabase
    .from("shareable_tokens")
    .update({ is_active: isActive })
    .eq("id", tokenId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Shareable Tokens",
    actionType: "UPDATE",
    changeDiff: { tokenId, isActive },
  });

  revalidatePath(`/dashboard/${weddingId}/share`);
  return tokenRecord;
}

export async function resetShareTokenPINAction(
  tokenId: string,
  weddingId: string,
  newPin: string | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const pinHash = newPin ? await bcrypt.hash(newPin, 10) : null;

  const { data: tokenRecord, error } = await supabase
    .from("shareable_tokens")
    .update({ pin_hash: pinHash })
    .eq("id", tokenId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Shareable Tokens",
    actionType: "UPDATE",
    changeDiff: { tokenId, hasPin: Boolean(newPin) },
  });

  revalidatePath(`/dashboard/${weddingId}/share`);
  return tokenRecord;
}

export async function deleteShareTokenAction(tokenId: string, weddingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("shareable_tokens")
    .delete()
    .eq("id", tokenId);

  if (error) {
    throw new Error(error.message);
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Shareable Tokens",
    actionType: "DELETE",
    changeDiff: { tokenId },
  });

  revalidatePath(`/dashboard/${weddingId}/share`);
  return { success: true };
}
