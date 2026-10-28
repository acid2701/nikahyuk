import { prisma } from "@/lib/prisma";
import { MobileCheckinDesk } from "@/components/modules/view/mobile-checkin-desk";

export default async function ViewCheckinPage(props: { params: Promise<any> }) {
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
        Belum ada sub-event terdaftar untuk check-in.
      </div>
    );
  }

  const rawAssignments = await prisma.eventGuestAssignment.findMany({
    where: { eventId: activeEventId },
    include: {
      guest: { select: { fullName: true } },
      table: { select: { tableNumberOrName: true } },
    },
  });

  const assignments = rawAssignments.map((d) => ({
    assignmentId: d.id,
    guestId: d.guestId,
    fullName: d.guest?.fullName || "Tamu",
    pax: d.actualPax || 1,
    attendanceStatus: d.attendanceStatus,
    souvenirReceived: d.souvenirReceived || false,
    tableName: d.table?.tableNumberOrName || null,
  }));

  return (
    <MobileCheckinDesk
      token={token}
      eventId={activeEventId}
      weddingId={tokenRecord.weddingId}
      initialAssignments={assignments}
    />
  );
}
