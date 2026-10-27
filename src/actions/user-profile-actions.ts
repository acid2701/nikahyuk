"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/audit/logger";
import bcrypt from "bcryptjs";

export async function updateUserProfileDetailAction(input: {
  fullName: string;
  phone?: string;
}) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const updatedUser = await prisma.user.update({
    where: { id: sessionUser.userId },
    data: {
      fullName: input.fullName.trim(),
      phone: input.phone?.trim() || null,
    },
  });

  await recordAuditLog({
    weddingId: "GLOBAL_SYSTEM",
    userId: sessionUser.userId,
    userDisplayName: input.fullName || sessionUser.email || "User",
    moduleName: "User Account Profile",
    actionType: "UPDATE",
    changeDiff: { fullName: input.fullName, phone: input.phone },
  });

  revalidatePath("/dashboard/profile");
  return {
    success: true,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone,
    },
  };
}

export async function changeUserPasswordAction(newPassword: string) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error("Kata sandi baru harus minimal 6 karakter.");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: sessionUser.userId },
    data: { passwordHash },
  });

  await recordAuditLog({
    weddingId: "GLOBAL_SYSTEM",
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "User",
    moduleName: "User Account Security",
    actionType: "UPDATE",
    changeDiff: { action: "PASSWORD_CHANGED" },
  });

  revalidatePath("/dashboard/profile");
  return { success: true };
}
