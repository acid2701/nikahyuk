import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, ShieldCheck, Download, HardDriveDownload, Lock } from "lucide-react";

export default async function AdminBackupsPage() {
  const supabase = await createClient();

  const { count: weddingsCount } = await supabase
    .from("weddings")
    .select("*", { count: "exact", head: true });

  const { count: eventsCount } = await supabase
    .from("wedding_events")
    .select("*", { count: "exact", head: true });

  const { count: guestsCount } = await supabase
    .from("guests")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" />
          Encrypted Database Backups & Export Engine
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola cadangan database terenkripsi (AES-256) & snapshot data platform secara otomatis.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Workspace Terdaftar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{weddingsCount || 0} Workspace</div>
            <p className="text-[11px] text-muted-foreground mt-1">Siap dicadangkan</p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Sub-Event Terdata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{eventsCount || 0} Event</div>
            <p className="text-[11px] text-muted-foreground mt-1">Struktur jadwal & denah</p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Rekaman Tamu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600">{guestsCount || 0} Entri</div>
            <p className="text-[11px] text-muted-foreground mt-1">Master guest pool</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            Status Keamanan Cadangan (Encryption Status)
          </CardTitle>
          <CardDescription className="text-xs">
            Seluruh berkas cadangan dienkripsi menggunakan standar industri AES-256 sebelum disimpan ke Cloudflare R2 Storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Lock className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="font-semibold text-sm text-foreground">Enkripsi Otomatis Aktif (AES-256)</p>
                <p className="text-xs text-muted-foreground">Cadangan otomatis berjalan setiap 24 jam pada pukul 02:00 WIB.</p>
              </div>
            </div>
            <Badge variant="success" className="font-mono text-xs">
              SISTEM AMAN
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg border border-border bg-card gap-4">
            <div className="space-y-1">
              <p className="font-semibold text-sm text-foreground flex items-center gap-2">
                <HardDriveDownload className="h-4 w-4 text-primary" />
                Snapshot Data SQL Manual
              </p>
              <p className="text-xs text-muted-foreground">
                Unduh snapshot cadangan database instan dalam format JSON terenkripsi.
              </p>
            </div>
            <Button size="sm" className="gap-2 shrink-0">
              <Download className="h-4 w-4" />
              Unduh Snapshot SQL Baru
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
