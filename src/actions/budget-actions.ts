"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordAuditLog } from "@/lib/audit/logger";
import { BudgetItemInput, BudgetItemInputSchema } from "@/types/budget.types";

export async function createBudgetItemWithMilestonesAction(input: BudgetItemInput) {
  const parsed = BudgetItemInputSchema.parse(input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: item, error: itemErr } = await supabase
    .from("budget_items")
    .insert({
      event_id: parsed.eventId,
      category_id: parsed.categoryId || null,
      vendor_id: parsed.vendorId || null,
      item_name: parsed.itemName,
      estimated_cost: parsed.estimatedCost,
      target_payer: parsed.targetPayer,
      notes: parsed.notes || null,
    })
    .select()
    .single();

  if (itemErr || !item) {
    throw new Error(itemErr?.message || "Gagal membuat pos anggaran.");
  }

  if (parsed.milestones && parsed.milestones.length > 0) {
    const milestoneRows = parsed.milestones.map((m) => ({
      budget_item_id: item.id,
      milestone_name: m.milestoneName,
      amount: m.amount,
      due_date: m.dueDate || null,
      paid_date: m.paidDate || null,
      alert_days_before: m.alertDaysBefore || 7,
      payment_status: m.paymentStatus,
      paid_by: m.paidBy,
    }));

    const { error: msErr } = await supabase
      .from("payment_milestones")
      .insert(milestoneRows);

    if (msErr) {
      console.error("Failed to insert milestones:", msErr);
    }
  }

  await recordAuditLog({
    weddingId: parsed.weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Budget",
    actionType: "CREATE",
    changeDiff: { itemName: parsed.itemName, estimatedCost: parsed.estimatedCost, side: parsed.targetPayer },
  });

  revalidatePath(`/dashboard/${parsed.weddingId}/budget`);
  return item;
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const todayStr = new Date().toISOString().split("T")[0];

  const { data: milestone, error } = await supabase
    .from("payment_milestones")
    .update({
      payment_status: paymentStatus,
      paid_date: paymentStatus === "paid" ? todayStr : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", milestoneId)
    .select()
    .single();

  if (error || !milestone) {
    throw new Error(error?.message || "Gagal memperbarui status pembayaran termin.");
  }

  if (receiptMeta) {
    await supabase.from("payment_attachments").insert({
      milestone_id: milestoneId,
      r2_file_key: receiptMeta.r2FileKey,
      file_name: receiptMeta.fileName,
      file_size_bytes: receiptMeta.fileSizeBytes,
      mime_type: receiptMeta.mimeType,
    });
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Budget Milestones",
    actionType: "UPDATE",
    changeDiff: { milestoneId, paymentStatus, receiptMeta },
  });

  revalidatePath(`/dashboard/${weddingId}/budget`);
  return milestone;
}

export async function deleteBudgetItemAction(itemId: string, weddingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("budget_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    throw new Error(error.message);
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
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
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const updatePayload: {
    item_name?: string;
    estimated_cost?: number;
    target_payer?: "groom" | "bride" | "joint";
    notes?: string | null;
    updated_at?: string;
  } = {
    updated_at: new Date().toISOString(),
  };

  if (updates.itemName !== undefined) updatePayload.item_name = updates.itemName;
  if (updates.estimatedCost !== undefined) updatePayload.estimated_cost = updates.estimatedCost;
  if (updates.targetPayer !== undefined) updatePayload.target_payer = updates.targetPayer;
  if (updates.notes !== undefined) updatePayload.notes = updates.notes;

  const { data: item, error } = await supabase
    .from("budget_items")
    .update(updatePayload)
    .eq("id", itemId)
    .select()
    .single();

  if (error || !item) {
    throw new Error(error?.message || "Gagal memperbarui pos anggaran.");
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Budget",
    actionType: "UPDATE",
    changeDiff: { itemId, updates },
  });

  revalidatePath(`/dashboard/${weddingId}/budget`);
  return item;
}

