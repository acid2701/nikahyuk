import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { compressAndEncrypt } from "@/lib/backup/crypto-backup";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getDynamicR2Client } from "@/lib/cloudflare-r2/dynamic-config";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is superadmin / admin
    const userRole = user.app_metadata?.role || user.user_metadata?.role;
    if (userRole !== "superadmin" && userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden: Hanya admin yang dapat mentrigger backup." }, { status: 403 });
    }

    // 1. Dump database tables into a single JSON snapshot
    const { data: weddings } = await supabase.from("weddings").select("*");
    const { data: events } = await supabase.from("wedding_events").select("*");
    const { data: guests } = await supabase.from("guests").select("*");
    const { data: rundowns } = await supabase.from("rundowns").select("*");
    const { data: budgetItems } = await supabase.from("budget_items").select("*");
    const { data: vendors } = await supabase.from("vendors").select("*");
    const { data: giftsLog } = await supabase.from("gifts_log").select("*");
    const { data: auditLogs } = await supabase.from("audit_logs").select("*");

    const snapshot = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      triggeredBy: user.email,
      tables: {
        weddings: weddings || [],
        wedding_events: events || [],
        guests: guests || [],
        rundowns: rundowns || [],
        budget_items: budgetItems || [],
        vendors: vendors || [],
        gifts_log: giftsLog || [],
        audit_logs: auditLogs || [],
      },
    };

    const jsonString = JSON.stringify(snapshot, null, 2);

    // 2. Compress & Encrypt AES-256-CBC
    const secretKey = process.env.BACKUP_ENCRYPTION_SECRET || "nikahyuk_backup_secret_key_32_bytes!!";
    const { encryptedBuffer, ivHex } = compressAndEncrypt(jsonString, secretKey);

    // 3. Upload encrypted backup to Cloudflare R2 bucket /backups/
    const { s3, config } = await getDynamicR2Client();

    const timestampStr = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backups/backup-${timestampStr}-${ivHex.slice(0, 8)}.enc`;

    await s3.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: filename,
        Body: encryptedBuffer,
        ContentType: "application/octet-stream",
        Metadata: {
          "iv-hex": ivHex,
          "created-by": user.email || "superadmin",
          "tables-count": String(Object.keys(snapshot.tables).length),
        },
      })
    );

    // Record audit log
    await supabase.from("audit_logs").insert({
      wedding_id: weddings?.[0]?.id || "system",
      user_id: user.id,
      user_display_name: user.email || "Superadmin",
      module_name: "Encrypted Backup Engine",
      action_type: "CREATE",
      change_diff: { filename, sizeBytes: encryptedBuffer.length, ivHex },
    });

    return NextResponse.json({
      success: true,
      filename,
      sizeBytes: encryptedBuffer.length,
      timestamp: snapshot.timestamp,
      message: "Backup terenkripsi AES-256-CBC berhasil dibuat dan diunggah ke Cloudflare R2.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Backup failed" },
      { status: 500 }
    );
  }
}
