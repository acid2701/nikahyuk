import { createClient } from "@/lib/supabase/server";
import { MobileGuestLookup } from "@/components/modules/view/mobile-guest-lookup";

export default async function ViewGuestsPage(props: { params: Promise<any> }) {
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
        Belum ada sub-event terdaftar untuk buku tamu.
      </div>
    );
  }

  const { data: assignmentsData } = await supabase
    .from("event_guest_assignments")
    .select("id, actual_pax, attendance_status, guests(full_name), event_tables(table_number_or_name)")
    .eq("event_id", activeEventId);

  const guests = (assignmentsData || []).map((d: any) => ({
    id: d.id,
    fullName: d.guests?.full_name || "Tamu",
    pax: d.actual_pax || 1,
    tableName: d.event_tables?.table_number_or_name || null,
    attendanceStatus: d.attendance_status,
  }));

  return <MobileGuestLookup token={token} guests={guests} />;
}
