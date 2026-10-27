"use server";

import { createClient } from "@/lib/db/server";
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

export async function fetchChecklistItemsAction(
  weddingId: string,
  eventId: string = "all"
): Promise<DBChecklistItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("wedding_checklists")
    .select("*")
    .eq("wedding_id", weddingId)
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as DBChecklistItem[];
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("wedding_checklists")
    .insert({
      wedding_id: payload.wedding_id,
      event_id: payload.event_id || "all",
      category: payload.category,
      box_name: payload.box_name || null,
      item_name: payload.item_name,
      price: payload.price || null,
      purchase_url: payload.purchase_url || null,
      notes: payload.notes || null,
      due_date: payload.due_date || null,
      assignee_name: payload.assignee_name || null,
      is_completed: false,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath(`/dashboard/${payload.wedding_id}/checklists`);
  return { success: true, data };
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const userName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "Pengguna";

  const { data, error } = await supabase
    .from("wedding_checklists")
    .update({
      is_completed: isCompleted,
      completed_notes: isCompleted ? completedNotes || null : null,
      completed_by: isCompleted ? userName : null,
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("wedding_id", weddingId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath(`/dashboard/${weddingId}/checklists`);
  return { success: true, data };
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
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("wedding_checklists")
    .update({
      notes: notes || null,
      completed_notes: completedNotes || null,
      due_date: dueDate || null,
      assignee_name: assigneeName || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("wedding_id", weddingId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath(`/dashboard/${weddingId}/checklists`);
  return { success: true, data };
}

export async function deleteChecklistItemAction(
  id: string,
  weddingId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("wedding_checklists")
    .delete()
    .eq("id", id)
    .eq("wedding_id", weddingId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/dashboard/${weddingId}/checklists`);
  return { success: true };
}
