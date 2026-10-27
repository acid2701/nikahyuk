"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/server";
import { recordAuditLog } from "@/lib/audit/logger";
import { UserRoleEnum, CustomPermissions, Database } from "@/types/database.types";

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

  let isRegistered = false;
  let targetUserId = user.id;

  if (email.trim().toLowerCase() !== user.email?.trim().toLowerCase()) {
    const { data: matchedLog } = await supabase
      .from("audit_logs")
      .select("user_id")
      .ilike("user_display_name", email.trim())
      .not("user_id", "is", null)
      .limit(1)
      .maybeSingle();

    if (matchedLog?.user_id) {
      targetUserId = matchedLog.user_id;
      isRegistered = true;
    }
  } else {
    isRegistered = true;
  }

  const finalPerms = {
    ...defaultPerms,
    invited_email: email.trim(),
    is_active: isRegistered,
  };


  // Check if collaborator already exists for this wedding
  const { data: existingCollab } = await supabase
    .from("wedding_collaborators")
    .select("id")
    .eq("wedding_id", weddingId)
    .eq("user_id", targetUserId)
    .maybeSingle();

  let collaborator;
  if (existingCollab) {
    const { data: updated, error: updateErr } = await supabase
      .from("wedding_collaborators")
      .update({
        role,
        custom_permissions: finalPerms as any,
      })
      .eq("id", existingCollab.id)
      .select()
      .single();

    if (updateErr) {
      throw new Error(updateErr.message);
    }
    collaborator = updated;
  } else {
    const { data: inserted, error: insertErr } = await supabase
      .from("wedding_collaborators")
      .insert({
        wedding_id: weddingId,
        user_id: targetUserId,
        role: role,
        custom_permissions: finalPerms as any,
      })
      .select()
      .single();


    if (insertErr) {
      throw new Error(insertErr.message);
    }
    collaborator = inserted;
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Owner",
    moduleName: "Collaborators",
    actionType: existingCollab ? "UPDATE" : "CREATE",
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

export async function removeCollaboratorAction(
  collaboratorId: string,
  weddingId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("wedding_collaborators")
    .delete()
    .eq("id", collaboratorId)
    .eq("wedding_id", weddingId);

  if (error) {
    throw new Error(error.message);
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Owner",
    moduleName: "Collaborators",
    actionType: "DELETE",
    changeDiff: { collaboratorId },
  });

  revalidatePath(`/dashboard/${weddingId}/settings/collaborators`);
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const updatePayload: Database["public"]["Tables"]["weddings"]["Update"] = {};
  if (updates.groomName !== undefined) updatePayload.groom_name = updates.groomName;
  if (updates.brideName !== undefined) updatePayload.bride_name = updates.brideName;
  if (updates.groomFatherName !== undefined) updatePayload.groom_father_name = updates.groomFatherName || null;
  if (updates.groomMotherName !== undefined) updatePayload.groom_mother_name = updates.groomMotherName || null;
  if (updates.brideFatherName !== undefined) updatePayload.bride_father_name = updates.brideFatherName || null;
  if (updates.brideMotherName !== undefined) updatePayload.bride_mother_name = updates.brideMotherName || null;

  if (updates.weddingSlug !== undefined) {
    const slugCleaned = updates.weddingSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (slugCleaned.length < 3) {
      throw new Error("Slug harus minimal 3 karakter alfanumerik.");
    }

    const { data: existingSlug } = await supabase
      .from("weddings")
      .select("id")
      .eq("wedding_slug", slugCleaned)
      .neq("id", weddingId)
      .maybeSingle();

    if (existingSlug) {
      throw new Error(`Slug '${slugCleaned}' sudah digunakan workspace lain. Silakan pilih slug unik.`);
    }

    updatePayload.wedding_slug = slugCleaned;
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new Error("Tidak ada perubahan yang dikirim.");
  }

  const { data, error } = await supabase
    .from("weddings")
    .update(updatePayload)
    .eq("id", weddingId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Gagal memperbarui profil pernikahan.");
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Owner",
    moduleName: "Wedding Profile",
    actionType: "UPDATE",
    changeDiff: updates,
  });

  revalidatePath(`/dashboard/${weddingId}/settings/profile`);
  revalidatePath(`/dashboard/${weddingId}`);
  return data;
}
