import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getDynamicR2Client } from "@/lib/cloudflare-r2/dynamic-config";
import fs from "fs";
import path from "path";

const BACKUP_DIR = path.join(process.cwd(), "backups");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "superadmin" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename } = await params;
    if (!filename || filename.includes("..") || filename.includes("/")) {
      return NextResponse.json({ error: "Nama berkas tidak valid" }, { status: 400 });
    }

    // 1. Cek file lokal
    const localPath = path.join(BACKUP_DIR, filename);
    if (fs.existsSync(localPath)) {
      const fileBuffer = fs.readFileSync(localPath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // 2. Cek Cloudflare R2
    try {
      const { s3, config } = await getDynamicR2Client();
      const r2Key = `backups/${filename}`;
      const res = await s3.send(
        new GetObjectCommand({
          Bucket: config.bucketName,
          Key: r2Key,
        })
      );

      const bytes = await res.Body?.transformToByteArray();
      if (bytes) {
        return new NextResponse(Buffer.from(bytes), {
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      }
    } catch (r2Err) {
      console.warn("[Download R2 fallback notice]:", r2Err);
    }

    return NextResponse.json({ error: "Berkas backup tidak ditemukan" }, { status: 404 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Download failed" },
      { status: 500 }
    );
  }
}
