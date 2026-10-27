import { createClient } from "@/lib/db/server";
import { EventManager } from "@/components/modules/events/event-manager";

export default async function EventsPage(props: { params: Promise<any> }) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const supabase = await createClient();

  const { data: eventsData } = await supabase
    .from("wedding_events")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: true });

  const events = eventsData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Sub-Event Manager (Lamaran, Akad, Resepsi, dll.)
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola rincian sub-acara, jadwal waktu, lokasi Google Maps, dan penanggung jawab (Pria/Wanita/Bersama).
        </p>
      </div>

      <EventManager weddingId={weddingId} initialEvents={events as any} />
    </div>
  );
}
