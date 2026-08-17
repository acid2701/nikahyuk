"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordAuditLog } from "@/lib/audit/logger";
import { deletePhysicalR2File } from "@/lib/cloudflare-r2/cleanup-helper";
import { sanitizePhoneNumber } from "@/lib/utils/wa-sanitizer";

export interface CreateVendorInput {
  weddingId: string;
  vendorName: string;
  category: string;
  picName?: string | null;
  contactNumber?: string | null;
  contractValue?: number;
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

  const { data: vendor, error } = await supabase
    .from("vendors")
    .insert({
      wedding_id: input.weddingId,
      vendor_name: input.vendorName,
      category: input.category,
      pic_name: input.picName || null,
      sanitized_phone: sanitized || null,
      contract_value: input.contractValue || 0,
    })
    .select()
    .single();

  if (error || !vendor) {
    throw new Error(error?.message || "Gagal membuat data vendor.");
  }

  await recordAuditLog({
    weddingId: input.weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Vendors",
    actionType: "CREATE",
    changeDiff: { vendorName: input.vendorName, category: input.category },
  });

  revalidatePath(`/dashboard/${input.weddingId}/vendors`);
  return vendor;
}

export async function updateVendorAction(
  vendorId: string,
  weddingId: string,
  updates: {
    vendorName?: string;
    category?: string;
    picName?: string | null;
    contactNumber?: string | null;
    contractValue?: number;
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

  const { data: vendor, error } = await supabase
    .from("vendors")
    .update({
      ...(updates.vendorName !== undefined && { vendor_name: updates.vendorName }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.picName !== undefined && { pic_name: updates.picName || null }),
      ...(sanitized !== undefined && { sanitized_phone: sanitized }),
      ...(updates.contractValue !== undefined && { contract_value: updates.contractValue || 0 }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", vendorId)
    .select()
    .single();

  if (error || !vendor) {
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

export async function addVendorDocumentAction(
  vendorId: string,
  weddingId: string,
  doc: {
    documentTitle: string;
    r2FileKey: string;
    fileSizeBytes: number;
    mimeType: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: document, error } = await supabase
    .from("vendor_documents")
    .insert({
      vendor_id: vendorId,
      document_title: doc.documentTitle,
      r2_file_key: doc.r2FileKey,
      file_size_bytes: doc.fileSizeBytes,
      mime_type: doc.mimeType,
    })
    .select()
    .single();

  if (error || !document) {
    throw new Error(error?.message || "Gagal mencatat dokumen vendor.");
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Vendor Documents",
    actionType: "CREATE",
    changeDiff: { vendorId, documentTitle: doc.documentTitle, r2FileKey: doc.r2FileKey },
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
    .eq("id", vendorId);

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
