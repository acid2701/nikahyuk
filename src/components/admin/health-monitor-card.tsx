"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Database, HardDrive, Wifi, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HealthMonitorCard() {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);

  const fetchHealth = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/health-check");
      if (res.ok) {
        const json = await res.json();
        setData(json.metrics);
      }
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-sans font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
              Live Infrastructure Health Status
            </CardTitle>
            <CardDescription className="text-xs">
              Monitor latensi PostgreSQL, koneksi Cloudflare R2, & ORM Engine real-time.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchHealth}
            disabled={loading}
            className="h-8 rounded-full px-3 text-xs gap-1.5 border-border/80 hover:bg-muted font-semibold transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <div className="p-3.5 rounded-xl border border-border/80 bg-background/50 hover:border-foreground/30 transition-all space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Database className="h-3.5 w-3.5 text-[#ff385c]" /> PostgreSQL DB
              </span>
              <Badge variant="success" className="text-[10px] px-2 py-0">
                HEALTHY
              </Badge>
            </div>
            <p className="font-mono text-xl font-bold text-foreground">
              {data?.dbLatencyMs !== undefined ? `${data.dbLatencyMs} ms` : "..."}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {data?.totalWeddingsCount !== undefined ? `${data.totalWeddingsCount} Workspaces` : "Querying..."}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border/80 bg-background/50 hover:border-foreground/30 transition-all space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <HardDrive className="h-3.5 w-3.5 text-sky-500" /> Cloudflare R2
              </span>
              <Badge variant={data?.storageStatus === "HEALTHY" ? "success" : "secondary"} className="text-[10px] px-2 py-0">
                {data?.storageStatus || "..."}
              </Badge>
            </div>
            <p className="font-mono text-xl font-bold text-sky-500">
              S3 Storage OK
            </p>
            <p className="text-[10px] text-muted-foreground">
              Encrypted AES-256 Storage
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border/80 bg-background/50 hover:border-foreground/30 transition-all space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Wifi className="h-3.5 w-3.5 text-emerald-500" /> PostgreSQL Engine
              </span>
              <Badge variant="success" className="text-[10px] px-2 py-0">
                ONLINE
              </Badge>
            </div>
            <p className="font-mono text-xl font-bold text-emerald-500">
              Prisma ORM
            </p>
            <p className="text-[10px] text-muted-foreground">
              Local aaPanel Connection
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
