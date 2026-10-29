"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
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

function toDocDTO(d: any) {
  if (!d) return null;
  return {
    id: d.id,
    vendor_id: d.vendorId,
    document_title: d.documentTitle,
    r2_file_key: d.r2FileKey,
    file_size_bytes: Number(d.fileSizeBytes),
    mime_type: d.mimeType,
    uploaded_at: d.uploadedAt?.toISOString?.() || d.uploadedAt,
    vendorId: d.vendorId,
    documentTitle: d.documentTitle,
    r2FileKey: d.r2FileKey,
    fileSizeBytes: Number(d.fileSizeBytes),
    mimeType: d.mimeType,
  };
}

function toVendorDTO(v: any) {
  if (!v) return null;
  return {
    id: v.id,
    wedding_id: v.weddingId,
    category: v.category,
    vendor_name: v.vendorName,
    pic_name: v.picName || null,
    sanitized_phone: v.sanitizedPhone || null,
    contract_value: Number(v.contractValue) || 0,
    created_at: v.createdAt?.toISOString?.() || v.createdAt,
    updated_at: v.updatedAt?.toISOString?.() || v.updatedAt,
    weddingId: v.weddingId,
    vendorName: v.vendorName,
    picName: v.picName || null,
    sanitizedPhone: v.sanitizedPhone || null,
    contractValue: Number(v.contractValue) || 0,
    documents: v.documents ? v.documents.map(toDocDTO) : [],
  };
}

export async function createVendorAction(input: CreateVendorInput) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const sanitized = input.contactNumber
    ? sanitizePhoneNumber(input.contactNumber)
    : null;

  const vendor = await prisma.vendor.create({
    data: {
      weddingId: input.weddingId,
      category: input.category.trim(),
      vendorName: input.vendorName.trim(),
      picName: input.picName?.trim() || null,
      sanitizedPhone: sanitized || null,
      contractValue: input.contractValue || 0,
    },
    include: {
      documents: true,
    },
  });

  await recordAuditLog({
    weddingId: input.weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Vendors",
    actionType: "CREATE",
    changeDiff: { vendorName: input.vendorName, category: input.category, eventId: input.eventId, status: input.status },
  });

  revalidatePath(`/dashboard/${input.weddingId}/vendors`);
  revalidatePath(`/dashboard/${input.weddingId}`);
  return toVendorDTO(vendor);
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
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const sanitized = updates.contactNumber
    ? sanitizePhoneNumber(updates.contactNumber)
    : updates.contactNumber === ""
    ? null
    : undefined;

  const dataToUpdate: any = {};
  if (updates.vendorName !== undefined) dataToUpdate.vendorName = updates.vendorName.trim();
  if (updates.category !== undefined) dataToUpdate.category = updates.category.trim();
  if (updates.picName !== undefined) dataToUpdate.picName = updates.picName?.trim() || null;
  if (sanitized !== undefined) dataToUpdate.sanitizedPhone = sanitized;
  if (updates.contractValue !== undefined) dataToUpdate.contractValue = updates.contractValue || 0;

  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: dataToUpdate,
    include: {
      documents: true,
    },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Vendors",
    actionType: "UPDATE",
    changeDiff: { vendorId, updates },
  });

  revalidatePath(`/dashboard/${weddingId}/vendors`);
  revalidatePath(`/dashboard/${weddingId}`);
  return toVendorDTO(vendor);
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
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const document = await prisma.vendorDocument.create({
    data: {
      vendorId,
      documentTitle: doc.documentTitle.trim(),
      r2FileKey: doc.r2FileKey,
      fileSizeBytes: BigInt(doc.fileSizeBytes),
      mimeType: doc.mimeType,
    },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Vendor Documents",
    actionType: "CREATE",
    changeDiff: { vendorId, documentTitle: doc.documentTitle, r2FileKey: doc.r2FileKey, docType: doc.docType },
  });

  revalidatePath(`/dashboard/${weddingId}/vendors`);
  return toDocDTO(document);
}

export async function deleteVendorDocumentAction(
  documentId: string,
  r2FileKey: string,
  weddingId: string
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  await prisma.vendorDocument.delete({
    where: { id: documentId },
  });

  try {
    await deletePhysicalR2File(r2FileKey);
  } catch (err) {
    console.error("Physical R2 cleanup warning:", err);
  }

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Vendor Documents",
    actionType: "DELETE",
    changeDiff: { documentId, r2FileKey },
  });

  revalidatePath(`/dashboard/${weddingId}/vendors`);
  return { success: true };
}

export async function deleteVendorAction(vendorId: string, weddingId: string) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const docs = await prisma.vendorDocument.findMany({
    where: { vendorId },
    select: { r2FileKey: true },
  });

  await prisma.vendor.delete({
    where: { id: vendorId },
  });

  if (docs && docs.length > 0) {
    for (const doc of docs) {
      try {
        await deletePhysicalR2File(doc.r2FileKey);
      } catch (err) {
        console.error("Physical R2 cleanup warning:", err);
      }
    }
  }

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Vendors",
    actionType: "DELETE",
    changeDiff: { vendorId },
  });

  revalidatePath(`/dashboard/${weddingId}/vendors`);
  revalidatePath(`/dashboard/${weddingId}`);
  return { success: true };
}

export async function syncVendorToBudgetAction(vendorId: string, weddingId: string) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, weddingId },
  });

  if (!vendor) {
    throw new Error("Vendor tidak ditemukan.");
  }

  const defaultEvent = await prisma.weddingEvent.findFirst({
    where: { weddingId },
    select: { id: true },
  });

  if (!defaultEvent) {
    throw new Error("Tidak ditemukan acara pernikahan terikat untuk sinkronisasi anggaran.");
  }

  const estimatedCost = Number(vendor.contractValue || 0);

  const budgetItem = await prisma.budgetItem.create({
    data: {
      eventId: defaultEvent.id,
      vendorId: vendor.id,
      itemName: `[Vendor ${vendor.category}] ${vendor.vendorName}`,
      estimatedCost,
      targetPayer: "joint",
      notes: `Autosynced dari Vendor Hub (${vendor.vendorName})`,
      milestones:
        estimatedCost > 0
          ? {
              create: [
                {
                  milestoneName: "DP (Uang Muka 20%)",
                  amount: Math.round(estimatedCost * 0.2),
                  paymentStatus: "unpaid",
                  paidBy: "joint",
                },
                {
                  milestoneName: "Pelunasan (80%)",
                  amount: Math.round(estimatedCost * 0.8),
                  paymentStatus: "unpaid",
                  paidBy: "joint",
                },
              ],
            }
          : undefined,
    },
  });

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Vendors",
    actionType: "UPDATE",
    changeDiff: { vendorId, budgetItemId: budgetItem.id, estimatedCost },
  });

  revalidatePath(`/dashboard/${weddingId}/vendors`);
  revalidatePath(`/dashboard/${weddingId}/budget`);
  revalidatePath(`/dashboard/${weddingId}`);
  return { success: true, budgetItemId: budgetItem.id };
}

export async function rateVendorAction(
  vendorId: string,
  weddingId: string,
  rating: number,
  reviewNotes: string
) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  await recordAuditLog({
    weddingId,
    userId: sessionUser.userId,
    userDisplayName: sessionUser.email || "Pengantin",
    moduleName: "Vendors",
    actionType: "UPDATE",
    changeDiff: { vendorId, rating, reviewNotes },
  });

  revalidatePath(`/dashboard/${weddingId}/vendors`);
  return { success: true };
}
