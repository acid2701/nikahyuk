import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptAndDecompress } from "@/lib/backup/crypto-backup";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getDynamicR2Client } from "@/lib/cloudflare-r2/dynamic-config";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { key, ivHex } = await req.json();

    if (!key || !ivHex) {
      return NextResponse.json({ error: "key dan ivHex wajib diisi" }, { status: 400 });
    }

    const { s3, config } = await getDynamicR2Client();

    const getObjRes = await s3.send(
      new GetObjectCommand({
        Bucket: config.bucketName,
        Key: key,
      })
    );

    const bodyBytes = await getObjRes.Body?.transformToByteArray();
    if (!bodyBytes) {
      return NextResponse.json({ error: "Gagal membaca berkas backup dari R2" }, { status: 500 });
    }

    const secretKey = process.env.BACKUP_ENCRYPTION_SECRET || "nikahyuk_backup_secret_key_32_bytes!!";
    const decompressedJson = decryptAndDecompress(Buffer.from(bodyBytes), ivHex, secretKey);

    const snapshot = JSON.parse(decompressedJson);

    return NextResponse.json({
      success: true,
      snapshotVersion: snapshot.version,
      timestamp: snapshot.timestamp,
      triggeredBy: snapshot.triggeredBy,
      tablesCount: Object.keys(snapshot.tables).length,
      sampleTables: Object.keys(snapshot.tables),
      message: "Berkas backup AES-256-CBC berhasil didekripsi dan diverifikasi.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Decryption failed" },
      { status: 500 }
    );
  }
}
