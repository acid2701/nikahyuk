"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { DataTablePagination } from "@/components/shared/pagination/data-table-pagination";
import {
  Database,
  ShieldCheck,
  Download,
  Play,
  RefreshCw,
  Lock,
  FileArchive,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface BackupItem {
  id: string;
  filename: string;
  r2Key?: string;
  sizeBytes: number;
  createdAt: string;
  source?: "db" | "r2" | "local";
}

export default function AdminBackupsPage() {
  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(true);
  const [backups, setBackups] = React.useState<BackupItem[]>([]);
  const [selectedRestore, setSelectedRestore] = React.useState<BackupItem | null>(null);
  const [restoreConfirmText, setRestoreConfirmText] = React.useState("");
  const [restoring, setRestoring] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(backups.length / pageSize) || 1;
  const paginatedBackups = backups.slice((page - 1) * pageSize, page * pageSize);
  const { toast } = useToast();

  const loadBackups = React.useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/backup");
      if (res.ok) {
        const data = await res.json();
        const combinedMap = new Map<string, BackupItem>();

        // 1. Data dari database
        if (Array.isArray(data.dbBackups)) {
          data.dbBackups.forEach((b: any) => {
            combinedMap.set(b.filename, {
              id: b.id,
              filename: b.filename,
              r2Key: b.r2Key,
              sizeBytes: b.sizeBytes,
              createdAt: b.createdAt,
              source: "db",
            });
          });
        }

        // 2. Data dari Cloudflare R2
        if (Array.isArray(data.r2Backups)) {
          data.r2Backups.forEach((b: any) => {
            if (!combinedMap.has(b.filename)) {
              combinedMap.set(b.filename, {
                id: b.key,
                filename: b.filename,
                r2Key: b.key,
                sizeBytes: b.sizeBytes,
                createdAt: b.createdAt,
                source: "r2",
              });
            }
          });
        }

        // 3. Data dari local
        if (Array.isArray(data.localBackups)) {
          data.localBackups.forEach((b: any) => {
            if (!combinedMap.has(b.filename)) {
              combinedMap.set(b.filename, {
                id: b.filename,
                filename: b.filename,
                sizeBytes: b.sizeBytes,
                createdAt: b.createdAt,
                source: "local",
              });
            }
          });
        }

        const sorted = Array.from(combinedMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setBackups(sorted);
      }
    } catch {
      // Ignore
    } finally {
      setFetching(false);
    }
  }, []);

  React.useEffect(() => {
    loadBackups();
  }, [loadBackups]);

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
          description: `Berkas ${data.filename} (${(data.sizeBytes / 1024).toFixed(1)} KB) tersimpan aman.`,
          variant: "success",
        });
        loadBackups();
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

  async function handleConfirmRestore() {
    if (!selectedRestore) return;
    setRestoring(true);

    try {
      const res = await fetch("/api/admin/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedRestore.filename,
          source: selectedRestore.source === "local" ? "local" : "r2",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Database Berhasil Dipulihkan!",
          description: data.message,
          variant: "success",
        });
        setSelectedRestore(null);
        loadBackups();
      } else {
        toast({
          title: "Gagal Memulihkan Database",
          description: data.error || "Terjadi kesalahan internal",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Kesalahan Jaringan",
        description: "Gagal menghubungkan ke server saat proses restore.",
        variant: "destructive",
      });
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Superadmin Backup & Restore Dinamis (AES-256-CBC)
          </h1>
          <p className="text-sm text-muted-foreground">
            Snapshot database PostgreSQL lokal otomatis terenkripsi AES-256-CBC tersimpan di Cloudflare R2 `/backups/`.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBackups}
            disabled={fetching}
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${fetching ? "animate-spin" : ""}`} /> Refresh
          </Button>

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
                <FileArchive className="h-3 w-3 text-sky-500" /> Cloudflare R2 /backups/
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Disaster Recovery Offsite Bucket + Local VPS
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Status Engine Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="success" className="text-xs gap-1 font-mono">
                <ShieldCheck className="h-3 w-3" /> PostgreSQL 18.0 aaPanel
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Prisma ORM & pg_dump Active
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
                Snapshot PostgreSQL yang dapat diunduh atau langsung dipulihkan (restore) ke server.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {fetching ? (
            <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Memuat data backup...
            </div>
          ) : backups.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <Database className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground">
                Belum ada snapshot backup terbuat. Klik tombol &apos;Trigger Backup Sekarang&apos; di atas.
              </p>
            </div>
          ) : (
            <>
            <div className="overflow-x-auto min-w-0">
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
                {paginatedBackups.map((b, idx) => (
                  <TableRow key={b.id || idx} className="hover:bg-muted/30">
                    <TableCell className="text-center font-mono text-xs text-muted-foreground font-semibold">
                      {(page - 1) * pageSize + idx + 1}
                    </TableCell>

                    <TableCell className="text-xs font-mono font-bold text-foreground">
                      {b.filename}
                    </TableCell>

                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {new Date(b.createdAt).toLocaleString("id-ID")}
                    </TableCell>

                    <TableCell className="text-xs font-mono text-emerald-600 font-semibold">
                      {(b.sizeBytes / 1024).toFixed(1)} KB
                    </TableCell>

                    <TableCell className="text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        AES-256-CBC
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRestore(b)}
                          className="h-8 px-2.5 rounded-full text-xs gap-1 border-amber-500/40 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Restore
                        </Button>

                        <a
                          href={`/api/admin/backup/download/${encodeURIComponent(b.filename)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button variant="ghost" size="sm" className="h-8 px-2.5 rounded-full text-xs gap-1 hover:bg-muted">
                            <Download className="h-3.5 w-3.5" /> Unduh
                          </Button>
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>

            <DataTablePagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={backups.length}
              onPageChange={setPage}
            />
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal Dialog Konfirmasi Restore */}
      <Dialog
        open={!!selectedRestore}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRestore(null);
            setRestoreConfirmText("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" /> Konfirmasi Restore Database
            </DialogTitle>
            <DialogDescription className="text-xs pt-2 text-foreground space-y-3">
              <p>
                Anda akan memulihkan database PostgreSQL dari berkas:
              </p>
              <div className="bg-muted p-2 rounded text-xs font-mono font-bold break-all border border-border/60">
                {selectedRestore?.filename}
              </div>
              <p className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold bg-rose-500/10 p-2 rounded border border-rose-500/20">
                ⚠️ TINDAKAN IRREVERSIBLE: Data saat ini akan ditimpa total. Ketik <span className="font-mono font-bold underline">RESTORE</span> di bawah untuk mengaktifkan tombol:
              </p>
              <div>
                <Input
                  placeholder="Ketik RESTORE untuk konfirmasi"
                  value={restoreConfirmText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRestoreConfirmText(e.target.value)}
                  className="font-mono text-xs uppercase"
                  disabled={restoring}
                />
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedRestore(null);
                setRestoreConfirmText("");
              }}
              disabled={restoring}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmRestore}
              disabled={restoring || restoreConfirmText !== "RESTORE"}
              className="gap-1.5"
            >
              {restoring ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Memulihkan...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" /> Ya, Pulihkan Sekarang
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
