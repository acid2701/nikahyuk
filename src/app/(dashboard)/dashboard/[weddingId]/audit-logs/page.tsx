import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ShieldAlert, Clock, User, Activity } from "lucide-react";

export default async function AuditLogsPage(props: { params: Promise<any> }) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const supabase = await createClient();

  const { data: logsData } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: false })
    .limit(100);

  const logs = logsData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Audit Trail & Activity Log Timeline
        </h1>
        <p className="text-sm text-muted-foreground">
          Riwayat lengkap aktivitas perubahan data, transaksi, & tindakan pengguna di workspace ini.
        </p>
      </div>

      {logs.length === 0 ? (
        <Card className="border-dashed p-8 text-center space-y-3">
          <ShieldAlert className="h-10 w-10 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground">Belum Ada Catatan Audit Log</p>
            <p className="text-xs text-muted-foreground mt-1">
              Aktivitas pembuatan, pengeditan, atau penghapusan data akan otomatis terekam di sini.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="border-border/80 shadow-xs overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead className="w-12 text-center text-xs font-semibold">No.</TableHead>
                <TableHead className="text-xs font-semibold">Waktu & Tanggal</TableHead>
                <TableHead className="text-xs font-semibold">Pengguna (User)</TableHead>
                <TableHead className="text-xs font-semibold">Modul</TableHead>
                <TableHead className="text-xs font-semibold">Aksi</TableHead>
                <TableHead className="text-xs font-semibold">Detail Perubahan (Diff)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, index) => {
                let badgeVariant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" = "secondary";

                if (log.action_type === "CREATE") badgeVariant = "success";
                else if (log.action_type === "UPDATE") badgeVariant = "warning";
                else if (log.action_type === "DELETE") badgeVariant = "destructive";

                return (
                  <TableRow key={log.id} className="hover:bg-muted/30">
                    <TableCell className="text-center font-mono font-semibold text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    <TableCell className="text-xs font-mono text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-primary" />
                        <span>
                          {new Date(log.created_at).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-medium">
                      <div className="flex items-center space-x-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{log.user_display_name || "Sistem"}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-semibold text-foreground">
                      <div className="flex items-center space-x-1.5">
                        <Activity className="h-3.5 w-3.5 text-primary" />
                        <span>{log.module_name}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs">
                      <Badge variant={badgeVariant} className="text-[10px] uppercase font-bold">
                        {log.action_type}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs font-mono max-w-xs truncate text-muted-foreground">
                      {JSON.stringify(log.change_diff)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
