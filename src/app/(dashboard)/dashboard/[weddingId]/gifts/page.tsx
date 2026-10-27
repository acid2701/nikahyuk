import { createClient } from "@/lib/db/server";
import { GiftManager } from "@/components/modules/gifts/gift-manager";
import {
  getCollaboratorSecurityContext,
  resolveEffectiveEventIds,
} from "@/lib/auth/collaborator-security";
import { AccessDeniedCard } from "@/components/shared/access-denied-card";

export default async function GiftsPage(props: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const searchParams = (await props.searchParams) || {};
  const urlEventId = searchParams.eventId as string | undefined;

  const { permissions, allowedEventIds } =
    await getCollaboratorSecurityContext(weddingId);

  if (!permissions.gift_log) {
    return <AccessDeniedCard moduleTitle="Log Kado & Angpao" weddingId={weddingId} />;
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

  const activeEvent =
    events?.find((e) => e.id === effectiveEventId) || events?.[0];
  const activeEventId = activeEvent?.id || null;


  if (!activeEventId) {
    return (
      <div className="space-y-4 p-8 text-center border border-dashed rounded-lg">
        <h2 className="font-serif text-lg font-bold">Belum Ada Sub-Event</h2>
        <p className="text-xs text-muted-foreground">
          Mohon tambahkan sub-event (misal: Akad Nikah / Resepsi / Lamaran) terlebih dahulu di modul Acara.
        </p>
      </div>
    );
  }

  const { data: giftsData } = await db
    .from("gifts_log")
    .select("*")
    .eq("event_id", activeEventId)
    .order("created_at", { ascending: false });

  const gifts = giftsData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Log Kado & Angpao (Gifts Logger)
        </h1>
        <p className="text-sm text-muted-foreground">
          Rekapitulasi penerimaan angpao tunai & kado fisik untuk:{" "}
          <span className="font-semibold text-primary">{activeEvent?.event_name}</span>.
        </p>
      </div>

      <GiftManager
        weddingId={weddingId}
        eventId={activeEventId}
        initialGifts={gifts as any}
      />
    </div>
  );
}
