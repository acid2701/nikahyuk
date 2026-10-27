import { createClient } from "@/lib/db/server";
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

  const db = await createClient();

  const { data: events } = await db
    .from("wedding_events")
    .select("id, event_name")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: true });

  const { effectiveEventId } = resolveEffectiveEventIds(
    urlEventId,
    events || [],
    allowedEventIds
  );

  const activeEvent = effectiveEventId
    ? events?.find((e) => e.id === effectiveEventId)
    : null;
  const activeEventId = activeEvent?.id;

  // Auto-heal/link missing R2 brochure documents for partner vendors imported previously
  await autoLinkMissingPartnerDocumentsAction(weddingId);

  let query = db
    .from("vendors")
    .select("*, vendor_documents(*)")
    .eq("wedding_id", weddingId);

  if (activeEventId) {
    query = query.or(`event_id.eq.${activeEventId},event_id.is.null`);
  }

  let { data: vendorsData, error: queryError } = await query.order("created_at", { ascending: false });

  // Graceful fallback if event_id column is missing in schema
  if (queryError && queryError.message?.includes("event_id")) {
    const fallbackQuery = await db
      .from("vendors")
      .select("*, vendor_documents(*)")
      .eq("wedding_id", weddingId)
      .order("created_at", { ascending: false });
    vendorsData = fallbackQuery.data;
  }

  const vendors = vendorsData || [];

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
