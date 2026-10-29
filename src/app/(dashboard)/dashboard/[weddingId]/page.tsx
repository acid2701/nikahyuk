import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  CheckSquare,
  CalendarCheck,
  MapPin,
  Share2,
  Sparkles,
} from "lucide-react";
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

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
  });

  const rawEvents = await prisma.weddingEvent.findMany({
    where: { weddingId },
    orderBy: { createdAt: "asc" },
  });

  const events = rawEvents.map((e) => ({
    id: e.id,
    event_name: e.eventName,
    event_side: e.eventSide,
    event_type: e.eventSide,
    event_date: e.eventDate,
    start_time: e.timeStart,
    end_time: e.timeEnd,
    venue_name: e.locationName,
    location_name: e.locationName,
    venue_address: e.locationMapsUrl,
  }));

  const activeEvent = events.find((e) => e.id === urlEventId) || events[0];

  let daysUntilWedding: number | null = null;
  if (activeEvent?.event_date) {
    const targetDate = new Date(activeEvent.event_date);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    daysUntilWedding = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const formatSafeDate = (d: any, fallback: string = "Belum Ditentukan") => {
    if (!d) return fallback;
    if (d instanceof Date) return d.toLocaleDateString("id-ID", { dateStyle: "medium" });
    const str = String(d).split("T")[0];
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? str : parsed.toLocaleDateString("id-ID", { dateStyle: "medium" });
  };

  const budgetItems = activeEvent
    ? await prisma.budgetItem.findMany({
        where: { eventId: activeEvent.id },
        include: { milestones: true },
      })
    : [];

  let totalBudgetEst = 0;
  let totalBudgetPaid = 0;

  budgetItems.forEach((item) => {
    totalBudgetEst += Number(item.estimatedCost || 0);
    (item.milestones || []).forEach((m) => {
      if (m.paymentStatus === "paid") {
        totalBudgetPaid += Number(m.amount || 0);
      }
    });
  });

  const budgetPercentage =
    totalBudgetEst > 0 ? Math.min(100, Math.round((totalBudgetPaid / totalBudgetEst) * 100)) : 0;

  const rawGuests = await prisma.guest.findMany({
    where: { weddingId },
    include: { assignments: true },
  });

  let confirmedPax = 0;
  let pendingPax = 0;
  let totalPax = 0;

  rawGuests.forEach((g) => {
    const pax = g.defaultPax || 1;
    totalPax += pax;
    const assignment = (g.assignments || []).find((a) => a.eventId === activeEvent?.id);
    if (assignment?.attendanceStatus === "attending" || assignment?.attendanceStatus === "checked_in") {
      confirmedPax += assignment.actualPax || pax;
    } else {
      pendingPax += pax;
    }
  });

  const rsvpPercentage = totalPax > 0 ? Math.min(100, Math.round((confirmedPax / totalPax) * 100)) : 0;

  const rawNextRundowns = activeEvent
    ? await prisma.rundown.findMany({
        where: { eventId: activeEvent.id },
        orderBy: { sortOrder: "asc" },
        take: 3,
      })
    : [];

  const nextRundowns = rawNextRundowns.map((r) => ({
    id: r.id,
    start_time: r.timeStart,
    end_time: r.timeEnd,
    activity_name: r.activityTitle,
    location_zone: r.location,
    person_in_charge: r.picName,
  }));

  const vendorsCount = await prisma.vendor.count({
    where: { weddingId },
  });

  const totalChecklists = await prisma.weddingChecklist.count({
    where: { weddingId },
  });
  const completedChecklists = await prisma.weddingChecklist.count({
    where: { weddingId, isCompleted: true },
  });
  const checklistPercentage =
    totalChecklists > 0 ? Math.round((completedChecklists / totalChecklists) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* 1. WARM HERO HEADER (AIRBNB LUXE STANDARD) */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#ff385c]/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff385c]/10 text-[#ff385c] text-[11px] font-bold tracking-tight">
              <Sparkles className="h-3 w-3" />
              <span>Workspace Pasangan Bahagia</span>
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {wedding?.groomName || "Pengantin Pria"} & {wedding?.brideName || "Pengantin Wanita"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Fokus Acara:{" "}
              <span className="font-semibold text-foreground">
                {activeEvent?.event_name || "Belum Ada Sub-Event"}
              </span>{" "}
              • {formatSafeDate(activeEvent?.event_date, "Tanggal Belum Ditentukan")}
              {activeEvent?.location_name ? ` di ${activeEvent.location_name}` : ""}
            </p>
          </div>

          {/* Countdown Pill Badge */}
          <div className="flex flex-col items-start md:items-end shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-muted/40 border border-border/80 text-left md:text-right shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Menuju Hari Bahagia
              </span>
              {daysUntilWedding !== null ? (
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-sans text-2xl sm:text-3xl font-extrabold text-[#ff385c]">
                    {daysUntilWedding > 0 ? `H-${daysUntilWedding}` : daysUntilWedding === 0 ? "HARI H!" : `+${Math.abs(daysUntilWedding)}`}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {daysUntilWedding > 0 ? "Hari Lagi" : daysUntilWedding === 0 ? "Acara Berlangsung 🎉" : "Hari Terlewat"}
                  </span>
                </div>
              ) : (
                <div className="mt-1">
                  <Link
                    href={`/dashboard/${weddingId}/events`}
                    className="text-xs font-semibold text-[#ff385c] hover:underline"
                  >
                    Atur Tanggal Acara →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Pill Bar */}
        <div className="mt-6 pt-5 border-t border-border/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Button
            asChild
            size="sm"
            className="rounded-full h-8 px-3.5 text-xs font-semibold bg-[#ff385c] hover:bg-[#e00b41] text-white shadow-xs shrink-0"
          >
            <Link href={`/dashboard/${weddingId}/guests`}>
              + Tambah Tamu
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full h-8 px-3.5 text-xs font-medium border-border/80 hover:bg-muted shrink-0"
          >
            <Link href={`/dashboard/${weddingId}/budget`}>
              + Catat Pembayaran
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full h-8 px-3.5 text-xs font-medium border-border/80 hover:bg-muted shrink-0"
          >
            <Link href={`/dashboard/${weddingId}/rundown`}>
              + Buat Agenda Rundown
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-full h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground shrink-0 ml-auto"
          >
            <Link href={`/dashboard/${weddingId}/share`}>
              <Share2 className="h-3.5 w-3.5 mr-1.5 text-sky-500" />
              Bagikan Link Kru Lapangan
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. ELEVATED KPI CARDS DENGAN VISUAL PROGRESS BAR */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: RSVP TAMU */}
        <Card className="rounded-3xl border border-border/80 bg-card p-5 hover:border-emerald-500/40 hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Konfirmasi Tamu & RSVP</span>
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {confirmedPax} <span className="text-xs font-sans font-medium text-muted-foreground">Pax Hadir</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {pendingPax} Pax Menunggu Konfirmasi ({rawGuests.length} Undangan)
              </p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold mb-1">
              <span>Kehadiran Terkonfirmasi</span>
              <span>{rsvpPercentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${rsvpPercentage}%` }}
              />
            </div>
          </div>
        </Card>

        {/* KPI 2: PROGRES ANGGARAN */}
        <Card className="rounded-3xl border border-border/80 bg-card p-5 hover:border-[#ff385c]/40 hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Realisasi Anggaran</span>
              <div className="h-8 w-8 rounded-full bg-[#ff385c]/10 text-[#ff385c] flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-foreground truncate">
                Rp {totalBudgetPaid.toLocaleString("id-ID")}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                Target: Rp {totalBudgetEst.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold mb-1">
              <span>Dana Terbayar</span>
              <span className="text-[#ff385c]">{budgetPercentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ff385c] rounded-full transition-all"
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </div>
        </Card>

        {/* KPI 3: KESIAPAN CHECKLIST */}
        <Card className="rounded-3xl border border-border/80 bg-card p-5 hover:border-blue-500/40 hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Kesiapan Dokumen & Acara</span>
              <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <CheckSquare className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-foreground">
                {completedChecklists} / {totalChecklists}{" "}
                <span className="text-xs font-sans font-medium text-muted-foreground">Tugas Selesai</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                KUA, Seserahan, Fitting, & Busana
              </p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold mb-1">
              <span>Progres Checklist</span>
              <span>{checklistPercentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${checklistPercentage}%` }}
              />
            </div>
          </div>
        </Card>

        {/* KPI 4: MITRA VENDOR */}
        <Card className="rounded-3xl border border-border/80 bg-card p-5 hover:border-purple-500/40 hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Mitra Vendor Terhubung</span>
              <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-foreground">
                {vendorsCount} <span className="text-xs font-sans font-medium text-muted-foreground">Vendor</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Katering, MUA, Dokumentasi, & Dekor
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Status Kerjasama</span>
            <Link
              href={`/dashboard/${weddingId}/vendors`}
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Lihat Vendor →
            </Link>
          </div>
        </Card>
      </div>

      {/* 3. SUB-EVENTS ITINERARY CARDS (AIRBNB CARD STANDARD) */}
      <Card className="rounded-3xl border border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="p-5 sm:p-6 pb-4 border-b border-border/60 bg-muted/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="font-sans text-lg font-bold text-foreground">
                Rangkaian Acara Pernikahan ({events.length})
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Pilih konteks acara untuk menyaring susunan rundown, penataan meja, dan catatan kado.
              </CardDescription>
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-full text-xs font-medium border-border/80 hover:bg-muted self-start sm:self-auto"
            >
              <Link href={`/dashboard/${weddingId}/events`}>
                <CalendarCheck className="h-3.5 w-3.5 mr-1.5 text-primary" /> Kelola Rangkaian Acara
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          {events.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-border/80 rounded-2xl space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                <Calendar className="h-6 w-6" />
              </div>
              <p className="text-xs font-medium text-muted-foreground max-w-sm mx-auto">
                Belum ada sub-acara. Buat agenda pertama seperti Lamaran, Akad Nikah, atau Resepsi untuk mulai menyusun rundown.
              </p>
              <Button asChild size="sm" className="rounded-full bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-semibold">
                <Link href={`/dashboard/${weddingId}/events`}>
                  + Tambah Acara Pertama
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {events.map((ev) => {
                const isCurrentActive = ev.id === activeEvent?.id;
                return (
                  <div
                    key={ev.id}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                      isCurrentActive
                        ? "border-[#ff385c] bg-[#ff385c]/5 shadow-xs"
                        : "border-border/80 bg-card hover:border-border"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">{ev.event_name}</span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase font-bold rounded-full px-2 py-0.5 bg-muted text-muted-foreground"
                        >
                          {ev.event_side === "joint" ? "Bersama" : ev.event_side === "groom" ? "Pria" : "Wanita"}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{formatSafeDate(ev.event_date, "Tanggal Belum Ditentukan")}</span>
                        </p>
                        {ev.start_time && (
                          <p className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{ev.start_time} - {ev.end_time || "Selesai"}</span>
                          </p>
                        )}
                        {ev.location_name && (
                          <p className="flex items-center gap-1.5 truncate">
                            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="truncate">{ev.location_name}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      asChild
                      variant={isCurrentActive ? "default" : "outline"}
                      size="sm"
                      className={`h-8 rounded-full text-xs font-semibold w-full justify-between transition-all ${
                        isCurrentActive
                          ? "bg-[#ff385c] hover:bg-[#e00b41] text-white shadow-xs"
                          : "border-border/80 hover:bg-muted"
                      }`}
                    >
                      <Link href={`/dashboard/${weddingId}?eventId=${ev.id}`}>
                        <span>{isCurrentActive ? "✓ Sedang Dipilih" : "Buka Acara Ini"}</span>
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

      {/* 4. AGENDA RUNDOWN & AKSES MODUL */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* AGENDA BERIKUTNYA */}
        <Card className="rounded-3xl border border-border/80 shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="p-5 sm:p-6 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-sans text-base font-bold text-foreground">
                  Susunan Rundown Acara
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="rounded-full h-7 text-xs text-primary font-semibold">
                  <Link href={`/dashboard/${weddingId}/rundown`}>Lihat Semua →</Link>
                </Button>
              </div>
              <CardDescription className="text-xs">
                Susunan kegiatan awal untuk {activeEvent?.event_name || "Acara Terpilih"}.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-0 space-y-2.5">
              {nextRundowns && nextRundowns.length > 0 ? (
                nextRundowns.map((r: any) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-2xl border border-border/80 bg-muted/20 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground">{r.activity_name}</p>
                      <p className="text-[11px] text-muted-foreground">PIC: {r.person_in_charge || "Koordinator Acara"}</p>
                    </div>
                    <span className="font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full text-[11px]">
                      {r.start_time} - {r.end_time || "Selesai"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-border/70 rounded-2xl space-y-2">
                  <Clock className="h-6 w-6 text-muted-foreground mx-auto" />
                  <p className="text-xs text-muted-foreground">
                    Belum ada agenda rundown terdaftar.
                  </p>
                </div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* NAVIGASI CEPAT MODUL */}
        <Card className="rounded-3xl border border-border/80 shadow-xs flex flex-col justify-between">
          <CardHeader className="p-5 sm:p-6 pb-3">
            <CardTitle className="font-sans text-base font-bold text-foreground">
              Akses Cepat Modul Acara
            </CardTitle>
            <CardDescription className="text-xs">
              Lompat langsung ke modul kerja persiapan hari bahagia Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 pt-0 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/dashboard/${weddingId}/guests`}
              className="p-3.5 rounded-2xl border border-border/80 bg-card hover:bg-muted/40 transition-all flex items-center gap-3 group"
            >
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  Buku Tamu & RSVP
                </p>
                <p className="text-[10px] text-muted-foreground truncate">Daftar Tamu & Kirim WA</p>
              </div>
            </Link>

            <Link
              href={`/dashboard/${weddingId}/budget`}
              className="p-3.5 rounded-2xl border border-border/80 bg-card hover:bg-muted/40 transition-all flex items-center gap-3 group"
            >
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  Rencana Anggaran
                </p>
                <p className="text-[10px] text-muted-foreground truncate">Pos Biaya & Kuitansi</p>
              </div>
            </Link>

            <Link
              href={`/dashboard/${weddingId}/checklists`}
              className="p-3.5 rounded-2xl border border-border/80 bg-card hover:bg-muted/40 transition-all flex items-center gap-3 group"
            >
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <CheckSquare className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  Checklist Persiapan
                </p>
                <p className="text-[10px] text-muted-foreground truncate">KUA & Perlengkapan</p>
              </div>
            </Link>

            <Link
              href={`/dashboard/${weddingId}/vendors`}
              className="p-3.5 rounded-2xl border border-border/80 bg-card hover:bg-muted/40 transition-all flex items-center gap-3 group"
            >
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                <Briefcase className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  Mitra Vendor
                </p>
                <p className="text-[10px] text-muted-foreground truncate">Kontrak & Kontak PIC</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
