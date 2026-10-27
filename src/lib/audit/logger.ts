import { createClient } from "@/lib/db/server";

export interface AuditLogPayload {
  weddingId: string;
  userId?: string | null;
  userDisplayName: string;
  moduleName: string;
  actionType: "CREATE" | "UPDATE" | "DELETE" | "SHIFT_TIMELINE";
  changeDiff?: Record<string, unknown> | null;
}

export async function recordAuditLog(payload: AuditLogPayload): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("audit_logs").insert({
      wedding_id: payload.weddingId,
      user_id: payload.userId || null,
      user_display_name: payload.userDisplayName,
      module_name: payload.moduleName,
      action_type: payload.actionType,
      change_diff: payload.changeDiff ? (payload.changeDiff as any) : null,
    });
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}
