"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/audit/logger";
import { deletePhysicalR2File } from "@/lib/cloudflare-r2/cleanup-helper";

export interface ColorSwatchItem {
  hex: string;
  name: string;
}

export interface SavePaletteInput {
  weddingId: string;
  paletteName?: string;
  colors: ColorSwatchItem[];
}

export interface CreateMoodboardItemInput {
  weddingId: string;
  category: "decor" | "attire" | "makeup" | "photo" | "stationery" | "other";
  title: string;
  notes?: string | null;
  r2FileKey: string;
  fileSizeBytes?: number | null;
  mimeType?: string | null;
  sourceUrl?: string | null;
  vendorName?: string | null;
}

export async function saveColorPaletteAction(input: SavePaletteInput) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.weddingColorPalette.findFirst({
    where: { weddingId: input.weddingId },
  });

  let palette;
  if (existing) {
    palette = await prisma.weddingColorPalette.update({
      where: { id: existing.id },
      data: {
        paletteName: input.paletteName?.trim() || "Tema Utama",
        colors: input.colors as any,
      },
    });
  } else {
    palette = await prisma.weddingColorPalette.create({
      data: {
        weddingId: input.weddingId,
        paletteName: input.paletteName?.trim() || "Tema Utama",
        colors: input.colors as any,
      },
    });
  }

  await recordAuditLog({
    weddingId: input.weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Moodboard Palet Warna",
    actionType: existing ? "UPDATE" : "CREATE",
    changeDiff: { paletteName: palette.paletteName, colors: input.colors },
  });

  revalidatePath(`/dashboard/${input.weddingId}/moodboard`);
  revalidatePath(`/dashboard/${input.weddingId}`);
  return {
    id: palette.id,
    wedding_id: palette.weddingId,
    palette_name: palette.paletteName,
    colors: palette.colors,
  };
}

export async function createMoodboardItemAction(input: CreateMoodboardItemInput) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const item = await prisma.moodboardItem.create({
    data: {
      weddingId: input.weddingId,
      category: input.category || "decor",
      title: input.title.trim(),
      notes: input.notes?.trim() || null,
      r2FileKey: input.r2FileKey,
      fileSizeBytes: input.fileSizeBytes ? BigInt(input.fileSizeBytes) : null,
      mimeType: input.mimeType || "image/webp",
      sourceUrl: input.sourceUrl?.trim() || null,
      vendorName: input.vendorName?.trim() || null,
    },
  });

  await recordAuditLog({
    weddingId: input.weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Moodboard Inspirasi",
    actionType: "CREATE",
    changeDiff: { title: input.title, category: input.category, r2Key: input.r2FileKey },
  });

  revalidatePath(`/dashboard/${input.weddingId}/moodboard`);
  revalidatePath(`/dashboard/${input.weddingId}`);
  return {
    id: item.id,
    wedding_id: item.weddingId,
    category: item.category,
    title: item.title,
    notes: item.notes,
    r2_file_key: item.r2FileKey,
    file_size_bytes: item.fileSizeBytes ? Number(item.fileSizeBytes) : null,
    mime_type: item.mimeType,
    source_url: item.sourceUrl,
    vendor_name: item.vendorName,
    created_at: item.createdAt.toISOString(),
  };
}

export async function deleteMoodboardItemAction(itemId: string, r2FileKey: string, weddingId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  await prisma.moodboardItem.delete({
    where: { id: itemId },
  });

  if (r2FileKey) {
    try {
      await deletePhysicalR2File(r2FileKey);
    } catch (err) {
      console.warn("R2 moodboard file cleanup warning:", err);
    }
  }

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Moodboard Inspirasi",
    actionType: "DELETE",
    changeDiff: { itemId, r2FileKey },
  });

  revalidatePath(`/dashboard/${weddingId}/moodboard`);
  revalidatePath(`/dashboard/${weddingId}`);
  return { success: true };
}
