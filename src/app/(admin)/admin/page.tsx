import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Database, HardDrive, Calendar, ShieldCheck } from "lucide-react";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const { count: weddingsCount } = await supabase
    .from("weddings")
    .select("*", { count: "exact", head: true });

  const { count: eventsCount } = await supabase
    .from("wedding_events")
    .select("*", { count: "exact", head: true });

  const { count: docsCount } = await supabase
    .from("vendor_documents")
    .select("*", { count: "exact", head: true });

  const { data: settings } = await supabase
    .from("system_settings")
    .select("key, value")
    .eq("key", "r2_credentials")
    .maybeSingle();

  const isR2Configured = Boolean(settings && settings.value);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Superadmin Platform Control Plane
        </h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan kesehatan infrastruktur, statistik ruang kerja SaaS, dan status Cloudflare R2.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Workspace Pernikahan
            </CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{weddingsCount || 0}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Pasangan terdaftar di platform
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Sub-Event Aktif
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{eventsCount || 0}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Akad, Resepsi, Lamaran, dll.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Berkas Media & Dokumen
            </CardTitle>
            <HardDrive className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{docsCount || 0} File</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Tersimpan di Cloudflare R2
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Status Storage S3 R2
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge
                variant={isR2Configured ? "success" : "destructive"}
                className="text-xs"
              >
                {isR2Configured ? "TERHUBUNG (HEALTHY)" : "BELUM DISETTING"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Dynamic Config Engine Active
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Modul Infrastruktur & Media</CardTitle>
            <CardDescription>
              Kelola kredensial S3 Cloudflare R2 dan aturan upload secara dinamis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded bg-accent/30 border border-border">
              <div>
                <p className="text-sm font-semibold">Konfigurasi R2 Storage</p>
                <p className="text-xs text-muted-foreground">Atur Account ID, Secret Key, & CDN Domain</p>
              </div>
              <Button asChild size="sm">
                <Link href="/admin/storage-config">Buka Pengaturan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Modul Keamanan & Hak Akses</CardTitle>
            <CardDescription>
              Atur template izin default global untuk WO dan Panitia Keluarga.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded bg-accent/30 border border-border">
              <div>
                <p className="text-sm font-semibold">Template RBAC Global</p>
                <p className="text-xs text-muted-foreground">Master matriks izin bawaan WO / Panitia</p>
              </div>
              <Button asChild size="sm" variant="secondary">
                <Link href="/admin/rbac-templates">Kelola Template</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
