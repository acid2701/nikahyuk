import { prisma } from "@/lib/prisma";
import { MobileRundownView } from "@/components/modules/view/mobile-rundown-view";

export default async function ViewRundownPage(props: { params: Promise<any> }) {
  const { token } = (await props.params) as { token: string };

  const tokenRecord = await prisma.shareableToken.findUnique({
    where: { tokenHash: token },
    select: { weddingId: true },
  });

  if (!tokenRecord) return null;

  const events = await prisma.weddingEvent.findMany({
    where: { weddingId: tokenRecord.weddingId },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  const activeEventId = events && events.length > 0 ? events[0].id : null;

  if (!activeEventId) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        Belum ada sub-event terdaftar untuk rundown.
      </div>
    );
  }

  const rawRundowns = await prisma.rundown.findMany({
    where: { eventId: activeEventId },
    include: { cues: true },
    orderBy: { sortOrder: "asc" },
  });

  const rundowns = rawRundowns.map((d) => ({
    id: d.id,
    timeStart: d.timeStart,
    timeEnd: d.timeEnd,
    activityTitle: d.activityTitle,
    picName: d.picName,
    location: d.location,
    isCompleted: d.isCompleted,
    cues: d.cues.map((c) => ({
      id: c.id,
      cueType: c.cueType,
      instruction: c.instruction,
    })),
  }));

  return (
    <MobileRundownView
      token={token}
      eventId={activeEventId}
      initialRundowns={rundowns as any}
    />
  );
}
