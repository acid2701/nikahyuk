import { prisma } from "@/lib/prisma";
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
