import { createClient } from "@/lib/supabase/server";
import { RundownManager } from "@/components/modules/rundown/rundown-manager";

export default async function RundownPage(props: { params: Promise<any> }) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("wedding_events")
    .select("id, event_name")
    .eq("wedding_id", weddingId);

  const activeEventId = events && events.length > 0 ? events[0].id : null;

  if (!activeEventId) {
    return (
      <div className="space-y-4 p-8 text-center border border-dashed rounded-lg">
        <h2 className="font-serif text-lg font-bold">Belum Ada Sub-Event</h2>
        <p className="text-xs text-muted-foreground">
          Mohon tambahkan sub-event (misal: Akad Nikah / Resepsi) terlebih dahulu di modul Acara.
        </p>
      </div>
    );
  }

  const { data: rundownsData } = await supabase
    .from("rundowns")
    .select("*, rundown_cues(*)")
    .eq("event_id", activeEventId)
    .order("sort_order", { ascending: true });

  const rundowns = rundownsData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Live Rundown, Technical Cues & 1-Click Shift Timeline Engine
        </h1>
        <p className="text-sm text-muted-foreground">
          Susunan agenda acara langsung, instruksi cue sound/lighting, dan fitur pergeseran waktu 1-click.
        </p>
      </div>

      <RundownManager
        weddingId={weddingId}
        eventId={activeEventId}
        initialRundowns={rundowns as any}
      />
    </div>
  );
}
