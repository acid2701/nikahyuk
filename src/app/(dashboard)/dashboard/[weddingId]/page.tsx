import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, DollarSign, Users, Briefcase } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function WeddingOverviewPage(props: {
  params: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const supabase = await createClient();

  const { count: eventsCount } = await supabase
    .from("wedding_events")
    .select("*", { count: "exact", head: true })
    .eq("wedding_id", weddingId);

  const { count: guestsCount } = await supabase
    .from("guests")
    .select("*", { count: "exact", head: true })
    .eq("wedding_id", weddingId);

  const { count: vendorsCount } = await supabase
    .from("vendors")
    .select("*", { count: "exact", head: true })
    .eq("wedding_id", weddingId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Ringkasan Workspace
        </h1>
        <p className="text-sm text-muted-foreground">
          Selamat datang di dasbor utama perencanaan acara pernikahan Anda.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sub-Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsCount || 0} Acara</div>
            <p className="text-xs text-muted-foreground mt-1">
              Akad, Resepsi, dll.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tamu Mandiri
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guestsCount || 0} Tamu</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dalam Master Guest Pool
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vendor Terhubung
            </CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorsCount || 0} Vendor</div>
            <p className="text-xs text-muted-foreground mt-1">
              Mitra layanan acara
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Anggaran & Finansial
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Aktif</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pemisahan Groom / Bride
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Akses Cepat Modul</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href={`/dashboard/${weddingId}/rundown`}>
                <Clock className="h-4 w-4 mr-2 text-primary" />
                Live Rundown
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href={`/dashboard/${weddingId}/budget`}>
                <DollarSign className="h-4 w-4 mr-2 text-primary" />
                Anggaran & Termin
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href={`/dashboard/${weddingId}/guests`}>
                <Users className="h-4 w-4 mr-2 text-primary" />
                Daftar Tamu & Meja
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href={`/dashboard/${weddingId}/vendors`}>
                <Briefcase className="h-4 w-4 mr-2 text-primary" />
                Vendor Directory
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Status Keamanan & Token</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-3 rounded bg-accent/40 border border-border flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Tautan Publik Panitia (/view)</p>
                <p className="text-xs text-muted-foreground">PIN Security Active</p>
              </div>
              <Button asChild size="sm" variant="secondary">
                <Link href={`/dashboard/${weddingId}/settings/collaborators`}>Kelola Akses</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
