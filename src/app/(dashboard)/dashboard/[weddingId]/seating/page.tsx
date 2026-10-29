import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SeatingManager } from "@/components/modules/seating/seating-manager";
import {
  getCollaboratorSecurityContext,
  resolveEffectiveEventIds,
} from "@/lib/auth/collaborator-security";
import { AccessDeniedCard } from "@/components/shared/access-denied-card";

export default async function SeatingPage(props: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const searchParams = (await props.searchParams) || {};
  const urlEventId = searchParams.eventId as string | undefined;

  const { permissions, allowedEventIds } =
    await getCollaboratorSecurityContext(weddingId);

  if (!permissions.seating) {
    return <AccessDeniedCard moduleTitle="Penataan Tempat Duduk" weddingId={weddingId} />;
  }

  const rawEvents = await prisma.weddingEvent.findMany({
    where: { weddingId },
    select: { id: true, eventName: true },
    orderBy: { createdAt: "asc" },
  });

  const events = rawEvents.map((e) => ({
    id: e.id,
    event_name: e.eventName,
  }));

  const { effectiveEventId } = resolveEffectiveEventIds(
    urlEventId,
    events,
    allowedEventIds
  );

  const activeEvent =
    events?.find((e) => e.id === effectiveEventId) || events?.[0];
  const activeEventId = activeEvent?.id || null;


  if (!activeEventId) {
    return (
      <div className="space-y-4 p-8 text-center border border-dashed rounded-lg">
        <h2 className="font-sans text-lg font-bold">Belum Ada Sub-Event</h2>
        <p className="text-xs text-muted-foreground">
          Mohon tambahkan sub-event (misal: Akad Nikah / Resepsi / Lamaran) terlebih dahulu di modul Acara.
        </p>
      </div>
    );
  }

  const rawTables = await prisma.eventTable.findMany({
    where: { eventId: activeEventId },
    include: {
      assignments: {
        include: {
          guest: { select: { fullName: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const tables = rawTables.map((t) => ({
    id: t.id,
    event_id: t.eventId,
    table_number_or_name: t.tableNumberOrName,
    capacity: t.maxSeats,
    max_seats: t.maxSeats,
    table_shape: "round",
    table_type: "guest",
    notes: t.notes,
    created_at: t.createdAt.toISOString(),
    assignments: t.assignments.map((a) => ({
      id: a.id,
      actual_pax: a.actualPax,
      guest: { full_name: a.guest.fullName },
    })),
  }));

  const rawUnassigned = await prisma.eventGuestAssignment.findMany({
    where: {
      eventId: activeEventId,
      tableId: null,
    },
    include: {
      guest: { select: { fullName: true } },
    },
  });

  const unassignedGuests = rawUnassigned.map((u) => ({
    assignmentId: u.id,
    fullName: u.guest?.fullName || "Tamu",
    pax: u.actualPax || 1,
  }));

  return (
    <div className="space-y-6">
      {/* 1. AIRBNB PILL SUB-NAVIGATION */}
      <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-full border border-border/70 max-w-fit">
        <Link
          href={`/dashboard/${weddingId}/guests${activeEventId ? `?eventId=${activeEventId}` : ""}`}
          className="px-4 py-1.5 text-xs font-medium rounded-full text-muted-foreground hover:text-foreground transition-all"
        >
          Buku Tamu & RSVP
        </Link>
        <Link
          href={`/dashboard/${weddingId}/seating${activeEventId ? `?eventId=${activeEventId}` : ""}`}
          className="px-4 py-1.5 text-xs font-semibold rounded-full bg-background text-foreground shadow-xs transition-all"
        >
          Penataan Tempat Duduk
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Penataan Tempat Duduk Meja
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Atur kapasitas kursi dan plot meja tamu VIP/keluarga untuk:{" "}
          <span className="font-semibold text-foreground">{activeEvent?.event_name}</span>.
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
