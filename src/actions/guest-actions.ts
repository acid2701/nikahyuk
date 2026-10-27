"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
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

function toGuestDTO(g: any) {
  if (!g) return null;
  return {
    id: g.id,
    wedding_id: g.weddingId,
    category_id: g.categoryId || null,
    full_name: g.fullName,
    sanitized_phone: g.sanitizedPhone || null,
    default_pax: g.defaultPax,
    notes: g.notes || null,
    created_at: g.createdAt?.toISOString?.() || g.createdAt,
    updated_at: g.updatedAt?.toISOString?.() || g.updatedAt,
    weddingId: g.weddingId,
    categoryId: g.categoryId || null,
    fullName: g.fullName,
    sanitizedPhone: g.sanitizedPhone || null,
    defaultPax: g.defaultPax,
  };
}

function toAssignmentDTO(a: any) {
  if (!a) return null;
  return {
    id: a.id,
    event_id: a.eventId,
    guest_id: a.guestId,
    table_id: a.tableId || null,
    actual_pax: a.actualPax,
    attendance_status: a.attendanceStatus,
    souvenir_received: a.souvenirReceived || false,
    is_walk_in: a.isWalkIn || false,
    checkin_timestamp: a.checkinTimestamp?.toISOString?.() || a.checkinTimestamp || null,
    created_at: a.createdAt?.toISOString?.() || a.createdAt,
    updated_at: a.updatedAt?.toISOString?.() || a.updatedAt,
    eventId: a.eventId,
    guestId: a.guestId,
    tableId: a.tableId || null,
    actualPax: a.actualPax,
    attendanceStatus: a.attendanceStatus,
    souvenirReceived: a.souvenirReceived || false,
    isWalkIn: a.isWalkIn || false,
  };
}

export async function createGuestAction(input: CreateGuestInput) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const sanitized = input.contactNumber
    ? sanitizePhoneNumber(input.contactNumber)
    : null;

  const guest = await prisma.guest.create({
    data: {
      weddingId: input.weddingId,
      fullName: input.fullName.trim(),
      sanitizedPhone: sanitized || null,
      defaultPax: input.defaultPax || 1,
      notes: input.notes || null,
    },
  });

  if (input.eventId) {
    await prisma.eventGuestAssignment.create({
      data: {
        eventId: input.eventId,
        guestId: guest.id,
        actualPax: guest.defaultPax,
        attendanceStatus: "pending",
      },
    });
  }

  await recordAuditLog({
    weddingId: input.weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Guests",
    actionType: "CREATE",
    changeDiff: { fullName: input.fullName, defaultPax: input.defaultPax },
  });

  revalidatePath(`/dashboard/${input.weddingId}/guests`);
  return toGuestDTO(guest);
}

export async function updateGuestAction(
  guestId: string,
  weddingId: string,
  updates: {
    fullName?: string;
    contactNumber?: string | null;
    defaultPax?: number;
    notes?: string | null;
  }
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const sanitized = updates.contactNumber
    ? sanitizePhoneNumber(updates.contactNumber)
    : updates.contactNumber === ""
    ? null
    : undefined;

  const dataToUpdate: any = {};
  if (updates.fullName !== undefined) dataToUpdate.fullName = updates.fullName.trim();
  if (sanitized !== undefined) dataToUpdate.sanitizedPhone = sanitized;
  if (updates.defaultPax !== undefined) dataToUpdate.defaultPax = updates.defaultPax || 1;
  if (updates.notes !== undefined) dataToUpdate.notes = updates.notes || null;

  const guest = await prisma.guest.update({
    where: { id: guestId },
    data: dataToUpdate,
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Guests",
    actionType: "UPDATE",
    changeDiff: { guestId, updates },
  });

  revalidatePath(`/dashboard/${weddingId}/guests`);
  return toGuestDTO(guest);
}

export async function bulkImportGuestsAction(
  weddingId: string,
  eventId: string | null,
  guestsList: { fullName: string; contactNumber?: string; defaultPax?: number; notes?: string }[]
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const createdGuests = await prisma.$transaction(
    guestsList.map((g) =>
      prisma.guest.create({
        data: {
          weddingId,
          fullName: g.fullName.trim(),
          sanitizedPhone: g.contactNumber ? sanitizePhoneNumber(g.contactNumber) : null,
          defaultPax: g.defaultPax || 1,
          notes: g.notes || null,
        },
      })
    )
  );

  if (eventId && createdGuests.length > 0) {
    await prisma.eventGuestAssignment.createMany({
      data: createdGuests.map((cg) => ({
        eventId,
        guestId: cg.id,
        actualPax: cg.defaultPax,
        attendanceStatus: "pending",
      })),
    });
  }

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Guests Bulk Import",
    actionType: "CREATE",
    changeDiff: { importedCount: createdGuests.length },
  });

  revalidatePath(`/dashboard/${weddingId}/guests`);
  return createdGuests.map(toGuestDTO);
}

export async function updateGuestRSVPAction(
  assignmentId: string,
  weddingId: string,
  status: AttendanceStatusEnum,
  actualPax: number
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const assignment = await prisma.eventGuestAssignment.update({
    where: { id: assignmentId },
    data: {
      attendanceStatus: status,
      actualPax,
    },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Guest RSVP",
    actionType: "UPDATE",
    changeDiff: { assignmentId, status, actualPax },
  });

  revalidatePath(`/dashboard/${weddingId}/guests`);
  return toAssignmentDTO(assignment);
}

export async function deleteGuestAction(guestId: string, weddingId: string) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  await prisma.guest.delete({
    where: { id: guestId },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Guests",
    actionType: "DELETE",
    changeDiff: { guestId },
  });

  revalidatePath(`/dashboard/${weddingId}/guests`);
  return { success: true };
}
