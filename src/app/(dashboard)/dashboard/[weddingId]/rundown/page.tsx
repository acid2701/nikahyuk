import { prisma } from "@/lib/prisma";
import { RundownManager } from "@/components/modules/rundown/rundown-manager";
import {
  getCollaboratorSecurityContext,
  resolveEffectiveEventIds,
} from "@/lib/auth/collaborator-security";
import { AccessDeniedCard } from "@/components/shared/access-denied-card";

export default async function RundownPage(props: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const searchParams = (await props.searchParams) || {};
  const urlEventId = searchParams.eventId as string | undefined;

  const { permissions, allowedEventIds } =
    await getCollaboratorSecurityContext(weddingId);

  if (!permissions.rundown) {
    return <AccessDeniedCard moduleTitle="Live Rundown" weddingId={weddingId} />;
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

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    select: { groomName: true, brideName: true },
  });

  const rawRundowns = await prisma.rundown.findMany({
    where: { eventId: activeEventId },
    include: { cues: true },
    orderBy: { sortOrder: "asc" },
  });

  const rundowns = rawRundowns.map((r) => ({
    id: r.id,
    event_id: r.eventId,
    time_start: r.timeStart,
    time_end: r.timeEnd,
    activity_title: r.activityTitle,
    pic_name: r.picName,
    location: r.location,
    contingency_plan: r.contingencyPlan,
    is_internal_only: r.isInternalOnly,
    is_completed: r.isCompleted,
    sort_order: r.sortOrder,
    created_at: r.createdAt.toISOString(),
    rundown_cues: r.cues.map((c) => ({
      id: c.id,
      rundown_id: c.rundownId,
      cue_type: c.cueType,
      cue_title: c.instruction,
      cue_notes: c.instruction,
      instruction: c.instruction,
      created_at: c.createdAt.toISOString(),
    })),
  }));

  const weddingProps = {
    groom_name: wedding?.groomName || "Pengantin Pria",
    bride_name: wedding?.brideName || "Pengantin Wanita",
    groom_father_name: "",
    groom_mother_name: "",
    bride_father_name: "",
    bride_mother_name: "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight">
          Live Rundown, Technical Cues & 1-Click Shift Timeline Engine
        </h1>
        <p className="text-sm text-muted-foreground">
          Susunan agenda acara untuk: <span className="font-semibold text-primary">{activeEvent?.event_name}</span>.
        </p>
      </div>

      <RundownManager
        weddingId={weddingId}
        eventId={activeEventId}
        eventName={activeEvent?.event_name || "Sub-Event"}
        weddingDetails={{
          groomName: wedding?.groomName,
          brideName: wedding?.brideName,
          groomFatherName: "",
          groomMotherName: "",
          brideFatherName: "",
          brideMotherName: "",
        }}
        initialRundowns={rundowns as any}
      />
    </div>
  );
}
