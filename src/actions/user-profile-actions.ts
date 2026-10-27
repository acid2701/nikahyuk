"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/server";
import { recordAuditLog } from "@/lib/audit/logger";

export async function updateUserProfileDetailAction(input: {
  fullName: string;
  phone?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase.auth.updateUser({
    data: {
      full_name: input.fullName.trim(),
      phone: input.phone?.trim() || "",
    },
  });

  if (error) {
    throw new Error(error.message || "Gagal memperbarui profil pengguna.");
  }

  await recordAuditLog({
    weddingId: "GLOBAL_SYSTEM",
    userId: user.id,
    userDisplayName: input.fullName || user.email || "User",
    moduleName: "User Account Profile",
    actionType: "UPDATE",
    changeDiff: { fullName: input.fullName, phone: input.phone },
  });

  revalidatePath("/dashboard/profile");
  return { success: true, user: data.user };
}

export async function changeUserPasswordAction(newPassword: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error("Kata sandi baru harus minimal 6 karakter.");
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message || "Gagal memperbarui kata sandi.");
  }

  await recordAuditLog({
    weddingId: "GLOBAL_SYSTEM",
    userId: user.id,
    userDisplayName: user.email || "User",
    moduleName: "User Account Security",
    actionType: "UPDATE",
    changeDiff: { action: "PASSWORD_CHANGED" },
  });

  revalidatePath("/dashboard/profile");
  return { success: true };
}
