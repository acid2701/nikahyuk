import { createClient } from "@/lib/supabase/server";
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

export default async function AdminAuditLogsPage() {
  const supabase = await createClient();

  const { data: logsData } = await supabase
    .from("audit_logs")
    .select("*, weddings(groom_name, bride_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  const logs = logsData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight flex items-center gap-2">
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
              <CardTitle className="text-base font-semibold">100 Log Aktivitas Terbaru</CardTitle>
              <CardDescription className="text-xs">
                Tercatat otomatis secara real-time dari seluruh modul aplikasi.
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {logs.length} Log Terakhir
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Belum ada log aktivitas tercatat di sistem.
            </div>
          ) : (
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
                        {index + 1}
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
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                          {log.module_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant={badgeVariant} className="text-[10px] font-bold">
                          {log.action_type}
                        </Badge>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
