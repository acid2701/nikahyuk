import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuestTableView } from "@/components/modules/guests/guest-table-view";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import {
  getCollaboratorSecurityContext,
  resolveEffectiveEventIds,
} from "@/lib/auth/collaborator-security";
import { AccessDeniedCard } from "@/components/shared/access-denied-card";

export default async function GuestsPage(props: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const searchParams = (await props.searchParams) || {};
  const urlEventId = searchParams.eventId as string | undefined;

  const { permissions, allowedEventIds } =
    await getCollaboratorSecurityContext(weddingId);

  if (!permissions.guest) {
    return <AccessDeniedCard moduleTitle="Master Tamu & RSVP" weddingId={weddingId} />;
  }

  const rawEvents = await prisma.weddingEvent.findMany({
    where: { weddingId },
    select: { id: true, eventName: true, locationName: true, locationMapsUrl: true },
    orderBy: { createdAt: "asc" },
  });

  const events = rawEvents.map((e) => ({
    id: e.id,
    event_name: e.eventName,
    location_name: e.locationName,
    location_maps_url: e.locationMapsUrl,
  }));

  const { effectiveEventId } = resolveEffectiveEventIds(
    urlEventId,
    events,
    allowedEventIds
  );

  const activeEvent =
    events?.find((e) => e.id === effectiveEventId) || events?.[0];
  const activeEventId = activeEvent?.id || null;

  const rawGuests = await prisma.guest.findMany({
    where: { weddingId },
    include: {
      assignments: {
        include: {
          table: { select: { tableNumberOrName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const guests = rawGuests.map((g) => ({
    id: g.id,
    wedding_id: g.weddingId,
    full_name: g.fullName,
    sanitized_phone: g.sanitizedPhone,
    default_pax: g.defaultPax,
    notes: g.notes,
    created_at: g.createdAt.toISOString(),
    assignments: g.assignments.map((a) => ({
      id: a.id,
      event_id: a.eventId,
      guest_id: a.guestId,
      table_id: a.tableId,
      attendance_status: a.attendanceStatus,
      actual_pax: a.actualPax,
      invitation_slug: g.id,
      table: a.table ? { table_number_or_name: a.table.tableNumberOrName } : null,
      event_tables: a.table ? { table_number_or_name: a.table.tableNumberOrName } : null,
    })),
    event_guest_assignments: g.assignments.map((a) => ({
      id: a.id,
      event_id: a.eventId,
      guest_id: a.guestId,
      table_id: a.tableId,
      attendance_status: a.attendanceStatus,
      actual_pax: a.actualPax,
      invitation_slug: g.id,
      table: a.table ? { table_number_or_name: a.table.tableNumberOrName } : null,
      event_tables: a.table ? { table_number_or_name: a.table.tableNumberOrName } : null,
    })),
  }));

  let totalGuestsCount = guests.length;
  let totalPaxCount = 0;
  let confirmedPaxCount = 0;
  let declinedCount = 0;
  let pendingCount = 0;

  guests.forEach((g) => {
    totalPaxCount += g.default_pax || 1;
    const assignment = g.assignments.find((a: any) => a.event_id === activeEventId) || g.assignments[0];
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
      {/* 1. AIRBNB PILL SUB-NAVIGATION */}
      <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-full border border-border/70 max-w-fit">
        <Link
          href={`/dashboard/${weddingId}/guests${activeEventId ? `?eventId=${activeEventId}` : ""}`}
          className="px-4 py-1.5 text-xs font-semibold rounded-full bg-background text-foreground shadow-xs transition-all"
        >
          Buku Tamu & RSVP
        </Link>
        <Link
          href={`/dashboard/${weddingId}/seating${activeEventId ? `?eventId=${activeEventId}` : ""}`}
          className="px-4 py-1.5 text-xs font-medium rounded-full text-muted-foreground hover:text-foreground transition-all"
        >
          Penataan Tempat Duduk
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Buku Tamu & Konfirmasi Kehadiran
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Kelola daftar undangan dan pantau kehadiran tamu untuk:{" "}
          <span className="font-semibold text-foreground">{activeEvent?.event_name || "Semua Acara"}</span>.
        </p>
      </div>

      {/* 2. ELEVATED METRIC CARDS */}
      <div className="grid gap-3.5 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 hover:border-primary/40 hover:shadow-xs transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Undangan
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div className="text-2xl font-bold font-mono text-foreground">{totalGuestsCount} Entri</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Estimasi total: {totalPaxCount} Pax
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 hover:border-emerald-500/40 hover:shadow-xs transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Konfirmasi Hadir
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {confirmedPaxCount} Pax
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Siap menghadiri acara
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 hover:border-rose-500/40 hover:shadow-xs transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Berhalangan Hadir
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <UserX className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {declinedCount} Undangan
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Konfirmasi berhalangan
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 hover:border-amber-500/40 hover:shadow-xs transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Menunggu Respon
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {pendingCount} Undangan
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Belum konfirmasi RSVP
            </p>
          </CardContent>
        </Card>
      </div>

      <GuestTableView
        weddingId={weddingId}
        eventId={activeEventId}
        initialGuests={guests as any}
        activeEventLocation={activeEvent?.location_maps_url || activeEvent?.location_name || null}
      />
    </div>
  );
}
