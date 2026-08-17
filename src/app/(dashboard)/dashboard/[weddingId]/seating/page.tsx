import { createClient } from "@/lib/supabase/server";
import { SeatingManager } from "@/components/modules/seating/seating-manager";

export default async function SeatingPage(props: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const searchParams = (await props.searchParams) || {};
  const urlEventId = searchParams.eventId as string | undefined;

  const supabase = await createClient();

  const { data: events } = await supabase
    .from("wedding_events")
    .select("id, event_name")
    .eq("wedding_id", weddingId)
    .order("event_date", { ascending: true });

  const activeEvent =
    events?.find((e) => e.id === urlEventId) || events?.[0];
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

  const { data: tablesData } = await supabase
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

  const { data: unassignedData } = await supabase
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
