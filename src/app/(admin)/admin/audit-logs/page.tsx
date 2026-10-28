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
import { ShieldAlert, User, Clock, FileJson } from "lucide-react";

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params?.page || "1", 10));
  const pageSize = 25;
  const skip = (currentPage - 1) * pageSize;

  const [logsData, totalLogs] = await Promise.all([
    prisma.auditLog.findMany({
      include: {
        wedding: {
          select: {
            groomName: true,
            brideName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.auditLog.count(),
  ]);

  const totalPages = Math.ceil(totalLogs / pageSize) || 1;

  const logs = logsData.map((l) => ({
    id: l.id,
    wedding_id: l.weddingId,
    user_display_name: l.userDisplayName,
    module_name: l.moduleName,
    action_type: l.actionType,
    change_diff: l.changeDiff,
    created_at: l.createdAt.toISOString(),
    weddings: l.wedding ? {
      groom_name: l.wedding.groomName,
      bride_name: l.wedding.brideName,
    } : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" />
          Global Cross-Tenant Audit Logs
        </h1>
        <p className="text-sm text-muted-foreground">
          Pantau seluruh jejak aktivitas pengguna, perubahan data, & tindakan kritis lintas workspace pengantin.
        </p>
      </div>

      <Card className="border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/30 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Riwayat Log Aktivitas</CardTitle>
              <CardDescription className="text-xs">
                Tercatat otomatis secara real-time dari seluruh modul aplikasi.
              </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
              {totalLogs} Total Log
              </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Belum ada log aktivitas tercatat di sistem.
            </div>
          ) : (
            <>
            <div className="overflow-x-auto min-w-0">
            <Table>
              <TableHeader className="bg-muted/60">
                <TableRow>
                  <TableHead className="w-12 text-center text-xs font-semibold">No.</TableHead>
                  <TableHead className="text-xs font-semibold">Waktu</TableHead>
                  <TableHead className="text-xs font-semibold">Pengguna & Workspace</TableHead>
                  <TableHead className="text-xs font-semibold">Modul</TableHead>
                  <TableHead className="text-xs font-semibold">Aksi</TableHead>
                  <TableHead className="text-xs font-semibold">Rincian Perubahan (JSON Diff)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: any, index: number) => {
                  const weddingName = log.weddings
                    ? `${log.weddings.groom_name} & ${log.weddings.bride_name}`
                    : log.wedding_id;

                  let badgeVariant: "success" | "warning" | "destructive" | "secondary" = "secondary";
                  if (log.action_type === "CREATE") badgeVariant = "success";
                  if (log.action_type === "UPDATE") badgeVariant = "warning";
                  if (log.action_type === "DELETE") badgeVariant = "destructive";

                  return (
                    <TableRow key={log.id} className="hover:bg-muted/30">
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        {(currentPage - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {new Date(log.created_at).toLocaleString("id-ID")}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          <User className="h-3 w-3 text-primary" />
                          {log.user_display_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-serif">
                          Workspace: {weddingName}
                        </p>
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        <span className="font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded border border-border/70 bg-muted/40 text-foreground">
                          {log.module_name}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                          badgeVariant === "destructive"
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : badgeVariant === "success"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            badgeVariant === "destructive" ? "bg-rose-500" : badgeVariant === "success" ? "bg-emerald-500" : "bg-sky-500"
                          }`} />
                          {log.action_type}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="max-h-20 overflow-y-auto font-mono text-[10px] bg-muted/60 p-2 rounded border border-border/50 flex items-start gap-1">
                          <FileJson className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                          <pre className="whitespace-pre-wrap break-all text-muted-foreground">
                            {JSON.stringify(log.change_diff, null, 2)}
                          </pre>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
            {totalPages > 1 ? (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Halaman {currentPage} dari {totalPages} ({totalLogs} entri log)
                </span>
                <div className="flex items-center gap-2">
                  {currentPage > 1 ? (
                    <a
                      href={`/admin/audit-logs?page=${currentPage - 1}`}
                      className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                    >
                      Sebelumnya
                    </a>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background opacity-50 cursor-not-allowed h-8 px-3">
                      Sebelumnya
                    </span>
                  )}
                  {currentPage < totalPages ? (
                    <a
                      href={`/admin/audit-logs?page=${currentPage + 1}`}
                      className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                    >
                      Selanjutnya
                    </a>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background opacity-50 cursor-not-allowed h-8 px-3">
                      Selanjutnya
                    </span>
                  )}
                </div>
              </div>
            ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
