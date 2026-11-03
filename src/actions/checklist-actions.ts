"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export interface DBChecklistItem {
  id: string;
  wedding_id: string;
  event_id: string;
  category: "kua" | "seserahan" | "lamaran" | "emergency";
  box_name?: string | null;
  item_name: string;
  price?: number | null;
  purchase_url?: string | null;
  notes?: string | null;
  completed_notes?: string | null;
  completed_by?: string | null;
  completed_at?: string | null;
  due_date?: string | null;
  assignee_name?: string | null;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

function toChecklistDTO(c: any): DBChecklistItem {
  const formattedDueDate = c.dueDate
    ? c.dueDate instanceof Date
      ? c.dueDate.toISOString().split("T")[0]
      : String(c.dueDate).split("T")[0]
    : null;

  const formattedCompletedAt = c.completedAt
    ? c.completedAt instanceof Date
      ? c.completedAt.toISOString()
      : String(c.completedAt)
    : null;

  return {
    id: c.id,
    wedding_id: c.weddingId,
    event_id: c.eventId || "all",
    category: (c.category as any) || "emergency",
    box_name: c.boxName || null,
    item_name: c.taskTitle,
    price: c.price ? Number(c.price) : null,
    purchase_url: c.purchaseUrl || null,
    notes: c.notes || null,
    completed_notes: null,
    completed_by: c.completedBy || null,
    completed_at: formattedCompletedAt,
    due_date: formattedDueDate,
    assignee_name: c.assignedTo || null,
    is_completed: c.isCompleted,
    created_at: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt || ""),
    updated_at: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : String(c.updatedAt || ""),
  };
}

export async function fetchChecklistItemsAction(
  weddingId: string,
  eventId: string = "all"
): Promise<DBChecklistItem[]> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return [];

  try {
    const whereClause: any = { weddingId };
    if (eventId && eventId !== "all") {
      whereClause.OR = [{ eventId }, { eventId: null }];
    }

    const items = await prisma.weddingChecklist.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
    });

    return items.map(toChecklistDTO);
  } catch (error) {
    return [];
  }
}

export async function addChecklistItemAction(payload: {
  wedding_id: string;
  event_id: string;
  category: "kua" | "seserahan" | "lamaran" | "emergency";
  box_name?: string;
  item_name: string;
  price?: number;
  purchase_url?: string;
  notes?: string;
  due_date?: string;
  assignee_name?: string;
}) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { success: false, error: "Unauthorized" };

  try {
    const item = await prisma.weddingChecklist.create({
      data: {
        weddingId: payload.wedding_id,
        eventId: payload.event_id && payload.event_id !== "all" ? payload.event_id : null,
        taskTitle: payload.item_name.trim(),
        category: payload.category || "Umum",
        notes: payload.notes?.trim() || null,
        price: payload.price ? Number(payload.price) : null,
        purchaseUrl: payload.purchase_url?.trim() || null,
        boxName: payload.box_name?.trim() || null,
        dueDate: payload.due_date ? new Date(payload.due_date) : null,
        assignedTo: payload.assignee_name?.trim() || null,
        isCompleted: false,
      },
    });

    revalidatePath(`/dashboard/${payload.wedding_id}/checklists`);
    revalidatePath(`/dashboard/${payload.wedding_id}`);
    return { success: true, data: toChecklistDTO(item) };
  } catch (error: any) {
    return { success: false, error: error?.message || "Gagal membuat item checklist" };
  }
}

export async function toggleChecklistItemAction({
  id,
  weddingId,
  isCompleted,
  completedNotes,
  defaultPayload,
}: {
  id: string;
  weddingId: string;
  isCompleted: boolean;
  completedNotes?: string;
  defaultPayload?: {
    taskTitle: string;
    category: string;
    notes?: string;
    dueDate?: string;
    assignedTo?: string;
  };
}) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { success: false, error: "Unauthorized" };

  try {
    const completedBy = isCompleted ? (sessionUser.fullName || sessionUser.email || "Pengguna") : null;
    const completedAt = isCompleted ? new Date() : null;

    const existing = await prisma.weddingChecklist.findUnique({
      where: { id },
    });

    let item;
    if (existing) {
      item = await prisma.weddingChecklist.update({
        where: { id },
        data: {
          isCompleted,
          completedBy,
          completedAt,
          notes: completedNotes ? completedNotes.trim() : undefined,
        },
      });
    } else if (defaultPayload) {
      item = await prisma.weddingChecklist.create({
        data: {
          weddingId,
          taskTitle: defaultPayload.taskTitle,
          category: defaultPayload.category || "Umum",
          notes: completedNotes ? completedNotes.trim() : defaultPayload.notes || null,
          dueDate: defaultPayload.dueDate ? new Date(defaultPayload.dueDate) : null,
          assignedTo: defaultPayload.assignedTo || null,
          isCompleted,
          completedBy,
          completedAt,
        },
      });
    } else {
      return { success: false, error: "Item tidak ditemukan." };
    }

    revalidatePath(`/dashboard/${weddingId}/checklists`);
    revalidatePath(`/dashboard/${weddingId}`);
    return { success: true, data: toChecklistDTO(item) };
  } catch (error: any) {
    return { success: false, error: error?.message || "Gagal memperbarui status checklist" };
  }
}

export async function updateChecklistItemAction(payload: {
  id: string;
  weddingId: string;
  itemName: string;
  category?: string;
  notes?: string | null;
  assigneeName?: string | null;
  dueDate?: string | null;
  price?: number | null;
  purchaseUrl?: string | null;
}) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { success: false, error: "Unauthorized" };

  try {
    const existing = await prisma.weddingChecklist.findUnique({
      where: { id: payload.id },
    });

    let item;
    if (existing) {
      item = await prisma.weddingChecklist.update({
        where: { id: payload.id },
        data: {
          taskTitle: payload.itemName.trim(),
          category: payload.category || existing.category,
          notes: payload.notes?.trim() || null,
          assignedTo: payload.assigneeName?.trim() || null,
          dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
          price: payload.price !== undefined ? payload.price : undefined,
          purchaseUrl: payload.purchaseUrl?.trim() || null,
        },
      });
    } else {
      // Auto-upsert jika record berasal dari default template lokal yang belum masuk DB
      item = await prisma.weddingChecklist.create({
        data: {
          weddingId: payload.weddingId,
          taskTitle: payload.itemName.trim(),
          category: payload.category || "Umum",
          notes: payload.notes?.trim() || null,
          assignedTo: payload.assigneeName?.trim() || null,
          dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
          price: payload.price ? Number(payload.price) : null,
          purchaseUrl: payload.purchaseUrl?.trim() || null,
          isCompleted: false,
        },
      });
    }

    revalidatePath(`/dashboard/${payload.weddingId}/checklists`);
    revalidatePath(`/dashboard/${payload.weddingId}`);
    return { success: true, data: toChecklistDTO(item) };
  } catch (error: any) {
    return { success: false, error: error?.message || "Gagal memperbarui item checklist" };
  }
}

export async function updateChecklistNotesAction({
  id,
  weddingId,
  notes,
  completedNotes,
  dueDate,
  assigneeName,
}: {
  id: string;
  weddingId: string;
  notes?: string;
  completedNotes?: string;
  dueDate?: string;
  assigneeName?: string;
}) {
  try {
    const item = await prisma.weddingChecklist.update({
      where: { id },
      data: {
        notes: (notes || completedNotes)?.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedTo: assigneeName?.trim() || null,
      },
    });

    revalidatePath(`/dashboard/${weddingId}/checklists`);
    revalidatePath(`/dashboard/${weddingId}`);
    return { success: true, data: toChecklistDTO(item) };
  } catch (error: any) {
    return { success: false, error: error?.message || "Gagal memperbarui catatan checklist" };
  }
}

export async function deleteChecklistItemAction(
  id: string,
  weddingId: string
) {
  try {
    await prisma.weddingChecklist.delete({
      where: { id },
    });

    revalidatePath(`/dashboard/${weddingId}/checklists`);
    revalidatePath(`/dashboard/${weddingId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Gagal menghapus checklist" };
  }
}
