import { createClient } from "@/lib/supabase/server";
import { PreweddingChecklistManager } from "@/components/modules/checklist/prewedding-checklist-manager";
import {
  getCollaboratorSecurityContext,
  resolveEffectiveEventIds,
} from "@/lib/auth/collaborator-security";
import { AccessDeniedCard } from "@/components/shared/access-denied-card";

export default async function PreweddingChecklistsPage(props: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const searchParams = (await props.searchParams) || {};
  const urlEventId = searchParams.eventId as string | undefined;

  const { permissions, allowedEventIds } =
    await getCollaboratorSecurityContext(weddingId);

  if (!permissions.checklist) {
    return (
      <AccessDeniedCard moduleTitle="Checklist Persiapan" weddingId={weddingId} />
    );
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

  const activeEvent =
    events?.find((e) => e.id === effectiveEventId) || null;

  return (
    <PreweddingChecklistManager
      weddingId={weddingId}
      eventId={effectiveEventId || "all"}
      eventName={activeEvent?.event_name || "Semua Acara (Akumulasi Total)"}
    />
  );
}
