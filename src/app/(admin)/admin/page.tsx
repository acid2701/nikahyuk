import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Database, HardDrive, Calendar, ShieldCheck, Settings, Key, Building2, Clock } from "lucide-react";
import { HealthMonitorCard } from "@/components/admin/health-monitor-card";

export default async function AdminOverviewPage() {
  const weddingsCount = await prisma.wedding.count();
  const eventsCount = await prisma.weddingEvent.count();
  const docsCount = await prisma.vendorDocument.count();

  let pendingVendorsCount = 0;
  try {
    pendingVendorsCount = await prisma.vendorPartner.count({
      where: { status: "pending" },
    });
  } catch (err) {
    console.warn("vendor_partners pending count notice:", err);
  }

  const settings = await prisma.systemSetting.findMany({
    where: {
      key: { in: ["r2_credentials", "auth_provider_config"] },
    },
  });

  const r2Row = settings?.find((r) => r.key === "r2_credentials");
  const authRow = settings?.find((r) => r.key === "auth_provider_config");

  const isR2Configured = Boolean(r2Row && r2Row.value);
  const authVal = (authRow?.value || {}) as Record<string, unknown>;
  const isGoogleAuthEnabled = authVal.googleEnabled !== false;
  const isGoogleClientIdSet = Boolean(authVal.googleClientId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight">
          Superadmin Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan kesehatan infrastruktur, persetujuan mitra vendor, statistik ruang kerja SaaS, dan Storage R2.
        </p>
      </div>

      {pendingVendorsCount > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-foreground">
                Ada {pendingVendorsCount} Pengajuan Mitra Vendor Menunggu Persetujuan!
              </h3>
              <p className="text-xs text-muted-foreground">
                Mitra vendor baru telah mendaftar dan menunggu moderasi dari Admin Superadmin.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-xs shrink-0">
            <Link href="/admin/vendor-partners">
              Tinjau Pengajuan Vendor →
            </Link>
          </Button>
        </Card>
      )}

      <HealthMonitorCard />

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Pengajuan Vendor Pending
            </CardTitle>
            <Building2 className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-600">{pendingVendorsCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Menunggu peninjauan Admin
            </p>
          </CardContent>
        </Card>
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
                {isR2Configured ? "HEALTHY" : "BELUM DISETTING"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {docsCount || 0} file tersimpan di R2
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Status Google OAuth
            </CardTitle>
            <Key className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge
                variant={isGoogleAuthEnabled ? "success" : "secondary"}
                className="text-xs"
              >
                {isGoogleAuthEnabled ? (isGoogleClientIdSet ? "AKTIF (CONFIGURED)" : "AKTIF (DEFAULT)") : "NONAKTIF"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Auth Callback Engine Ready
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-medium">App Branding & Google OAuth</CardTitle>
            <CardDescription>
              Atur Base URL callback, Client ID/Secret Google, serta Logo & Favicon S3.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded bg-accent/30 border border-border">
              <div>
                <p className="text-sm font-semibold">Pengaturan Auth & Branding</p>
                <p className="text-xs text-muted-foreground">URL Callback, OAuth Key & Identity</p>
              </div>
              <Button asChild size="sm">
                <Link href="/admin/app-settings">Buka Setting</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Modul Storage R2</CardTitle>
            <CardDescription>
              Kelola kredensial S3 Cloudflare R2 dan aturan upload secara dinamis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded bg-accent/30 border border-border">
              <div>
                <p className="text-sm font-semibold">Konfigurasi R2 Storage</p>
                <p className="text-xs text-muted-foreground">Account ID & Secret Key</p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/storage-config">Buka Storage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Keamanan & RBAC</CardTitle>
            <CardDescription>
              Atur template izin default global untuk WO dan Panitia Keluarga.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded bg-accent/30 border border-border">
              <div>
                <p className="text-sm font-semibold">Template RBAC Global</p>
                <p className="text-xs text-muted-foreground">Matriks izin bawaan</p>
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
