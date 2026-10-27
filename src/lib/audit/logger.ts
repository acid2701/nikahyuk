import { prisma } from "@/lib/prisma";

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
    // If weddingId is a pseudo ID like GLOBAL_SYSTEM or a non-existent wedding, skip or check
    if (payload.weddingId === "GLOBAL_SYSTEM") {
      return;
    }

    await prisma.auditLog.create({
      data: {
        weddingId: payload.weddingId,
        userId: payload.userId || null,
        userDisplayName: payload.userDisplayName,
        moduleName: payload.moduleName,
        actionType: payload.actionType,
        changeDiff: payload.changeDiff ? (payload.changeDiff as any) : undefined,
      },
    });
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}
