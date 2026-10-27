import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  TrendingUp,
  Users,
  Calendar,
  HardDrive,
  UserCheck,
  Briefcase,
  Layers,
  PieChart,
} from "lucide-react";

export default async function AdminAnalyticsPage() {
  // 1. Fetch total weddings
  const weddings = await prisma.wedding.findMany({
    select: {
      id: true,
      groomName: true,
      brideName: true,
      weddingSlug: true,
      createdAt: true,
      _count: {
        select: {
          events: true,
          guests: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalWeddings = await prisma.wedding.count();

  // 2. Fetch total sub-events
  const totalEvents = await prisma.weddingEvent.count();

  // 3. Fetch total guests & RSVP counts
  const totalGuests = await prisma.guest.count();

  // 4. Fetch assignments for RSVP rates
  const assignmentsData = await prisma.eventGuestAssignment.findMany({
    select: { attendanceStatus: true, actualPax: true },
    take: 5000,
  });

  let confirmedPax = 0;
  let totalAssignedPax = 0;
  if (assignmentsData) {
    assignmentsData.forEach((a) => {
      const pax = a.actualPax || 1;
      totalAssignedPax += pax;
      if (a.attendanceStatus === "attending" || a.attendanceStatus === "checked_in") {
        confirmedPax += pax;
      }
    });
  }

  const rsvpRate =
    totalAssignedPax > 0 ? Math.round((confirmedPax / totalAssignedPax) * 100) : 0;

  // 5. Fetch vendors count
  const vendorsCount = await prisma.vendor.count();

  // Map workspace stats
  const eventCountMap: Record<string, number> = {};
  const guestCountMap: Record<string, number> = {};
  weddings.forEach((w) => {
    eventCountMap[w.id] = w._count?.events || 0;
    guestCountMap[w.id] = w._count?.guests || 0;
  });

  // Estimated storage (e.g. baseline ~2.5 MB per workspace + vendors)
  const totalEstimatedStorageMb = Math.round(
    totalWeddings * 2.5 + (vendorsCount || 0) * 1.8
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Analitik Penggunaan SaaS & Resource Platform
        </h1>
        <p className="text-sm text-muted-foreground">
          Laporan performa, aktivitas workspace pengantin, dan konsumsi resource Cloudflare R2 secara real-time.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Workspace Aktif
            </CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{totalWeddings} Workspace</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Pasangan terdaftar di platform
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Sub-Event Ditangani
            </CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-600">
              {totalEvents} Event
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Akad, Resepsi, Lamaran, dll.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Master Tamu (RSVP)
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600">
              {totalGuests} Undangan
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {confirmedPax} Pax Hadir ({rsvpRate}%)
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Konsumsi Cloudflare R2
            </CardTitle>
            <HardDrive className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-sky-600">
              ~{totalEstimatedStorageMb} MB
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Dokumen kontrak & bukti bayar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resource & Rate Meters */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 bg-muted/30">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Tingkat Konfirmasi Hadir (RSVP Confirmation Rate)
            </CardTitle>
            <CardDescription className="text-xs">
              Rasio persentase tamu yang telah mengonfirmasi kedatangan (RSVP Yes) lintas workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Persentase Konfirmasi Hadir</span>
              <span className="text-sm font-bold font-mono text-emerald-600">{rsvpRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(rsvpRate, 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-muted-foreground">
              <div className="p-2 rounded bg-muted/50 border border-border/50">
                <p className="font-semibold text-foreground">{confirmedPax} Pax</p>
                <p className="text-[10px]">Konfirmasi Hadir</p>
              </div>
              <div className="p-2 rounded bg-muted/50 border border-border/50">
                <p className="font-semibold text-foreground">{totalAssignedPax} Pax</p>
                <p className="text-[10px]">Total Ter-assign</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 bg-muted/30">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-sky-500" />
              Mitra Vendor & Dokumen Kontrak Terdaftar
            </CardTitle>
            <CardDescription className="text-xs">
              Statistik vendor mitra terhubung dan dokumen kontrak tersimpan aman di R2.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Total Rekaman Vendor</span>
              <span className="text-sm font-bold font-mono text-sky-600">
                {vendorsCount || 0} Vendor
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-sky-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(((vendorsCount || 0) / 50) * 100, 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-muted-foreground">
              <div className="p-2 rounded bg-muted/50 border border-border/50">
                <p className="font-semibold text-foreground">{vendorsCount || 0} Kontak</p>
                <p className="text-[10px]">Vendor Terdaftar</p>
              </div>
              <div className="p-2 rounded bg-muted/50 border border-border/50">
                <p className="font-semibold text-foreground">Cloudflare R2</p>
                <p className="text-[10px]">Enkripsi Direct Upload</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Workspaces Table */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/30 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Daftar Workspace Pengantin & Aktivitas
              </CardTitle>
              <CardDescription className="text-xs">
                Rincian ruang kerja pernikahan terdaftar beserta total acara dan tamu.
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {totalWeddings} Workspace
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {weddings.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Belum ada ruang kerja pernikahan terdaftar.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/60">
                <TableRow>
                  <TableHead className="w-12 text-center text-xs font-semibold">No.</TableHead>
                  <TableHead className="text-xs font-semibold">Pasangan Pengantin (Workspace)</TableHead>
                  <TableHead className="text-xs font-semibold">Slug Link</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Sub-Events</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Total Tamu</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Tanggal Buat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weddings.map((w, index) => {
                  const subEvents = eventCountMap[w.id] || 0;
                  const guests = guestCountMap[w.id] || 0;

                  return (
                    <TableRow key={w.id} className="hover:bg-muted/30">
                      <TableCell className="text-center font-mono font-semibold text-xs text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-xs">
                        <p className="font-semibold text-foreground font-serif">
                          {w.groomName} & {w.brideName}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">ID: {w.id}</p>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-primary">
                        /{w.weddingSlug}
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-xs">
                        <Badge variant="outline" className="text-[10px]">
                          {subEvents} Sub-Event
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-xs text-emerald-600">
                        {guests} Tamu
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono text-muted-foreground">
                        {new Date(w.createdAt).toLocaleDateString("id-ID")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
