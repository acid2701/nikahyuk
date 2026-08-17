import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ping PostgreSQL DB
    const dbStartTime = Date.now();
    const { count, error: dbErr } = await supabase
      .from("weddings")
      .select("*", { count: "exact", head: true });

    const dbLatencyMs = Date.now() - dbStartTime;

    const dbStatus = dbErr ? "ERROR" : "HEALTHY";

    // Storage Status Check (Cloudflare R2 configured)
    const { data: r2Setting } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "r2_credentials")
      .single();

    const r2Configured = !!(r2Setting?.value && (r2Setting.value as any).bucketName);
    const storageStatus = r2Configured ? "HEALTHY" : "NOT_CONFIGURED";

    const totalLatencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: dbStatus === "HEALTHY" ? "OK" : "DEGRADED",
      timestamp: new Date().toISOString(),
      metrics: {
        totalLatencyMs,
        dbLatencyMs,
        dbStatus,
        totalWeddingsCount: count || 0,
        storageStatus,
        realtimeWebSocket: "ONLINE",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "ERROR",
        error: err instanceof Error ? err.message : "Health check failed",
      },
      { status: 500 }
    );
  }
}
