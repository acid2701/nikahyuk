"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/audit/logger";

export interface CreateSeatingTableInput {
  weddingId: string;
  eventId: string;
  tableName: string;
  maxSeats: number;
  notes?: string | null;
}

function toTableDTO(t: any) {
  if (!t) return null;
  return {
    id: t.id,
    event_id: t.eventId,
    table_number_or_name: t.tableNumberOrName,
    max_seats: t.maxSeats,
    notes: t.notes || null,
    created_at: t.createdAt?.toISOString?.() || t.createdAt,
    eventId: t.eventId,
    tableNumberOrName: t.tableNumberOrName,
    maxSeats: t.maxSeats,
  };
}

export async function createSeatingTableAction(input: CreateSeatingTableInput) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const table = await prisma.eventTable.create({
    data: {
      eventId: input.eventId,
      tableNumberOrName: input.tableName.trim(),
      maxSeats: input.maxSeats || 10,
      notes: input.notes?.trim() || null,
    },
  });

  await recordAuditLog({
    weddingId: input.weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Seating Tables",
    actionType: "CREATE",
    changeDiff: { tableName: input.tableName, maxSeats: input.maxSeats },
  });

  revalidatePath(`/dashboard/${input.weddingId}/seating`);
  revalidatePath(`/dashboard/${input.weddingId}/guests`);
  return toTableDTO(table);
}

export async function updateSeatingTableAction(
  tableId: string,
  weddingId: string,
  updates: {
    tableName?: string;
    maxSeats?: number;
    notes?: string | null;
  }
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const dataToUpdate: any = {};
  if (updates.tableName !== undefined) dataToUpdate.tableNumberOrName = updates.tableName.trim();
  if (updates.maxSeats !== undefined) dataToUpdate.maxSeats = updates.maxSeats;
  if (updates.notes !== undefined) dataToUpdate.notes = updates.notes?.trim() || null;

  const table = await prisma.eventTable.update({
    where: { id: tableId },
    data: dataToUpdate,
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Seating Tables",
    actionType: "UPDATE",
    changeDiff: { tableId, updates },
  });

  revalidatePath(`/dashboard/${weddingId}/seating`);
  revalidatePath(`/dashboard/${weddingId}/guests`);
  return toTableDTO(table);
}

export async function assignGuestToTableAction(
  assignmentId: string,
  tableId: string | null,
  weddingId: string
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const assignment = await prisma.eventGuestAssignment.update({
    where: { id: assignmentId },
    data: {
      tableId,
    },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Seating Assignment",
    actionType: "UPDATE",
    changeDiff: { assignmentId, tableId },
  });

  revalidatePath(`/dashboard/${weddingId}/seating`);
  revalidatePath(`/dashboard/${weddingId}/guests`);
  return {
    id: assignment.id,
    event_id: assignment.eventId,
    guest_id: assignment.guestId,
    table_id: assignment.tableId,
    actual_pax: assignment.actualPax,
    attendance_status: assignment.attendanceStatus,
  };
}

export async function deleteSeatingTableAction(tableId: string, weddingId: string) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  await prisma.eventGuestAssignment.updateMany({
    where: { tableId },
    data: { tableId: null },
  });

  await prisma.eventTable.delete({
    where: { id: tableId },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Seating Tables",
    actionType: "DELETE",
    changeDiff: { tableId },
  });

  revalidatePath(`/dashboard/${weddingId}/seating`);
  revalidatePath(`/dashboard/${weddingId}/guests`);
  return { success: true };
}
