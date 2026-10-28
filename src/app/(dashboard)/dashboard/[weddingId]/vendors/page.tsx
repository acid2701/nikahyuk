import { prisma } from "@/lib/prisma";
import { VendorManager } from "@/components/modules/vendors/vendor-manager";
import {
  getCollaboratorSecurityContext,
  resolveEffectiveEventIds,
} from "@/lib/auth/collaborator-security";
import { AccessDeniedCard } from "@/components/shared/access-denied-card";
import { autoLinkMissingPartnerDocumentsAction } from "@/actions/vendor-partner-actions";

export default async function VendorsPage(props: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const searchParams = (await props.searchParams) || {};
  const urlEventId = searchParams.eventId as string | undefined;

  const { permissions, allowedEventIds } =
    await getCollaboratorSecurityContext(weddingId);

  if (!permissions.vendor) {
    return <AccessDeniedCard moduleTitle="Vendor Hub & Kontrak" weddingId={weddingId} />;
  }

  const rawEvents = await prisma.weddingEvent.findMany({
    where: { weddingId },
    select: { id: true, eventName: true },
    orderBy: { createdAt: "asc" },
  });

  const events = rawEvents.map((e) => ({
    id: e.id,
    event_name: e.eventName,
  }));

  const { effectiveEventId } = resolveEffectiveEventIds(
    urlEventId,
    events,
    allowedEventIds
  );

  const activeEvent = effectiveEventId
    ? events.find((e) => e.id === effectiveEventId)
    : null;
  const activeEventId = activeEvent?.id;

  // Auto-heal/link missing R2 brochure documents for partner vendors imported previously
  await autoLinkMissingPartnerDocumentsAction(weddingId);

  const whereCondition: any = { weddingId };
  if (activeEventId) {
    whereCondition.OR = [{ eventId: activeEventId }, { eventId: null }];
  }

  const rawVendors = await prisma.vendor.findMany({
    where: { weddingId },
    include: { documents: true },
    orderBy: { createdAt: "desc" },
  });

  const vendors = rawVendors.map((v) => ({
    id: v.id,
    wedding_id: v.weddingId,
    event_id: activeEventId || null,
    vendor_name: v.vendorName,
    category: v.category,
    contact_person: v.picName || "",
    pic_name: v.picName,
    phone_number: v.sanitizedPhone || "",
    sanitized_phone: v.sanitizedPhone,
    instagram: "",
    service_status: "confirmed",
    contract_amount: v.contractValue ? Number(v.contractValue) : null,
    contract_value: v.contractValue ? Number(v.contractValue) : null,
    notes: "",
    created_at: v.createdAt.toISOString(),
    vendor_documents: v.documents.map((d) => ({
      id: d.id,
      vendor_id: d.vendorId,
      document_type: "contract",
      document_title: d.documentTitle,
      file_name: d.documentTitle,
      file_url: d.r2FileKey,
      r2_file_key: d.r2FileKey,
      file_size: Number(d.fileSizeBytes),
      file_size_bytes: Number(d.fileSizeBytes),
      mime_type: d.mimeType,
      created_at: d.uploadedAt.toISOString(),
      uploaded_at: d.uploadedAt.toISOString(),
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            Vendor Directory & Hub Kontrak
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola mitra vendor dan simpan dokumen kontrak untuk:{" "}
            <span className="font-semibold text-primary">
              {activeEvent?.event_name || "Semua Acara"}
            </span>.
          </p>
        </div>
      </div>

      <VendorManager
        weddingId={weddingId}
        eventId={activeEventId}
        events={events || []}
        initialVendors={vendors as any}
      />
    </div>
  );
}
