import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuestTableView } from "@/components/modules/guests/guest-table-view";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

export default async function GuestsPage(props: { params: Promise<any> }) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("wedding_events")
    .select("id, event_name")
    .eq("wedding_id", weddingId);

  const activeEventId = events && events.length > 0 ? events[0].id : null;

  const { data: guestsData } = await supabase
    .from("guests")
    .select("*, event_guest_assignments(*)")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: false });

  const guests = (guestsData || []).map((g: any) => ({
    ...g,
    assignments: g.event_guest_assignments || [],
  }));

  let totalGuestsCount = guests.length;
  let totalPaxCount = 0;
  let confirmedPaxCount = 0;
  let declinedCount = 0;
  let pendingCount = 0;

  guests.forEach((g) => {
    totalPaxCount += g.default_pax || 1;
    const assignment = g.assignments[0];
    if (assignment) {
      if (assignment.attendance_status === "attending" || assignment.attendance_status === "checked_in") {
        confirmedPaxCount += assignment.actual_pax || g.default_pax || 1;
      } else if (assignment.attendance_status === "declined") {
        declinedCount++;
      } else {
        pendingCount++;
      }
    } else {
      pendingCount++;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Master Guest Pool & RSVP Tracker
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola buku tamu utama, impor file CSV massal, dan kirim undangan via WhatsApp.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Entri Tamu
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{totalGuestsCount} Entri</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Estimasi total: {totalPaxCount} Pax
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Konfirmasi Hadir (RSVP Yes)
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600">
              {confirmedPaxCount} Pax
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Sudah mengonfirmasi kedatangan
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Berhalangan Hadir (RSVP No)
            </CardTitle>
            <UserX className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-rose-600">
              {declinedCount} Undangan
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Mengonfirmasi tidak dapat hadir
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Belum Merespons (Pending)
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-600">
              {pendingCount} Undangan
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Menunggu konfirmasi / respon
            </p>
          </CardContent>
        </Card>
      </div>

      <GuestTableView weddingId={weddingId} eventId={activeEventId} initialGuests={guests as any} />
    </div>
  );
}
