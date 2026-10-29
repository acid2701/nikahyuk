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
  return {
    id: c.id,
    wedding_id: c.weddingId,
    event_id: "all",
    category: (c.category as any) || "emergency",
    box_name: null,
    item_name: c.taskTitle,
    price: null,
    purchase_url: null,
    notes: c.notes || null,
    completed_notes: null,
    completed_by: c.assignedTo || null,
    completed_at: null,
    due_date: c.dueDate
      ? c.dueDate instanceof Date
        ? c.dueDate.toISOString().split("T")[0]
        : String(c.dueDate).split("T")[0]
      : null,
    assignee_name: c.assignedTo || null,
    is_completed: c.isCompleted,
    created_at: c.createdAt?.toISOString?.() || c.createdAt,
    updated_at: c.updatedAt?.toISOString?.() || c.updatedAt,
  };
}

export async function fetchChecklistItemsAction(
  weddingId: string,
  eventId: string = "all"
): Promise<DBChecklistItem[]> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return [];

  try {
    const items = await prisma.weddingChecklist.findMany({
      where: { weddingId },
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
        taskTitle: payload.item_name.trim(),
        category: payload.category || "Umum",
        notes: payload.notes?.trim() || null,
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
}: {
  id: string;
  weddingId: string;
  isCompleted: boolean;
  completedNotes?: string;
}) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { success: false, error: "Unauthorized" };

  try {
    const item = await prisma.weddingChecklist.update({
      where: { id },
      data: {
        isCompleted,
        notes: completedNotes ? completedNotes.trim() : undefined,
      },
    });

    revalidatePath(`/dashboard/${weddingId}/checklists`);
    revalidatePath(`/dashboard/${weddingId}`);
    return { success: true, data: toChecklistDTO(item) };
  } catch (error: any) {
    return { success: false, error: error?.message || "Gagal memperbarui status checklist" };
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
