import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/db/server";
import { getAppBranding } from "@/lib/branding";
import { AppSidebar } from "@/components/shared/navigation/app-sidebar";
import { DashboardHeader } from "@/components/shared/navigation/dashboard-header";
import { EventScopeHeader } from "@/components/layout/event-scope-header";
import { SubEventOption } from "@/components/shared/navigation/event-switcher";

export default async function WeddingDashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const db = await createClient();

  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wedding } = await db
    .from("weddings")
    .select("*")
    .eq("id", weddingId)
    .single();

  if (!wedding) {
    notFound();
  }

  const { data: eventsData } = await db
    .from("wedding_events")
    .select("id, event_name, event_date, event_side")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: true });

  const events: SubEventOption[] = (eventsData || []).map((e) => ({
    id: e.id,
    event_name: e.event_name,
    event_date: e.event_date,
    event_side: e.event_side as "groom" | "bride" | "joint",
  }));

  let allowedEventIds: string[] | null = null;
  const { data: collaborator } = await db
    .from("wedding_collaborators")
    .select("custom_permissions")
    .eq("wedding_id", weddingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (collaborator && collaborator.custom_permissions) {
    const perms = collaborator.custom_permissions as any;
    if (Array.isArray(perms.allowed_event_ids)) {
      allowedEventIds = perms.allowed_event_ids;
    }
  }

  const branding = await getAppBranding();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Suspense fallback={<div className="hidden lg:block w-64 border-r border-border bg-card h-full min-h-screen" />}>
        <div className="hidden lg:block w-64 shrink-0 h-full">
          <AppSidebar
            weddingId={weddingId}
            appName={branding.appName}
            tagline={branding.tagline}
            logoUrl={branding.logoUrl}
          />
        </div>
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Suspense fallback={<header className="h-14 border-b border-border bg-card" />}>
          <DashboardHeader
            weddingId={weddingId}
            groomName={wedding.groom_name}
            brideName={wedding.bride_name}
            userEmail={user.email || "user@nikahyuk.com"}
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{props.children}</main>
      </div>
    </div>
  );

}

