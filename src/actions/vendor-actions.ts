"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordAuditLog } from "@/lib/audit/logger";
import { deletePhysicalR2File } from "@/lib/cloudflare-r2/cleanup-helper";
import { sanitizePhoneNumber } from "@/lib/utils/wa-sanitizer";

export interface CreateVendorInput {
  weddingId: string;
  eventId?: string | null;
  vendorName: string;
  category: string;
  picName?: string | null;
  contactNumber?: string | null;
  contractValue?: number;
  status?: "candidate" | "shortlisted" | "selected" | "rejected";
  prosConsNotes?: string | null;
  packageDetails?: string | null;
}

export async function createVendorAction(input: CreateVendorInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const sanitized = input.contactNumber
    ? sanitizePhoneNumber(input.contactNumber)
    : null;

  const insertData: Record<string, any> = {
    wedding_id: input.weddingId,
    vendor_name: input.vendorName,
    category: input.category,
    pic_name: input.picName || null,
    sanitized_phone: sanitized || null,
    contract_value: input.contractValue || 0,
    status: input.status || "candidate",
    pros_cons_notes: input.prosConsNotes || null,
    package_details: input.packageDetails || null,
  };

  if (input.eventId) {
    insertData.event_id = input.eventId;
  }

  let { data: vendor, error } = await supabase
    .from("vendors")
    .insert(insertData as any)
    .select()
    .single();

  // Graceful fallback if event_id or new columns are missing in Supabase schema
  if (error) {
    if (insertData.event_id) delete insertData.event_id;
    if (insertData.status) delete insertData.status;
    if (insertData.pros_cons_notes) delete insertData.pros_cons_notes;
    if (insertData.package_details) delete insertData.package_details;

    const retry = await supabase
      .from("vendors")
      .insert(insertData as any)
      .select()
      .single();
    vendor = retry.data;
    error = retry.error;
  }

  if (error || !vendor) {
    console.error("Create vendor error:", error);
    throw new Error(error?.message || "Gagal membuat data vendor.");
  }

  await recordAuditLog({
    weddingId: input.weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Vendors",
    actionType: "CREATE",
    changeDiff: { vendorName: input.vendorName, category: input.category, eventId: input.eventId, status: input.status },
  });

  revalidatePath(`/dashboard/${input.weddingId}/vendors`);
  return vendor;
}

export async function updateVendorAction(
  vendorId: string,
  weddingId: string,
  updates: {
    eventId?: string | null;
    vendorName?: string;
    category?: string;
    picName?: string | null;
    contactNumber?: string | null;
    contractValue?: number;
    status?: "candidate" | "shortlisted" | "selected" | "rejected";
    prosConsNotes?: string | null;
    packageDetails?: string | null;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const sanitized = updates.contactNumber
    ? sanitizePhoneNumber(updates.contactNumber)
    : updates.contactNumber === ""
    ? null
    : undefined;

  const updateData: Record<string, any> = {
    ...(updates.vendorName !== undefined && { vendor_name: updates.vendorName }),
    ...(updates.category !== undefined && { category: updates.category }),
    ...(updates.picName !== undefined && { pic_name: updates.picName || null }),
    ...(sanitized !== undefined && { sanitized_phone: sanitized }),
    ...(updates.contractValue !== undefined && { contract_value: updates.contractValue || 0 }),
    ...(updates.status !== undefined && { status: updates.status }),
    ...(updates.prosConsNotes !== undefined && { pros_cons_notes: updates.prosConsNotes || null }),
    ...(updates.packageDetails !== undefined && { package_details: updates.packageDetails || null }),
    updated_at: new Date().toISOString(),
  };

  if (updates.eventId !== undefined && updates.eventId !== null) {
    updateData.event_id = updates.eventId;
  }

  let { data: vendor, error } = await supabase
    .from("vendors")
    .update(updateData as any)
    .eq("id", vendorId)
    .eq("wedding_id", weddingId)
    .select()
    .single();

  // Graceful fallback if new columns are missing in Supabase schema
  if (error) {
    delete updateData.event_id;
    delete updateData.status;
    delete updateData.pros_cons_notes;
    delete updateData.package_details;

    const retry = await supabase
      .from("vendors")
      .update(updateData as any)
      .eq("id", vendorId)
      .eq("wedding_id", weddingId)
      .select()
      .single();
    vendor = retry.data;
    error = retry.error;
  }

  if (error || !vendor) {
    console.error("Update vendor error:", error);
    throw new Error(error?.message || "Gagal memperbarui vendor.");
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Vendors",
    actionType: "UPDATE",
    changeDiff: { vendorId, updates },
  });

  revalidatePath(`/dashboard/${weddingId}/vendors`);
  return vendor;
}

export async function updateVendorStatusAction(
  vendorId: string,
  weddingId: string,
  newStatus: "candidate" | "shortlisted" | "selected" | "rejected"
) {
  return await updateVendorAction(vendorId, weddingId, { status: newStatus });
}

export async function addVendorDocumentAction(
  vendorId: string,
  weddingId: string,
  doc: {
    documentTitle: string;
    r2FileKey: string;
    fileSizeBytes: number;
    mimeType: string;
    docType?: "pricelist" | "menu" | "contract" | "receipt" | "other";
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const insertData: Record<string, any> = {
    vendor_id: vendorId,
    document_title: doc.documentTitle,
    r2_file_key: doc.r2FileKey,
    file_size_bytes: doc.fileSizeBytes,
    mime_type: doc.mimeType,
    doc_type: doc.docType || "pricelist",
  };

  let { data: document, error } = await supabase
    .from("vendor_documents")
    .insert(insertData as any)
    .select()
    .single();

  if (error && error.message?.includes("doc_type")) {
    delete insertData.doc_type;
    const retry = await supabase
      .from("vendor_documents")
      .insert(insertData as any)
      .select()
      .single();
    document = retry.data;
    error = retry.error;
  }

  if (error || !document) {
    throw new Error(error?.message || "Gagal mencatat dokumen vendor.");
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Vendor Documents",
    actionType: "CREATE",
    changeDiff: { vendorId, documentTitle: doc.documentTitle, r2FileKey: doc.r2FileKey, docType: doc.docType },
  });

  revalidatePath(`/dashboard/${weddingId}/vendors`);
  return document;
}

export async function deleteVendorDocumentAction(
  documentId: string,
  r2FileKey: string,
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
    .from("vendor_documents")
    .delete()
    .eq("id", documentId);

  if (error) {
    throw new Error(error.message);
  }

  try {
    await deletePhysicalR2File(r2FileKey);
  } catch (err) {
    console.error("Physical R2 cleanup warning:", err);
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Vendor Documents",
    actionType: "DELETE",
    changeDiff: { documentId, r2FileKey },
  });

  revalidatePath(`/dashboard/${weddingId}/vendors`);
  return { success: true };
}

export async function deleteVendorAction(vendorId: string, weddingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: docs } = await supabase
    .from("vendor_documents")
    .select("r2_file_key")
    .eq("vendor_id", vendorId);

  const { error } = await supabase
    .from("vendors")
    .delete()
    .eq("id", vendorId)
    .eq("wedding_id", weddingId);

  if (error) {
    throw new Error(error.message);
  }

  if (docs && docs.length > 0) {
    for (const doc of docs) {
      try {
        await deletePhysicalR2File(doc.r2_file_key);
      } catch (err) {
        console.error("Physical R2 cleanup warning:", err);
      }
    }
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Vendors",
    actionType: "DELETE",
    changeDiff: { vendorId },
  });

  revalidatePath(`/dashboard/${weddingId}/vendors`);
  return { success: true };
}

export async function syncVendorToBudgetAction(vendorId: string, weddingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Fetch vendor details
  const { data: vendor, error: vendorErr } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", vendorId)
    .eq("wedding_id", weddingId)
    .single();

  if (vendorErr || !vendor) {
    throw new Error(vendorErr?.message || "Vendor tidak ditemukan.");
  }

  // Check if budget item already created
  if ((vendor as any).synced_budget_item_id) {
    return {
      success: true,
      message: "Vendor sudah tersinkronisasi ke modul Anggaran sebelumnya.",
      budgetItemId: (vendor as any).synced_budget_item_id,
    };
  }

  // Get active wedding event (or default event for wedding)
  let eventId = vendor.event_id || null;
  if (!eventId) {
    const { data: events } = await supabase
      .from("wedding_events")
      .select("id")
      .eq("wedding_id", weddingId)
      .limit(1);
    if (events && events.length > 0) {
      eventId = events[0].id;
    }
  }

  if (!eventId) {
    throw new Error("Tidak ditemukan acara pernikahan terikat untuk sinkronisasi anggaran.");
  }

  const estimatedCost = Number(vendor.contract_value || 0);

  // Insert into budget_items
  const { data: budgetItem, error: budgetErr } = await supabase
    .from("budget_items")
    .insert({
      event_id: eventId,
      vendor_id: vendorId,
      item_name: `[Vendor ${vendor.category}] ${vendor.vendor_name}`,
      estimated_cost: estimatedCost,
      target_payer: "joint",
      notes: `Autosynced dari Vendor Hub (${vendor.vendor_name})`,
    })
    .select()
    .single();

  if (budgetErr || !budgetItem) {
    throw new Error(budgetErr?.message || "Gagal membuat pos anggaran.");
  }

  // Insert default milestones (DP 20%, Pelunasan 80%)
  if (estimatedCost > 0) {
    await supabase.from("payment_milestones").insert([
      {
        budget_item_id: budgetItem.id,
        milestone_name: "DP (Uang Muka 20%)",
        amount: Math.round(estimatedCost * 0.2),
        payment_status: "unpaid",
        paid_by: "joint",
      },
      {
        budget_item_id: budgetItem.id,
        milestone_name: "Pelunasan (80%)",
        amount: Math.round(estimatedCost * 0.8),
        payment_status: "unpaid",
        paid_by: "joint",
      },
    ]);
  }

  // Update vendor with synced_budget_item_id with schema fallback
  try {
    await supabase
      .from("vendors")
      .update({ synced_budget_item_id: budgetItem.id } as any)
      .eq("id", vendorId);
  } catch (e) {
    console.warn("Synced budget item id column missing in Supabase, skipped storing property.");
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Vendors",
    actionType: "UPDATE",
    changeDiff: { vendorId, synced_budget_item_id: budgetItem.id, estimatedCost },
  });

  revalidatePath(`/dashboard/${weddingId}/vendors`);
  revalidatePath(`/dashboard/${weddingId}/budget`);
  return { success: true, budgetItemId: budgetItem.id };
}

export async function rateVendorAction(
  vendorId: string,
  weddingId: string,
  rating: number,
  reviewNotes: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const { error } = await supabase
      .from("vendors")
      .update({
        rating,
        review_notes: reviewNotes,
      } as any)
      .eq("id", vendorId)
      .eq("wedding_id", weddingId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    console.warn("Rating columns might be missing in Supabase schema:", err);
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Vendors",
    actionType: "UPDATE",
    changeDiff: { vendorId, rating, reviewNotes },
  });

  revalidatePath(`/dashboard/${weddingId}/vendors`);
  return { success: true };
}
