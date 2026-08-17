"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Database, ShieldCheck, Download, Play, RefreshCw, Lock, FileArchive } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export interface BackupItem {
  id: string;
  filename: string;
  sizeBytes: number;
  createdAt: string;
  createdBy: string;
}

export default function AdminBackupsPage() {
  const [loading, setLoading] = React.useState(false);
  const [backups, setBackups] = React.useState<BackupItem[]>([]);
  const { toast } = useToast();

  async function handleTriggerBackup() {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/backup/trigger", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Backup AES-256-CBC Terbuat!",
          description: `Berkas ${data.filename} (${(data.sizeBytes / 1024).toFixed(1)} KB) tersimpan di Cloudflare R2.`,
          variant: "success",
        });

        const newBackup: BackupItem = {
          id: data.filename,
          filename: data.filename,
          sizeBytes: data.sizeBytes,
          createdAt: data.timestamp,
          createdBy: "Superadmin",
        };

        setBackups((prev) => [newBackup, ...prev]);
      } else {
        toast({
          title: "Gagal Membuat Backup",
          description: data.error || "Internal error",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Kesalahan Jaringan",
        description: "Gagal menghubungkan ke server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Automated Encrypted Backups (AES-256-CBC)
          </h1>
          <p className="text-sm text-muted-foreground">
            Snapshot database otomatis terenkripsi AES-256-CBC tersimpan di Cloudflare R2 `/backups/`.
          </p>
        </div>

        <Button onClick={handleTriggerBackup} disabled={loading} className="gap-2 shrink-0">
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Memproses...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" /> Trigger Backup Sekarang
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Algoritma Enkripsi Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="success" className="text-xs gap-1 font-mono font-bold">
                <Lock className="h-3 w-3" /> AES-256-CBC + GZIP
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Protected by BACKUP_ENCRYPTION_SECRET
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Lokasi Penyimpanan Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs gap-1 font-mono font-bold">
                <FileArchive className="h-3 w-3 text-purple-500" /> Cloudflare R2 /backups/
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Disaster Recovery Offsite Bucket
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Status Integritas System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="success" className="text-xs gap-1">
                <ShieldCheck className="h-3 w-3" /> 100% READY
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Database Dump Engine Verified
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/30 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Riwayat Snapshot Encrypted Backup ({backups.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Snapshot yang dihasilkan secara manual atau jadwal otomatis.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {backups.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <Database className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground">
                Belum ada snapshot backup terbuat di sesi ini. Klik tombol &apos;Trigger Backup Sekarang&apos; di atas.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/60">
                <TableRow>
                  <TableHead className="w-12 text-center text-xs font-semibold">No.</TableHead>
                  <TableHead className="text-xs font-semibold">Nama Berkas Snapshot</TableHead>
                  <TableHead className="text-xs font-semibold">Waktu Pembuatan</TableHead>
                  <TableHead className="text-xs font-semibold">Ukuran File</TableHead>
                  <TableHead className="text-xs font-semibold">Enkripsi</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((b, idx) => (
                  <TableRow key={b.id || idx} className="hover:bg-muted/30">
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {idx + 1}
                    </TableCell>

                    <TableCell className="text-xs font-mono font-bold text-foreground">
                      {b.filename}
                    </TableCell>

                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {new Date(b.createdAt).toLocaleString("id-ID")}
                    </TableCell>

                    <TableCell className="text-xs font-mono text-emerald-600">
                      {(b.sizeBytes / 1024).toFixed(1)} KB
                    </TableCell>

                    <TableCell className="text-xs">
                      <Badge variant="success" className="text-[10px] font-mono">
                        AES-256-CBC
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <Download className="h-3.5 w-3.5" /> Unduh
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
