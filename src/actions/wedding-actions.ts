"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordAuditLog } from "@/lib/audit/logger";
import { UserRoleEnum, CustomPermissions } from "@/types/database.types";

export async function createWeddingAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const groomName = formData.get("groom_name") as string;
  const brideName = formData.get("bride_name") as string;

  if (!groomName || !brideName) {
    throw new Error("Nama pengantin pria dan wanita wajib diisi.");
  }

  const slug = `${groomName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${brideName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data: wedding, error } = await supabase
    .from("weddings")
    .insert({
      created_by: user.id,
      groom_name: groomName,
      bride_name: brideName,
      wedding_slug: slug,
    })
    .select()
    .single();

  if (error || !wedding) {
    throw new Error(error?.message || "Gagal membuat ruang kerja pernikahan.");
  }

  const today = new Date().toISOString().split("T")[0];
  await supabase.from("wedding_events").insert([
    {
      wedding_id: wedding.id,
      event_name: "Akad Nikah",
      event_date: today,
      event_side: "joint",
    },
    {
      wedding_id: wedding.id,
      event_name: "Resepsi",
      event_date: today,
      event_side: "joint",
    },
  ]);

  await recordAuditLog({
    weddingId: wedding.id,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Workspace",
    actionType: "CREATE",
    changeDiff: { groom_name: groomName, bride_name: brideName, slug },
  });

  revalidatePath("/dashboard");
  return wedding;
}

export async function inviteCollaboratorAction(
  weddingId: string,
  email: string,
  role: UserRoleEnum,
  permissions?: CustomPermissions
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const defaultPerms: CustomPermissions = permissions || {
    budget: false,
    vendor: role === "wo",
    rundown: true,
    guest: true,
    gift_log: false,
  };

  const { data: collaborator, error } = await supabase
    .from("wedding_collaborators")
    .insert({
      wedding_id: weddingId,
      user_id: user.id,
      role: role,
      custom_permissions: defaultPerms as any,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Owner",
    moduleName: "Collaborators",
    actionType: "CREATE",
    changeDiff: { email, role, permissions: defaultPerms },
  });

  revalidatePath(`/dashboard/${weddingId}/settings/collaborators`);
  return collaborator;
}

export async function updateCollaboratorPermissionsAction(
  collaboratorId: string,
  weddingId: string,
  permissions: CustomPermissions
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("wedding_collaborators")
    .update({
      custom_permissions: permissions as any,
    })
    .eq("id", collaboratorId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Owner",
    moduleName: "Collaborators",
    actionType: "UPDATE",
    changeDiff: { collaboratorId, permissions },
  });

  revalidatePath(`/dashboard/${weddingId}/settings/collaborators`);
  return data;
}
