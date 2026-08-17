"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordAuditLog } from "@/lib/audit/logger";

export interface ChecklistItemData {
  id: string;
  category: "kua" | "seserahan" | "lamaran" | "emergency";
  item_name: string;
  notes?: string;
  is_completed: boolean;
}

export async function toggleChecklistItemAction(
  weddingId: string,
  itemId: string,
  isCompleted: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "User",
    moduleName: "Checklists",
    actionType: "UPDATE",
    changeDiff: { itemId, isCompleted },
  });

  revalidatePath(`/dashboard/${weddingId}/checklists`);
  return { success: true };
}
