import { prisma } from "@/lib/prisma";
import { GiftManager } from "@/components/modules/gifts/gift-manager";
import {
  getCollaboratorSecurityContext,
  resolveEffectiveEventIds,
} from "@/lib/auth/collaborator-security";
import { AccessDeniedCard } from "@/components/shared/access-denied-card";

export default async function GiftsPage(props: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const searchParams = (await props.searchParams) || {};
  const urlEventId = searchParams.eventId as string | undefined;

  const { permissions, allowedEventIds } =
    await getCollaboratorSecurityContext(weddingId);

  if (!permissions.gift_log) {
    return <AccessDeniedCard moduleTitle="Log Kado & Angpao" weddingId={weddingId} />;
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

  const rawGifts = await prisma.giftLog.findMany({
    where: { eventId: activeEventId },
    include: { guest: true },
    orderBy: { receivedAt: "desc" },
  });

  const gifts = rawGifts.map((g) => {
    let giverName = g.guest?.fullName || "";
    let itemDesc = g.itemDescription || "";

    if (!giverName) {
      if (g.giftType === "cash") {
        giverName = g.itemDescription || "Tamu";
        itemDesc = "Angpao Tunai";
      } else if (itemDesc.includes(" - ")) {
        const parts = itemDesc.split(" - ");
        giverName = parts[0]?.trim() || "Tamu";
        itemDesc = parts.slice(1).join(" - ")?.trim() || "Kado Fisik";
      } else {
        giverName = g.itemDescription || "Tamu";
      }
    }

    return {
      id: g.id,
      event_id: g.eventId,
      guest_id: g.guestId,
      giver_name: giverName,
      gift_type: g.giftType as any,
      amount: g.cashAmount ? Number(g.cashAmount) : 0,
      cash_amount: g.cashAmount ? Number(g.cashAmount) : 0,
      item_description: itemDesc,
      giver_side: (g.receivedBy || "joint") as any,
      received_by: g.receivedBy,
      notes: null,
      created_at: g.receivedAt.toISOString(),
      received_at: g.receivedAt.toISOString(),
    };
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Pencatatan Kado & Angpao
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Rekapitulasi penerimaan angpao tunai, transfer, dan kado fisik untuk:{" "}
          <span className="font-semibold text-foreground">{activeEvent?.event_name}</span>.
        </p>
      </div>

      <GiftManager
        weddingId={weddingId}
        eventId={activeEventId}
        initialGifts={gifts as any}
      />
    </div>
  );
}
