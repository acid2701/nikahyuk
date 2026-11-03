import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getAppBranding } from "@/lib/branding";
import { AppSidebar } from "@/components/shared/navigation/app-sidebar";
import { DashboardHeader } from "@/components/shared/navigation/dashboard-header";
import { EventScopeHeader } from "@/components/layout/event-scope-header";
import { SubEventOption } from "@/components/shared/navigation/event-switcher";
import { MobileBottomNav } from "@/components/shared/navigation/mobile-bottom-nav";

export default async function WeddingDashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
  });

  if (!wedding) {
    notFound();
  }

  const eventsData = await prisma.weddingEvent.findMany({
    where: { weddingId },
    select: { id: true, eventName: true, eventDate: true, eventSide: true },
    orderBy: { createdAt: "asc" },
  });

  const events: SubEventOption[] = (eventsData || []).map((e) => ({
    id: e.id,
    event_name: e.eventName,
    event_date: e.eventDate instanceof Date ? e.eventDate.toISOString().split("T")[0] : String(e.eventDate),
    event_side: (e.eventSide || "joint") as "groom" | "bride" | "joint",
  }));

  let allowedEventIds: string[] | null = null;
  const collaborator = await prisma.weddingCollaborator.findFirst({
    where: {
      weddingId,
      userId: user.userId,
    },
    select: { customPermissions: true },
  });

  if (collaborator && collaborator.customPermissions) {
    const perms = collaborator.customPermissions as any;
    if (Array.isArray(perms.allowed_event_ids)) {
      allowedEventIds = perms.allowed_event_ids;
    }
  }

  const branding = await getAppBranding();

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div className="flex-1 flex flex-col min-w-0">
        <Suspense fallback={<header className="h-14 border-b border-border bg-card" />}>
          <DashboardHeader
            weddingId={weddingId}
            groomName={wedding.groomName}
            brideName={wedding.brideName}
            userEmail={user.email || "user@nikahyu.my.id"}
            events={events}
          />
        </Suspense>
        {events.length > 0 && (
          <Suspense fallback={null}>
            <EventScopeHeader
              weddingId={weddingId}
              events={events}
              allowedEventIds={allowedEventIds}
            />
          </Suspense>
        )}
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-28">{props.children}</main>
        <MobileBottomNav weddingId={weddingId} />
      </div>
    </div>
  );

}

