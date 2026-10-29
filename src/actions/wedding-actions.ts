"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/audit/logger";
import { UserRoleEnum, CustomPermissions } from "@/types/database.types";

function toWeddingDTO(w: any) {
  if (!w) return null;
  return {
    id: w.id,
    created_by: w.createdBy,
    groom_name: w.groomName,
    bride_name: w.brideName,
    wedding_slug: w.weddingSlug,
    groom_father_name: w.groomFatherName || null,
    groom_mother_name: w.groomMotherName || null,
    bride_father_name: w.brideFatherName || null,
    bride_mother_name: w.brideMotherName || null,
    created_at: w.createdAt?.toISOString?.() || w.createdAt,
    updated_at: w.updatedAt?.toISOString?.() || w.updatedAt,
    createdBy: w.createdBy,
    groomName: w.groomName,
    brideName: w.brideName,
    weddingSlug: w.weddingSlug,
    groomFatherName: w.groomFatherName || null,
    groomMotherName: w.groomMotherName || null,
    brideFatherName: w.brideFatherName || null,
    brideMotherName: w.brideMotherName || null,
  };
}

export async function createWeddingAction(formData: FormData) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const groomName = formData.get("groom_name") as string;
  const brideName = formData.get("bride_name") as string;

  if (!groomName || !brideName) {
    throw new Error("Nama pengantin pria dan wanita wajib diisi.");
  }

  const slug = `${groomName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${brideName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

  const wedding = await prisma.wedding.create({
    data: {
      createdBy: sessionUser.userId,
      groomName: groomName.trim(),
      brideName: brideName.trim(),
      weddingSlug: slug,
    },
  });

  const today = new Date();
  await prisma.weddingEvent.createMany({
    data: [
      {
        weddingId: wedding.id,
        eventName: "Akad Nikah",
        eventDate: today,
        eventSide: "joint",
      },
      {
        weddingId: wedding.id,
        eventName: "Resepsi",
        eventDate: today,
        eventSide: "joint",
      },
    ],
  });

  await recordAuditLog({
    weddingId: wedding.id,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Workspace",
    actionType: "CREATE",
    changeDiff: { groom_name: groomName, bride_name: brideName, slug },
  });

  revalidatePath("/dashboard");
  return toWeddingDTO(wedding);
}

export async function inviteCollaboratorAction(
  weddingId: string,
  email: string,
  role: UserRoleEnum,
  permissions?: CustomPermissions
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const defaultPerms: CustomPermissions = permissions || {
    budget: false,
    vendor: role === "wo",
    rundown: true,
    guest: true,
    gift_log: false,
  };

  let isRegistered = false;
  let targetUserId = sessionUser.userId;

  const targetUser = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (targetUser) {
    targetUserId = targetUser.id;
    isRegistered = true;
  }

  const finalPerms = {
    ...defaultPerms,
    invited_email: email.trim(),
    is_active: isRegistered,
  };

  // Check if collaborator already exists for this wedding
  const existingCollab = await prisma.weddingCollaborator.findFirst({
    where: {
      weddingId,
      userId: targetUserId,
    },
  });

  let collaborator;
  if (existingCollab) {
    collaborator = await prisma.weddingCollaborator.update({
      where: { id: existingCollab.id },
      data: {
        role,
        customPermissions: finalPerms as any,
      },
    });
  } else {
    collaborator = await prisma.weddingCollaborator.create({
      data: {
        weddingId,
        userId: targetUserId,
        role,
        customPermissions: finalPerms as any,
      },
    });
  }

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Owner",
    moduleName: "Collaborators",
    actionType: existingCollab ? "UPDATE" : "CREATE",
    changeDiff: { email, role, permissions: defaultPerms },
  });

  revalidatePath(`/dashboard/${weddingId}/settings/collaborators`);
  revalidatePath(`/dashboard/${weddingId}`);
  return {
    id: collaborator.id,
    wedding_id: collaborator.weddingId,
    user_id: collaborator.userId,
    role: collaborator.role,
    custom_permissions: collaborator.customPermissions,
    created_at: collaborator.createdAt.toISOString(),
  };
}

export async function updateCollaboratorPermissionsAction(
  collaboratorId: string,
  weddingId: string,
  permissions: CustomPermissions
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const updated = await prisma.weddingCollaborator.update({
    where: { id: collaboratorId },
    data: {
      customPermissions: permissions as any,
    },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Owner",
    moduleName: "Collaborators",
    actionType: "UPDATE",
    changeDiff: { collaboratorId, permissions },
  });

  revalidatePath(`/dashboard/${weddingId}/settings/collaborators`);
  revalidatePath(`/dashboard/${weddingId}`);
  return {
    id: updated.id,
    wedding_id: updated.weddingId,
    user_id: updated.userId,
    role: updated.role,
    custom_permissions: updated.customPermissions,
  };
}

export async function removeCollaboratorAction(
  collaboratorId: string,
  weddingId: string
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  await prisma.weddingCollaborator.deleteMany({
    where: {
      id: collaboratorId,
      weddingId,
    },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Owner",
    moduleName: "Collaborators",
    actionType: "DELETE",
    changeDiff: { collaboratorId },
  });

  revalidatePath(`/dashboard/${weddingId}/settings/collaborators`);
  revalidatePath(`/dashboard/${weddingId}`);
  return { success: true };
}

export async function updateWeddingProfileAction(
  weddingId: string,
  updates: {
    groomName?: string;
    brideName?: string;
    weddingSlug?: string;
    groomFatherName?: string | null;
    groomMotherName?: string | null;
    brideFatherName?: string | null;
    brideMotherName?: string | null;
  }
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const dataToUpdate: any = {};
  if (updates.groomName !== undefined) dataToUpdate.groomName = updates.groomName.trim();
  if (updates.brideName !== undefined) dataToUpdate.brideName = updates.brideName.trim();
  if (updates.groomFatherName !== undefined) dataToUpdate.groomFatherName = updates.groomFatherName?.trim() || null;
  if (updates.groomMotherName !== undefined) dataToUpdate.groomMotherName = updates.groomMotherName?.trim() || null;
  if (updates.brideFatherName !== undefined) dataToUpdate.brideFatherName = updates.brideFatherName?.trim() || null;
  if (updates.brideMotherName !== undefined) dataToUpdate.brideMotherName = updates.brideMotherName?.trim() || null;

  if (updates.weddingSlug !== undefined) {
    const slugCleaned = updates.weddingSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (slugCleaned.length < 3) {
      throw new Error("Slug harus minimal 3 karakter alfanumerik.");
    }

    const existingSlug = await prisma.wedding.findFirst({
      where: {
        weddingSlug: slugCleaned,
        NOT: { id: weddingId },
      },
    });

    if (existingSlug) {
      throw new Error(`Slug '${slugCleaned}' sudah digunakan workspace lain. Silakan pilih slug unik.`);
    }

    dataToUpdate.weddingSlug = slugCleaned;
  }

  if (Object.keys(dataToUpdate).length === 0) {
    throw new Error("Tidak ada perubahan yang dikirim.");
  }

  const updated = await prisma.wedding.update({
    where: { id: weddingId },
    data: dataToUpdate,
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Owner",
    moduleName: "Wedding Profile",
    actionType: "UPDATE",
    changeDiff: updates,
  });

  revalidatePath(`/dashboard/${weddingId}/settings/profile`);
  revalidatePath(`/dashboard/${weddingId}`);
  return toWeddingDTO(updated);
}
