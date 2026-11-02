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
      lastActive: p.lastActive instanceof Date ? p.lastActive.toISOString() : String(p.lastActive),
    })) as any;

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
    return {
      success: true,
      notes: notes.map((n) => ({
        id: n.id,
        authorRole: n.authorRole,
        authorName: n.authorName,
        content: n.content,
        tag: n.tag,
        isDone: n.isDone,
        createdAt: n.createdAt.toISOString(),
      })),
    };
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
    return {
      success: true,
      note: {
        id: note.id,
        authorRole: note.authorRole,
        authorName: note.authorName,
        content: note.content,
        tag: note.tag,
        isDone: note.isDone,
        createdAt: note.createdAt.toISOString(),
      },
    };
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
    return {
      success: true,
      note: {
        id: updated.id,
        authorRole: updated.authorRole,
        authorName: updated.authorName,
        content: updated.content,
        tag: updated.tag,
        isDone: updated.isDone,
        createdAt: updated.createdAt.toISOString(),
      },
    };
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

// -------------------------------------------------------------
// KODE PENYANDING PASANGAN (PAIRING CODE / HYBRID INVITE)
// -------------------------------------------------------------
function generatePairCode(): string {
  // Format bersih: NIKAH-XXXX (4 karakter alfanumerik kapital tanpa huruf membingungkan 0/O/1/I)
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NIKAH-${suffix}`;
}

export async function getOrGeneratePairCodeAction(weddingId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Akses tidak sah.");

    const wedding = await prisma.wedding.findUnique({
      where: { id: weddingId },
      select: { id: true, createdBy: true, pairCode: true, groomName: true, brideName: true },
    });

    if (!wedding) throw new Error("Workspace tidak ditemukan.");

    // Cek apakah sudah ada collaborator bertipe partner
    const existingPartner = await prisma.weddingCollaborator.findFirst({
      where: {
        weddingId,
        role: "partner",
      },
      include: {
        user: {
          select: { email: true, fullName: true },
        },
      },
    });

    if (wedding.pairCode) {
      return {
        success: true,
        pairCode: wedding.pairCode,
        isPaired: Boolean(existingPartner),
        partner: existingPartner?.user || null,
      };
    }

    // Generate kode baru yang unik
    let newCode = generatePairCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await prisma.wedding.findUnique({
        where: { pairCode: newCode },
      });
      if (!existing) isUnique = true;
      else newCode = generatePairCode();
    }

    await prisma.wedding.update({
      where: { id: weddingId },
      data: { pairCode: newCode },
    });

    revalidatePath(`/dashboard/${weddingId}`);
    return {
      success: true,
      pairCode: newCode,
      isPaired: Boolean(existingPartner),
      partner: existingPartner?.user || null,
    };
  } catch (err) {
    console.error("getOrGeneratePairCodeAction error:", err);
    throw err;
  }
}

export async function connectViaPairCodeAction(rawCode: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Silakan masuk/login terlebih dahulu untuk menyandingkan workspace.");

    const cleanCode = rawCode.trim().toUpperCase();
    if (!cleanCode) throw new Error("Kode penyanding tidak boleh kosong.");

    const wedding = await prisma.wedding.findUnique({
      where: { pairCode: cleanCode },
      include: {
        user: { select: { email: true, fullName: true } },
      },
    });

    if (!wedding) {
      throw new Error("Kode penyanding tidak valid atau tidak ditemukan.");
    }

    if (wedding.createdBy === user.userId) {
      throw new Error("Anda adalah pemilik utama workspace ini.");
    }

    // Periksa apakah user sudah terhubung
    const existingCollab = await prisma.weddingCollaborator.findUnique({
      where: {
        weddingId_userId: {
          weddingId: wedding.id,
          userId: user.userId,
        },
      },
    });

    if (existingCollab) {
      // Pastikan role-nya partner
      if (existingCollab.role !== "partner") {
        await prisma.weddingCollaborator.update({
          where: { id: existingCollab.id },
          data: { role: "partner" },
        });
      }
    } else {
      // Hubungkan sebagai Partner resmi (Akses penuh setara Owner)
      const fullPartnerPerms = {
        can_edit_rundown: true,
        can_manage_guests: true,
        can_view_budget: true,
        can_edit_budget: true,
        can_view_gifts: true,
        is_active: true,
        invited_email: user.email,
        connected_via: "PAIR_CODE",
      };

      await prisma.weddingCollaborator.create({
        data: {
          weddingId: wedding.id,
          userId: user.userId,
          role: "partner",
          customPermissions: fullPartnerPerms,
        },
      });
    }

    revalidatePath(`/dashboard`);
    revalidatePath(`/dashboard/${wedding.id}`);

    return {
      success: true,
      weddingId: wedding.id,
      groomName: wedding.groomName,
      brideName: wedding.brideName,
    };
  } catch (err) {
    console.error("connectViaPairCodeAction error:", err);
    throw err;
  }
}

