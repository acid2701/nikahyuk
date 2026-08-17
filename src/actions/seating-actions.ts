"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordAuditLog } from "@/lib/audit/logger";

export interface CreateSeatingTableInput {
  weddingId: string;
  eventId: string;
  tableName: string;
  maxSeats: number;
  notes?: string | null;
}

export async function createSeatingTableAction(input: CreateSeatingTableInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: table, error } = await supabase
    .from("event_tables")
    .insert({
      event_id: input.eventId,
      table_number_or_name: input.tableName,
      max_seats: input.maxSeats,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error || !table) {
    throw new Error(error?.message || "Gagal membuat meja katering/tamu.");
  }

  await recordAuditLog({
    weddingId: input.weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Seating Tables",
    actionType: "CREATE",
    changeDiff: { tableName: input.tableName, maxSeats: input.maxSeats },
  });

  revalidatePath(`/dashboard/${input.weddingId}/seating`);
  return table;
}

export async function assignGuestToTableAction(
  assignmentId: string,
  tableId: string | null,
  weddingId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: assignment, error } = await supabase
    .from("event_guest_assignments")
    .update({
      table_id: tableId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assignmentId)
    .select()
    .single();

  if (error || !assignment) {
    throw new Error(error?.message || "Gagal menetapkan posisi meja tamu.");
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Seating Assignment",
    actionType: "UPDATE",
    changeDiff: { assignmentId, tableId },
  });

  revalidatePath(`/dashboard/${weddingId}/seating`);
  return assignment;
}

export async function deleteSeatingTableAction(tableId: string, weddingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await supabase
    .from("event_guest_assignments")
    .update({ table_id: null })
    .eq("table_id", tableId);

  const { error } = await supabase
    .from("event_tables")
    .delete()
    .eq("id", tableId);

  if (error) {
    throw new Error(error.message);
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Seating Tables",
    actionType: "DELETE",
    changeDiff: { tableId },
  });

  revalidatePath(`/dashboard/${weddingId}/seating`);
  return { success: true };
}
