import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/shared/navigation/app-sidebar";
import { DashboardHeader } from "@/components/shared/navigation/dashboard-header";
import { SubEventOption } from "@/components/shared/navigation/event-switcher";

export default async function WeddingDashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .eq("id", weddingId)
    .single();

  if (!wedding) {
    notFound();
  }

  const { data: eventsData } = await supabase
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Suspense fallback={<div className="w-64 border-r border-border bg-card h-full min-h-screen" />}>
        <AppSidebar weddingId={weddingId} />
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
        <main className="flex-1 overflow-y-auto p-6">{props.children}</main>
      </div>
    </div>
  );
}
