import { prisma } from "@/lib/prisma";
import { EventManager } from "@/components/modules/events/event-manager";

export default async function EventsPage(props: { params: Promise<any> }) {
  const { weddingId } = (await props.params) as { weddingId: string };

  const rawEvents = await prisma.weddingEvent.findMany({
    where: { weddingId },
    orderBy: { createdAt: "asc" },
  });

  const events = rawEvents.map((e) => ({
    id: e.id,
    wedding_id: e.weddingId,
    event_name: e.eventName,
    event_date: e.eventDate instanceof Date ? e.eventDate.toISOString().split("T")[0] : String(e.eventDate),
    time_start: e.timeStart,
    time_end: e.timeEnd,
    event_side: e.eventSide,
    location_name: e.locationName,
    location_maps_url: e.locationMapsUrl,
    created_at: e.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight">
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
