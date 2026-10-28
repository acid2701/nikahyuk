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

      <div className="grid gap-3.5 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-border/80 bg-card p-4 hover:border-amber-500/40 hover:shadow-xs transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Pengajuan Mitra Vendor
            </CardTitle>
            <div className="h-7 w-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div className="text-2xl font-bold font-mono text-amber-500">{pendingVendorsCount}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {pendingVendorsCount > 0 ? "Perlu ditinjau segera" : "Semua pengajuan selesai"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-4 hover:border-[#ff385c]/40 hover:shadow-xs transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Workspace
            </CardTitle>
            <div className="h-7 w-7 rounded-full bg-[#ff385c]/10 text-[#ff385c] flex items-center justify-center shrink-0">
              <Database className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div className="text-2xl font-bold font-mono text-foreground">{weddingsCount || 0}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              Pasangan terdaftar aktif
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-4 hover:border-[#ff385c]/40 hover:shadow-xs transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Sub-Events Terjadwal
            </CardTitle>
            <div className="h-7 w-7 rounded-full bg-[#ff385c]/10 text-[#ff385c] flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div className="text-2xl font-bold font-mono text-foreground">{eventsCount || 0}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              Akad, Resepsi, Lamaran
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-4 hover:border-emerald-500/40 hover:shadow-xs transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Dokumen Storage R2
            </CardTitle>
            <div className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono text-foreground">{docsCount || 0}</span>
              <Badge variant={isR2Configured ? "success" : "destructive"} className="text-[10px] px-2 py-0">
                {isR2Configured ? "ONLINE" : "OFFLINE"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              File & berkas terenkripsi
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:shadow-md transition-all space-y-3">
          <div>
            <CardTitle className="text-base font-sans font-bold">App Branding & Google OAuth</CardTitle>
            <CardDescription className="text-xs mt-1">
              Atur Base URL callback, Client ID/Secret Google, serta Logo & Favicon S3.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-muted/50 border border-border/70 gap-3">
            <div>
              <p className="text-xs font-semibold text-foreground">Pengaturan Auth & Branding</p>
              <p className="text-[11px] text-muted-foreground">URL Callback, OAuth Key & Identity</p>
            </div>
            <Button asChild size="sm" className="w-full sm:w-auto h-8 px-4 rounded-full text-xs font-semibold bg-[#ff385c] text-white hover:bg-[#e00b41]">
              <Link href="/admin/app-settings">Buka Setting</Link>
            </Button>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:shadow-md transition-all space-y-3">
          <div>
            <CardTitle className="text-base font-sans font-bold">Modul Storage R2</CardTitle>
            <CardDescription className="text-xs mt-1">
              Kelola kredensial S3 Cloudflare R2 dan aturan upload secara dinamis.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-muted/50 border border-border/70 gap-3">
            <div>
              <p className="text-xs font-semibold text-foreground">S3 Engine & Bucket</p>
              <p className="text-[11px] text-muted-foreground">Kapasitas, Endpoint, Bucket Rule</p>
            </div>
            <Button asChild size="sm" className="w-full sm:w-auto h-8 px-4 rounded-full text-xs font-semibold bg-[#ff385c] text-white hover:bg-[#e00b41]">
              <Link href="/admin/storage-config">Atur Storage</Link>
            </Button>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:shadow-md transition-all space-y-3">
          <div>
            <CardTitle className="text-base font-sans font-bold">Akses Staf & Audit</CardTitle>
            <CardDescription className="text-xs mt-1">
              Delegasi wewenang RBAC granular dan pantau rekaman aktivitas per-tenant.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-muted/50 border border-border/70 gap-3">
            <div>
              <p className="text-xs font-semibold text-foreground">RBAC & Audit Trail</p>
              <p className="text-[11px] text-muted-foreground">Granular Role & Global Activity Log</p>
            </div>
            <Button asChild size="sm" className="w-full sm:w-auto h-8 px-4 rounded-full text-xs font-semibold bg-[#ff385c] text-white hover:bg-[#e00b41]">
              <Link href="/admin/staff-permissions">Kelola Staf</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
