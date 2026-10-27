import Link from "next/link";
import { createClient } from "@/lib/db/server";
import { SeatingManager } from "@/components/modules/seating/seating-manager";
import {
  getCollaboratorSecurityContext,
  resolveEffectiveEventIds,
} from "@/lib/auth/collaborator-security";
import { AccessDeniedCard } from "@/components/shared/access-denied-card";

export default async function SeatingPage(props: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const searchParams = (await props.searchParams) || {};
  const urlEventId = searchParams.eventId as string | undefined;

  const { permissions, allowedEventIds } =
    await getCollaboratorSecurityContext(weddingId);

  if (!permissions.seating) {
    return <AccessDeniedCard moduleTitle="Penataan Tempat Duduk" weddingId={weddingId} />;
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

  const { data: tablesData } = await db
    .from("event_tables")
    .select("*, event_guest_assignments(*, guests(full_name))")
    .eq("event_id", activeEventId)
    .order("created_at", { ascending: true });

  const tables = (tablesData || []).map((t: any) => ({
    ...t,
    assignments: (t.event_guest_assignments || []).map((a: any) => ({
      id: a.id,
      actual_pax: a.actual_pax,
      guest: a.guests,
    })),
  }));

  const { data: unassignedData } = await db
    .from("event_guest_assignments")
    .select("id, actual_pax, guests(full_name)")
    .eq("event_id", activeEventId)
    .is("table_id", null);

  const unassignedGuests = (unassignedData || []).map((u: any) => ({
    assignmentId: u.id,
    fullName: u.guests?.full_name || "Tamu",
    pax: u.actual_pax || 1,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 border-b border-border pb-3">
        <Link
          href={`/dashboard/${weddingId}/guests${activeEventId ? `?eventId=${activeEventId}` : ""}`}
          className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          Master Tamu & RSVP
        </Link>
        <Link
          href={`/dashboard/${weddingId}/seating${activeEventId ? `?eventId=${activeEventId}` : ""}`}
          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground shadow-xs"
        >
          Penataan Tempat Duduk (Seating)
        </Link>
      </div>

      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Penataan Tempat Duduk & Meteran Kapasitas (Seating Allocation)
        </h1>
        <p className="text-sm text-muted-foreground">
          Atur denah meja untuk: <span className="font-semibold text-primary">{activeEvent?.event_name}</span>.
        </p>
      </div>

      <SeatingManager
        weddingId={weddingId}
        eventId={activeEventId}
        initialTables={tables as any}
        unassignedGuests={unassignedGuests}
      />
    </div>
  );
}
