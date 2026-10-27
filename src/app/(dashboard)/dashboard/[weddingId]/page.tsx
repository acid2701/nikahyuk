import { createClient } from "@/lib/db/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock, DollarSign, Users, Briefcase, Heart, CheckSquare, CalendarCheck, MapPin, Gift, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function WeddingOverviewPage(props: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const searchParams = (await props.searchParams) || {};
  const urlEventId = searchParams.eventId as string | undefined;

  const supabase = await createClient();

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .eq("id", weddingId)
    .single();

  const { data: eventsData } = await supabase
    .from("wedding_events")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: true });

  const events = eventsData || [];
  const activeEvent = events.find((e) => e.id === urlEventId) || events[0];

  let daysUntilWedding: number | null = null;
  if (activeEvent?.event_date) {
    const targetDate = new Date(activeEvent.event_date);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    daysUntilWedding = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const { data: budgetItems } = activeEvent
    ? await supabase
        .from("budget_items")
        .select("estimated_cost, payment_milestones(amount, payment_status)")
        .eq("event_id", activeEvent.id)
    : { data: [] };

  let totalBudgetEst = 0;
  let totalBudgetPaid = 0;

  (budgetItems || []).forEach((item: any) => {
    totalBudgetEst += Number(item.estimated_cost || 0);
    const milestones = item.payment_milestones || [];
    milestones.forEach((m: any) => {
      if (m.payment_status === "paid") {
        totalBudgetPaid += Number(m.amount || 0);
      }
    });
  });

  const { data: guestsData } = await supabase
    .from("guests")
    .select("*, event_guest_assignments(*)")
    .eq("wedding_id", weddingId);

  const guests = guestsData || [];
  let confirmedPax = 0;
  let pendingPax = 0;

  guests.forEach((g: any) => {
    const assignment = (g.event_guest_assignments || []).find((a: any) => a.event_id === activeEvent?.id);
    if (assignment?.attendance_status === "attending" || assignment?.attendance_status === "checked_in") {
      confirmedPax += assignment.actual_pax || g.default_pax || 1;
    } else {
      pendingPax += g.default_pax || 1;
    }
  });

  const { data: nextRundowns } = activeEvent
    ? await supabase
        .from("rundowns")
        .select("*")
        .eq("event_id", activeEvent.id)
        .order("sort_order", { ascending: true })
        .limit(3)
    : { data: [] };

  const { count: vendorsCount } = await supabase
    .from("vendors")
    .select("*", { count: "exact", head: true })
    .eq("wedding_id", weddingId);

  const { data: giftsData } = activeEvent
    ? await supabase
        .from("gifts_log")
        .select("amount, gift_type")
        .eq("event_id", activeEvent.id)
    : { data: [] };

  let totalGiftsCash = 0;
  let totalGiftsItems = 0;
  (giftsData || []).forEach((g: any) => {
    if (g.gift_type === "cash") totalGiftsCash += g.amount || 0;
    else totalGiftsItems++;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-border/80 bg-card/60 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-primary fill-primary/20" />
            <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">
              {wedding?.groom_name || "Pengantin Pria"} & {wedding?.bride_name || "Pengantin Wanita"}
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Workspace Pernikahan • Acara Aktif:{" "}
            <span className="font-semibold text-foreground">{activeEvent?.event_name || "Belum Ada Sub-Event"}</span>{" "}
            ({activeEvent?.event_date ? activeEvent.event_date : "Tanggal Belum Ditentukan"})
          </p>
        </div>

        <div className="bg-card/90 backdrop-blur border border-border px-4 py-2.5 rounded-lg text-center shrink-0">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            H-Day Countdown
          </span>
          {daysUntilWedding !== null ? (
            <span className="font-serif text-xl font-black text-primary">
              {daysUntilWedding > 0
                ? `H-${daysUntilWedding} Hari`
                : daysUntilWedding === 0
                ? "Hari H Acara! 🎉"
                : `Lewat ${Math.abs(daysUntilWedding)} Hari`}
            </span>
          ) : (
            <div className="space-y-1 mt-0.5">
              <span className="text-xs font-semibold text-muted-foreground italic block">
                Tanggal Belum Ditentukan
              </span>
              <Button asChild size="sm" variant="ghost" className="h-6 text-[10px] text-primary px-2">
                <Link href={`/dashboard/${weddingId}/events`}>Set Tanggal →</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Sub-Events Pernikahan
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{events.length} Sub-Event</div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              Aktif: {activeEvent?.event_name || "None"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              RSVP Guest Summary
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600">
              {confirmedPax} Pax Hadir
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Pending: {pendingPax} Pax ({guests.length} Entri Tamu)
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Progres Pembayaran Anggaran
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono text-foreground">
              Rp {totalBudgetPaid.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Dari target Rp {totalBudgetEst.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Vendor Terhubung
            </CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{vendorsCount || 0} Vendor</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Mitra & Kontrak Terkait
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sub-Events List Overview Widget */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-serif font-bold">
                Rangkaian Sub-Events Pernikahan ({events.length})
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Kelola jadwal, lokasi Google Maps, dan penanggung jawab per acara.
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline" className="text-xs gap-1">
              <Link href={`/dashboard/${weddingId}/events`}>
                <CalendarCheck className="h-3.5 w-3.5 text-primary" /> Kelola Sub-Event
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="p-6 text-center border border-dashed rounded-lg space-y-2">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground">
                Belum ada sub-event. Klik &apos;Kelola Sub-Event&apos; untuk menambah Lamaran, Akad, atau Resepsi.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {events.map((ev) => {
                const isCurrentActive = ev.id === activeEvent?.id;
                return (
                  <div
                    key={ev.id}
                    className={`p-3 rounded-lg border flex flex-col justify-between space-y-2 transition-all ${
                      isCurrentActive
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground">{ev.event_name}</span>
                        <Badge variant={isCurrentActive ? "default" : "outline"} className="text-[9px] uppercase px-1.5 py-0">
                          {ev.event_side}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-primary" />
                        {ev.event_date ? ev.event_date : "Tanggal TBD"}
                      </p>
                      {ev.location_name && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate">{ev.location_name}</span>
                        </p>
                      )}
                    </div>

                    <Button asChild variant="ghost" size="sm" className="h-7 text-[11px] w-full justify-between mt-2">
                      <Link href={`/dashboard/${weddingId}?eventId=${ev.id}`}>
                        <span>{isCurrentActive ? "✓ Sedang Dipilih" : "Pilih Konteks Ini"}</span>
                        <span>→</span>
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agenda & Quick Access Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-serif font-bold">
                Agenda Rundown Berikutnya ({activeEvent?.event_name || "Semua Acara"})
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-primary">
                <Link href={`/dashboard/${weddingId}/rundown`}>Lihat Semua →</Link>
              </Button>
            </div>
            <CardDescription className="text-xs">
              Susunan acara paling awal yang terdaftar untuk {activeEvent?.event_name || "Acara Aktif"}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {nextRundowns && nextRundowns.length > 0 ? (
              nextRundowns.map((r: any) => (
                <div
                  key={r.id}
                  className="p-3 rounded-lg border border-border bg-accent/20 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">{r.activity_title}</p>
                    <p className="text-[11px] text-muted-foreground">PIC: {r.pic_name || "-"}</p>
                  </div>
                  <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                    {r.time_start} - {r.time_end}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center border border-dashed rounded-lg space-y-2">
                <Clock className="h-6 w-6 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">
                  Belum ada rundown untuk acara ini. Klik modul Live Rundown untuk mengisi.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Access Modul Grid */}
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif font-bold">Pintas Akses Cepat Modul</CardTitle>
            <CardDescription className="text-xs">
              Akses instan ke seluruh fitur perencanaan acara pernikahan Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline" className="justify-start h-12">
              <Link href={`/dashboard/${weddingId}/checklists`}>
                <CheckSquare className="h-4 w-4 mr-2 text-blue-600" />
                <div className="text-left">
                  <p className="font-semibold text-xs">Checklist Persiapan</p>
                  <p className="text-[10px] text-muted-foreground font-normal">KUA, Seserahan, Lamaran</p>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="justify-start h-12">
              <Link href={`/dashboard/${weddingId}/rundown`}>
                <Clock className="h-4 w-4 mr-2 text-primary" />
                <div className="text-left">
                  <p className="font-semibold text-xs">Live Rundown</p>
                  <p className="text-[10px] text-muted-foreground font-normal">Timeline & Cues</p>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="justify-start h-12">
              <Link href={`/dashboard/${weddingId}/budget`}>
                <DollarSign className="h-4 w-4 mr-2 text-emerald-600" />
                <div className="text-left">
                  <p className="font-semibold text-xs">Anggaran & Finansial</p>
                  <p className="text-[10px] text-muted-foreground font-normal">Payer & Proofs</p>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="justify-start h-12">
              <Link href={`/dashboard/${weddingId}/guests`}>
                <Users className="h-4 w-4 mr-2 text-amber-600" />
                <div className="text-left">
                  <p className="font-semibold text-xs">Master Guest Pool</p>
                  <p className="text-[10px] text-muted-foreground font-normal">RSVP & WA Blast</p>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="justify-start h-12">
              <Link href={`/dashboard/${weddingId}/gifts`}>
                <Gift className="h-4 w-4 mr-2 text-amber-600" />
                <div className="text-left">
                  <p className="font-semibold text-xs">Log Kado & Angpao</p>
                  <p className="text-[10px] text-muted-foreground font-normal">Pria / Wanita Side</p>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="justify-start h-12">
              <Link href={`/dashboard/${weddingId}/share`}>
                <Share2 className="h-4 w-4 mr-2 text-sky-600" />
                <div className="text-left">
                  <p className="font-semibold text-xs">Berbagi Link (Share)</p>
                  <p className="text-[10px] text-muted-foreground font-normal">PWA Kru Lapangan</p>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
