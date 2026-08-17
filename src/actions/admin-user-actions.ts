"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  // Fetch all weddings to count workspace per owner
  const { data: weddings } = await supabase
    .from("weddings")
    .select("created_by");

  const countMap: Record<string, number> = {};
  if (weddings) {
    weddings.forEach((w) => {
      countMap[w.created_by] = (countMap[w.created_by] || 0) + 1;
    });
  }

  // Query audit logs to extract registered users and their emails/roles
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("user_id, user_display_name, created_at")
    .order("created_at", { ascending: false });

  const userMap = new Map<string, UserRowItem>();

  // Add current user first
  userMap.set(currentUser.id, {
    id: currentUser.id,
    email: currentUser.email || "user@nikahyuk.com",
    role: (currentUser.app_metadata?.role as any) || (currentUser.user_metadata?.role as any) || "superadmin",
    isSuspended: false,
    createdAt: currentUser.created_at || new Date().toISOString(),
    weddingsCount: countMap[currentUser.id] || 0,
  });

  if (logs) {
    logs.forEach((log) => {
      if (log.user_id && !userMap.has(log.user_id)) {
        userMap.set(log.user_id, {
          id: log.user_id,
          email: log.user_display_name,
          role: "user",
          isSuspended: false,
          createdAt: log.created_at,
          weddingsCount: countMap[log.user_id] || 0,
        });
      }
    });
  }

  return Array.from(userMap.values());
}

export async function updateUserRoleAction(
  targetUserId: string,
  newRole: "superadmin" | "admin" | "user"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await recordAuditLog({
    weddingId: "GLOBAL_SYSTEM",
    userId: user.id,
    userDisplayName: user.email || "Superadmin",
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await recordAuditLog({
    weddingId: "GLOBAL_SYSTEM",
    userId: user.id,
    userDisplayName: user.email || "Superadmin",
    moduleName: "Superadmin User Management",
    actionType: "UPDATE",
    changeDiff: { targetUserId, suspend },
  });

  revalidatePath("/admin/users");
  return { success: true, targetUserId, suspend };
}

export async function getStaffAdminPermissionsAction(): Promise<StaffAdminPermissions[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "staff_admin_permissions")
    .maybeSingle();

  if (data && data.value) {
    return data.value as unknown as StaffAdminPermissions[];
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("system_settings").upsert(
    {
      key: "staff_admin_permissions",
      value: permissionsList as any,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    throw new Error(error.message);
  }

  invalidateSystemConfigCache();

  await recordAuditLog({
    weddingId: "GLOBAL_SYSTEM",
    userId: user.id,
    userDisplayName: user.email || "Superadmin",
    moduleName: "Superadmin Staff Permissions",
    actionType: "UPDATE",
    changeDiff: { permissionsList },
  });

  revalidatePath("/admin/staff-permissions");
  return { success: true };
}
