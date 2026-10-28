import { prisma } from "@/lib/prisma";
import { MobileGuestLookup } from "@/components/modules/view/mobile-guest-lookup";

export default async function ViewGuestsPage(props: { params: Promise<any> }) {
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
        Belum ada sub-event terdaftar untuk buku tamu.
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

  const guests = rawAssignments.map((d) => ({
    id: d.id,
    fullName: d.guest?.fullName || "Tamu",
    pax: d.actualPax || 1,
    tableName: d.table?.tableNumberOrName || null,
    attendanceStatus: d.attendanceStatus,
  }));

  return <MobileGuestLookup token={token} guests={guests} />;
}
