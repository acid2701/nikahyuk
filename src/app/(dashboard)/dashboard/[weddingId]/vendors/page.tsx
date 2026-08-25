import { createClient } from "@/lib/supabase/server";
import { VendorManager } from "@/components/modules/vendors/vendor-manager";
import {
  getCollaboratorSecurityContext,
  resolveEffectiveEventIds,
} from "@/lib/auth/collaborator-security";
import { AccessDeniedCard } from "@/components/shared/access-denied-card";

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

  const supabase = await createClient();

  const { data: events } = await supabase
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

  let query = supabase
    .from("vendors")
    .select("*, vendor_documents(*)")
    .eq("wedding_id", weddingId);

  if (activeEventId) {
    query = query.or(`event_id.eq.${activeEventId},event_id.is.null`);
  }

  const { data: vendorsData } = await query.order("created_at", { ascending: false });
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
