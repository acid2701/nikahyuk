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
      <div className="space-y-1">
        <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Rangkaian Acara Pernikahan
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Susun rangkaian hari bahagia (Lamaran, Akad Nikah, Resepsi, dll.) lengkap dengan waktu dan lokasi Google Maps.
        </p>
      </div>

      <EventManager weddingId={weddingId} initialEvents={events as any} />
    </div>
  );
}
