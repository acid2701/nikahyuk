import { createClient } from "@/lib/db/server";
import { MobileCheckinDesk } from "@/components/modules/view/mobile-checkin-desk";

export default async function ViewCheckinPage(props: { params: Promise<any> }) {
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
        Belum ada sub-event terdaftar untuk check-in.
      </div>
    );
  }

  const { data: assignmentsData } = await supabase
    .from("event_guest_assignments")
    .select("id, guest_id, actual_pax, attendance_status, souvenir_received, guests(full_name), event_tables(table_number_or_name)")
    .eq("event_id", activeEventId);

  const assignments = (assignmentsData || []).map((d: any) => ({
    assignmentId: d.id,
    guestId: d.guest_id,
    fullName: d.guests?.full_name || "Tamu",
    pax: d.actual_pax || 1,
    attendanceStatus: d.attendance_status,
    souvenirReceived: d.souvenir_received || false,
    tableName: d.event_tables?.table_number_or_name || null,
  }));

  return (
    <MobileCheckinDesk
      token={token}
      eventId={activeEventId}
      weddingId={tokenRecord.wedding_id}
      initialAssignments={assignments}
    />
  );
}
