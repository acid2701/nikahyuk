import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getDynamicR2Client } from "@/lib/cloudflare-r2/dynamic-config";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const BACKUP_DIR = path.join(process.cwd(), "backups");

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "superadmin" && user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Ambil riwayat dari database
    const dbBackups = await prisma.systemBackup.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // 2. Ambil file backup lokal jika ada
    let localBackups: Array<{
      filename: string;
      sizeBytes: number;
      createdAt: string;
    }> = [];

    if (fs.existsSync(BACKUP_DIR)) {
      const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.startsWith("backup-"));
      localBackups = files.map((f) => {
        const full = path.join(BACKUP_DIR, f);
        const st = fs.statSync(full);
        return {
          filename: f,
          sizeBytes: st.size,
          createdAt: st.mtime.toISOString(),
        };
      });
    }

    // 3. Ambil file backup dari Cloudflare R2
    let r2Backups: Array<{
      key: string;
      filename: string;
      sizeBytes: number;
      createdAt: string;
    }> = [];

    try {
      const { s3, config } = await getDynamicR2Client();
      const res = await s3.send(
        new ListObjectsV2Command({
          Bucket: config.bucketName,
          Prefix: "backups/",
        })
      );

      if (res.Contents) {
        r2Backups = res.Contents.filter((c) => c.Key && c.Key !== "backups/").map((c) => ({
          key: c.Key!,
          filename: c.Key!.replace(/^backups\//, ""),
          sizeBytes: c.Size || 0,
          createdAt: c.LastModified ? c.LastModified.toISOString() : new Date().toISOString(),
        }));
      }
    } catch (r2Err) {
      console.warn("[R2 Backup List Notice]:", r2Err instanceof Error ? r2Err.message : r2Err);
    }

    return NextResponse.json({
      success: true,
      dbBackups: dbBackups.map((b) => ({
        id: b.id,
        filename: b.fileName,
        r2Key: b.r2FileKey,
        sizeBytes: Number(b.fileSizeBytes),
        encryptionAlgo: b.encryptionAlgo,
        status: b.status,
        createdAt: b.createdAt.toISOString(),
      })),
      localBackups,
      r2Backups,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memuat daftar backup" },
      { status: 500 }
    );
  }
}
