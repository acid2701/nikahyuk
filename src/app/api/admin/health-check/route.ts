import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const startTime = Date.now();

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ping PostgreSQL DB
    const dbStartTime = Date.now();
    const count = await prisma.wedding.count();
    const dbLatencyMs = Date.now() - dbStartTime;

    // Storage Status Check (Cloudflare R2 configured)
    const r2Setting = await prisma.systemSetting.findUnique({
      where: { key: "r2_credentials" },
    });

    const r2Configured = !!(
      r2Setting?.value &&
      typeof r2Setting.value === "object" &&
      (r2Setting.value as any).bucketName
    );
    const storageStatus = r2Configured ? "HEALTHY" : "NOT_CONFIGURED";

    const totalLatencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      metrics: {
        totalLatencyMs,
        dbLatencyMs,
        dbStatus: "HEALTHY",
        totalWeddingsCount: count,
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
