"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export interface CouplePresenceItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  currentPath: string;
  isOnline: boolean;
  lastActive: Date;
}

export async function heartbeatCouplePresenceAction(
  weddingId: string,
  currentPath: string
): Promise<{ success: boolean; activeUsers: CouplePresenceItem[] }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, activeUsers: [] };
    }

    const wedding = await prisma.wedding.findUnique({
      where: { id: weddingId },
      select: { createdBy: true, groomName: true, brideName: true },
    });

    if (!wedding) {
      return { success: false, activeUsers: [] };
    }

    // Tentukan role default pasangan
    const isOwner = wedding.createdBy === user.userId;
    const userRole = isOwner ? "groom" : "bride";
    const userName = user.fullName || (isOwner ? wedding.groomName : wedding.brideName) || "Pasangan";

    const now = new Date();

    // Upsert kehadiran saat ini
    await prisma.couplePresence.upsert({
      where: {
        weddingId_userId: {
          weddingId,
          userId: user.userId,
        },
      },
      create: {
        weddingId,
        userId: user.userId,
        userName,
        userRole,
        currentPath,
        lastActive: now,
      },
      update: {
        userName,
        userRole,
        currentPath,
        lastActive: now,
      },
    });

    // Ambil semua pengguna aktif dalam 2 menit terakhir
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const presences = await prisma.couplePresence.findMany({
      where: {
        weddingId,
        lastActive: { gte: twoMinutesAgo },
      },
      orderBy: { lastActive: "desc" },
    });

    // Ambang batas online aktif: 45 detik
    const activeThreshold = 45 * 1000;
    const activeUsers: CouplePresenceItem[] = presences.map((p: any) => ({
      id: p.id,
      userId: p.userId,
      userName: p.userName,
      userRole: p.userRole,
      currentPath: p.currentPath,
      isOnline: Date.now() - new Date(p.lastActive).getTime() < activeThreshold,
      lastActive: p.lastActive,
    }));

    return { success: true, activeUsers };
  } catch (err) {
    console.error("heartbeatCouplePresenceAction error:", err);
    return { success: false, activeUsers: [] };
  }
}

export async function getCoupleNotesAction(weddingId: string) {
  try {
    const notes = await prisma.coupleNote.findMany({
      where: { weddingId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return { success: true, notes };
  } catch (err) {
    console.error("getCoupleNotesAction error:", err);
    return { success: false, notes: [] };
  }
}

export async function createCoupleNoteAction(params: {
  weddingId: string;
  authorRole: "groom" | "bride" | "partner";
  authorName: string;
  content: string;
  tag: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Akses tidak sah.");

    if (!params.content.trim()) {
      throw new Error("Isi catatan tidak boleh kosong.");
    }

    const note = await prisma.coupleNote.create({
      data: {
        weddingId: params.weddingId,
        authorRole: params.authorRole,
        authorName: params.authorName,
        content: params.content.trim(),
        tag: params.tag || "Catatan",
      },
    });

    revalidatePath(`/dashboard/${params.weddingId}`);
    return { success: true, note };
  } catch (err) {
    console.error("createCoupleNoteAction error:", err);
    throw err;
  }
}

export async function toggleCoupleNoteAction(params: {
  weddingId: string;
  noteId: string;
  isDone: boolean;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Akses tidak sah.");

    const updated = await prisma.coupleNote.update({
      where: { id: params.noteId },
      data: { isDone: params.isDone },
    });

    revalidatePath(`/dashboard/${params.weddingId}`);
    return { success: true, note: updated };
  } catch (err) {
    console.error("toggleCoupleNoteAction error:", err);
    throw err;
  }
}

export async function deleteCoupleNoteAction(params: {
  weddingId: string;
  noteId: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Akses tidak sah.");

    await prisma.coupleNote.delete({
      where: { id: params.noteId },
    });

    revalidatePath(`/dashboard/${params.weddingId}`);
    return { success: true };
  } catch (err) {
    console.error("deleteCoupleNoteAction error:", err);
    throw err;
  }
}
