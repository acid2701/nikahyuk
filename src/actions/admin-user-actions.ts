"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/audit/logger";
import { invalidateSystemConfigCache } from "@/lib/cloudflare-r2/dynamic-config";

export interface UserRowItem {
  id: string;
  email: string;
  role: "superadmin" | "admin" | "user";
  isSuspended: boolean;
  createdAt: string;
  weddingsCount: number;
}

export interface StaffAdminPermissions {
  email: string;
  canManageStorage: boolean;
  canViewAuditLogs: boolean;
  canManageBackups: boolean;
  canManageUsers: boolean;
  canEditRbacDefaults: boolean;
}

export async function getRegisteredUsersAction(): Promise<UserRowItem[]> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { weddings: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    role: (u.role as any) || "user",
    isSuspended: false,
    createdAt: u.createdAt.toISOString(),
    weddingsCount: u._count.weddings,
  }));
}

export async function updateUserRoleAction(
  targetUserId: string,
  newRole: "superadmin" | "admin" | "user"
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  await recordAuditLog({
    weddingId: "GLOBAL_SYSTEM",
    userId: user.userId,
    userDisplayName: user.fullName || user.email,
    moduleName: "Superadmin User Management",
    actionType: "UPDATE",
    changeDiff: { targetUserId, newRole },
  });

  revalidatePath("/admin/users");
  return { success: true, targetUserId, newRole };
}

export async function toggleUserSuspensionAction(
  targetUserId: string,
  suspend: boolean
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await recordAuditLog({
    weddingId: "GLOBAL_SYSTEM",
    userId: user.userId,
    userDisplayName: user.fullName || user.email,
    moduleName: "Superadmin User Management",
    actionType: "UPDATE",
    changeDiff: { targetUserId, suspend },
  });

  revalidatePath("/admin/users");
  return { success: true, targetUserId, suspend };
}

export async function getStaffAdminPermissionsAction(): Promise<StaffAdminPermissions[]> {
  const row = await prisma.systemSetting.findUnique({
    where: { key: "staff_admin_permissions" },
  });

  if (row && row.value) {
    return row.value as unknown as StaffAdminPermissions[];
  }

  // Default initial staff permissions
  return [
    {
      email: "admin.staff@nikahyuk.com",
      canManageStorage: false,
      canViewAuditLogs: true,
      canManageBackups: false,
      canManageUsers: true,
      canEditRbacDefaults: false,
    },
  ];
}

export async function updateStaffAdminPermissionsAction(
  permissionsList: StaffAdminPermissions[]
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await prisma.systemSetting.upsert({
    where: { key: "staff_admin_permissions" },
    update: { value: permissionsList as any },
    create: { key: "staff_admin_permissions", value: permissionsList as any },
  });

  invalidateSystemConfigCache();

  await recordAuditLog({
    weddingId: "GLOBAL_SYSTEM",
    userId: user.userId,
    userDisplayName: user.fullName || user.email,
    moduleName: "Superadmin Staff Permissions",
    actionType: "UPDATE",
    changeDiff: { permissionsList },
  });

  revalidatePath("/admin/staff-permissions");
  return { success: true };
}
