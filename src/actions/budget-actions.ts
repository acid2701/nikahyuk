"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/audit/logger";
import { BudgetItemInput, BudgetItemInputSchema } from "@/types/budget.types";

function toMilestoneDTO(m: any) {
  if (!m) return null;
  return {
    id: m.id,
    budget_item_id: m.budgetItemId,
    milestone_name: m.milestoneName,
    amount: Number(m.amount),
    due_date: m.dueDate
      ? m.dueDate instanceof Date
        ? m.dueDate.toISOString().split("T")[0]
        : String(m.dueDate).split("T")[0]
      : null,
    paid_date: m.paidDate
      ? m.paidDate instanceof Date
        ? m.paidDate.toISOString().split("T")[0]
        : String(m.paidDate).split("T")[0]
      : null,
    alert_days_before: m.alertDaysBefore,
    payment_status: m.paymentStatus,
    paid_by: m.paidBy || "joint",
    created_at: m.createdAt?.toISOString?.() || m.createdAt,
    updated_at: m.updatedAt?.toISOString?.() || m.updatedAt,
    budgetItemId: m.budgetItemId,
    milestoneName: m.milestoneName,
    dueDate: m.dueDate,
    paidDate: m.paidDate,
    alertDaysBefore: m.alertDaysBefore,
    paymentStatus: m.paymentStatus,
    paidBy: m.paidBy || "joint",
  };
}

function toBudgetItemDTO(b: any) {
  if (!b) return null;
  return {
    id: b.id,
    event_id: b.eventId,
    category_id: b.categoryId || null,
    vendor_id: b.vendorId || null,
    item_name: b.itemName,
    estimated_cost: Number(b.estimatedCost),
    target_payer: b.targetPayer,
    notes: b.notes || null,
    created_at: b.createdAt?.toISOString?.() || b.createdAt,
    updated_at: b.updatedAt?.toISOString?.() || b.updatedAt,
    eventId: b.eventId,
    categoryId: b.categoryId || null,
    vendorId: b.vendorId || null,
    itemName: b.itemName,
    estimatedCost: Number(b.estimatedCost),
    targetPayer: b.targetPayer,
    milestones: b.milestones ? b.milestones.map(toMilestoneDTO) : [],
  };
}

export async function createBudgetItemWithMilestonesAction(input: BudgetItemInput) {
  const parsed = BudgetItemInputSchema.parse(input);
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const item = await prisma.budgetItem.create({
    data: {
      eventId: parsed.eventId,
      categoryId: parsed.categoryId || null,
      vendorId: parsed.vendorId || null,
      itemName: parsed.itemName.trim(),
      estimatedCost: parsed.estimatedCost,
      targetPayer: parsed.targetPayer || "joint",
      notes: parsed.notes?.trim() || null,
      milestones:
        parsed.milestones && parsed.milestones.length > 0
          ? {
              create: parsed.milestones.map((m) => ({
                milestoneName: m.milestoneName.trim(),
                amount: m.amount,
                dueDate: m.dueDate ? new Date(m.dueDate) : null,
                paidDate: m.paidDate ? new Date(m.paidDate) : null,
                alertDaysBefore: m.alertDaysBefore || 7,
                paymentStatus: m.paymentStatus || "unpaid",
                paidBy: m.paidBy || parsed.targetPayer || "joint",
              })),
            }
          : undefined,
    },
    include: {
      milestones: true,
    },
  });

  await recordAuditLog({
    weddingId: parsed.weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Budget",
    actionType: "CREATE",
    changeDiff: { itemName: parsed.itemName, estimatedCost: parsed.estimatedCost, side: parsed.targetPayer },
  });

  revalidatePath(`/dashboard/${parsed.weddingId}/budget`);
  return toBudgetItemDTO(item);
}

export async function payMilestoneAction(
  milestoneId: string,
  weddingId: string,
  paymentStatus: "unpaid" | "paid",
  receiptMeta?: {
    r2FileKey: string;
    fileName: string;
    fileSizeBytes: number;
    mimeType: string;
  } | null
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const milestone = await prisma.paymentMilestone.update({
    where: { id: milestoneId },
    data: {
      paymentStatus,
      paidDate: paymentStatus === "paid" ? new Date() : null,
    },
  });

  if (receiptMeta) {
    await prisma.paymentAttachment.create({
      data: {
        milestoneId,
        r2FileKey: receiptMeta.r2FileKey,
        fileName: receiptMeta.fileName,
        fileSizeBytes: BigInt(receiptMeta.fileSizeBytes),
        mimeType: receiptMeta.mimeType,
      },
    });
  }

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Budget Milestones",
    actionType: "UPDATE",
    changeDiff: { milestoneId, paymentStatus, receiptMeta },
  });

  revalidatePath(`/dashboard/${weddingId}/budget`);
  return toMilestoneDTO(milestone);
}

export async function deleteBudgetItemAction(itemId: string, weddingId: string) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  await prisma.budgetItem.delete({
    where: { id: itemId },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Budget",
    actionType: "DELETE",
    changeDiff: { itemId },
  });

  revalidatePath(`/dashboard/${weddingId}/budget`);
  return { success: true };
}

export async function updateBudgetItemAction(
  itemId: string,
  weddingId: string,
  updates: {
    itemName?: string;
    estimatedCost?: number;
    targetPayer?: "groom" | "bride" | "joint";
    notes?: string | null;
    milestones?: any[];
  }
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const dataToUpdate: any = {};
  if (updates.itemName !== undefined) dataToUpdate.itemName = updates.itemName.trim();
  if (updates.estimatedCost !== undefined) dataToUpdate.estimatedCost = updates.estimatedCost;
  if (updates.targetPayer !== undefined) dataToUpdate.targetPayer = updates.targetPayer;
  if (updates.notes !== undefined) dataToUpdate.notes = updates.notes?.trim() || null;

  if (updates.milestones !== undefined) {
    await prisma.paymentMilestone.deleteMany({
      where: { budgetItemId: itemId },
    });

    if (updates.milestones.length > 0) {
      await prisma.paymentMilestone.createMany({
        data: updates.milestones.map((m) => {
          const mDueDate = m.dueDate || m.due_date;
          const mPaidDate = m.paidDate || m.paid_date;
          const isPaid = m.paymentStatus === "paid" || m.payment_status === "paid";
          return {
            budgetItemId: itemId,
            milestoneName: (m.milestoneName || m.milestone_name || "Pembayaran").trim(),
            amount: Number(m.amount) || 0,
            dueDate: mDueDate ? new Date(mDueDate) : null,
            paidDate: mPaidDate ? new Date(mPaidDate) : isPaid ? new Date() : null,
            alertDaysBefore: m.alertDaysBefore || m.alert_days_before || 7,
            paymentStatus: isPaid ? "paid" : "unpaid",
            paidBy: m.paidBy || m.paid_by || updates.targetPayer || "joint",
          };
        }),
      });
    }
  }

  const item = await prisma.budgetItem.update({
    where: { id: itemId },
    data: dataToUpdate,
    include: {
      milestones: true,
    },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Budget",
    actionType: "UPDATE",
    changeDiff: { itemId, updates },
  });

  revalidatePath(`/dashboard/${weddingId}/budget`);
  return toBudgetItemDTO(item);
}
