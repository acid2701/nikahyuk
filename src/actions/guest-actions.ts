"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordAuditLog } from "@/lib/audit/logger";
import { sanitizePhoneNumber } from "@/lib/utils/wa-sanitizer";
import { AttendanceStatusEnum } from "@/types/database.types";

export interface CreateGuestInput {
  weddingId: string;
  fullName: string;
  contactNumber?: string | null;
  defaultPax?: number;
  notes?: string | null;
  eventId?: string | null;
}

export async function createGuestAction(input: CreateGuestInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const sanitized = input.contactNumber
    ? sanitizePhoneNumber(input.contactNumber)
    : null;

  const { data: guest, error } = await supabase
    .from("guests")
    .insert({
      wedding_id: input.weddingId,
      full_name: input.fullName,
      sanitized_phone: sanitized || null,
      default_pax: input.defaultPax || 1,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error || !guest) {
    throw new Error(error?.message || "Gagal membuat data tamu.");
  }

  if (input.eventId) {
    await supabase.from("event_guest_assignments").insert({
      event_id: input.eventId,
      guest_id: guest.id,
      actual_pax: guest.default_pax,
      attendance_status: "pending",
    });
  }

  await recordAuditLog({
    weddingId: input.weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Guests",
    actionType: "CREATE",
    changeDiff: { fullName: input.fullName, defaultPax: input.defaultPax },
  });

  revalidatePath(`/dashboard/${input.weddingId}/guests`);
  return guest;
}

export async function bulkImportGuestsAction(
  weddingId: string,
  eventId: string | null,
  guestsList: { fullName: string; contactNumber?: string; defaultPax?: number; notes?: string }[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const rows = guestsList.map((g) => ({
    wedding_id: weddingId,
    full_name: g.fullName,
    sanitized_phone: g.contactNumber ? sanitizePhoneNumber(g.contactNumber) : null,
    default_pax: g.defaultPax || 1,
    notes: g.notes || null,
  }));

  const { data: createdGuests, error } = await supabase
    .from("guests")
    .insert(rows)
    .select();

  if (error || !createdGuests) {
    throw new Error(error?.message || "Gagal mengimpor daftar tamu.");
  }

  if (eventId && createdGuests.length > 0) {
    const assignments = createdGuests.map((cg) => ({
      event_id: eventId,
      guest_id: cg.id,
      actual_pax: cg.default_pax,
      attendance_status: "pending" as AttendanceStatusEnum,
    }));
    await supabase.from("event_guest_assignments").insert(assignments);
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Guests Bulk Import",
    actionType: "CREATE",
    changeDiff: { importedCount: createdGuests.length },
  });

  revalidatePath(`/dashboard/${weddingId}/guests`);
  return createdGuests;
}

export async function updateGuestRSVPAction(
  assignmentId: string,
  weddingId: string,
  status: AttendanceStatusEnum,
  actualPax: number
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
      attendance_status: status,
      actual_pax: actualPax,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assignmentId)
    .select()
    .single();

  if (error || !assignment) {
    throw new Error(error?.message || "Gagal memperbarui RSVP.");
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Guest RSVP",
    actionType: "UPDATE",
    changeDiff: { assignmentId, status, actualPax },
  });

  revalidatePath(`/dashboard/${weddingId}/guests`);
  return assignment;
}

export async function deleteGuestAction(guestId: string, weddingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("guests")
    .delete()
    .eq("id", guestId);

  if (error) {
    throw new Error(error.message);
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Guests",
    actionType: "DELETE",
    changeDiff: { guestId },
  });

  revalidatePath(`/dashboard/${weddingId}/guests`);
  return { success: true };
}
