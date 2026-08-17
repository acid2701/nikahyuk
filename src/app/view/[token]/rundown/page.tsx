import { createClient } from "@/lib/supabase/server";
import { MobileRundownView } from "@/components/modules/view/mobile-rundown-view";

export default async function ViewRundownPage(props: { params: Promise<any> }) {
  const { token } = (await props.params) as { token: string };
  const supabase = await createClient();

  const { data: tokenRecord } = await supabase
    .from("shareable_tokens")
    .select("wedding_id")
    .eq("token_hash", token)
    .single();

  if (!tokenRecord) return null;

  const { data: events } = await supabase
    .from("wedding_events")
    .select("id")
    .eq("wedding_id", tokenRecord.wedding_id);

  const activeEventId = events && events.length > 0 ? events[0].id : null;

  if (!activeEventId) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        Belum ada sub-event terdaftar untuk rundown.
      </div>
    );
  }

  const { data: rundownsData } = await supabase
    .from("rundowns")
    .select("*, rundown_cues(*)")
    .eq("event_id", activeEventId)
    .order("sort_order", { ascending: true });

  const rundowns = (rundownsData || []).map((d: any) => ({
    id: d.id,
    timeStart: d.time_start,
    timeEnd: d.time_end,
    activityTitle: d.activity_title,
    picName: d.pic_name,
    location: d.location,
    isCompleted: d.is_completed,
    cues: d.rundown_cues || [],
  }));

  return (
    <MobileRundownView
      token={token}
      eventId={activeEventId}
      initialRundowns={rundowns}
    />
  );
}
