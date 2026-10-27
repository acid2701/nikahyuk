import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDynamicR2Client } from "@/lib/cloudflare-r2/dynamic-config";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const weddingId = (formData.get("weddingId") as string) || "public-vendor";
    const folder = (formData.get("folder") as string) || "documents";

    if (!file) {
      return NextResponse.json({ error: "Berkas tidak ditemukan dalam request" }, { status: 400 });
    }

    const { s3, config } = await getDynamicR2Client();

    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const r2FileKey = `${weddingId}/${folder}/${timestamp}-${sanitizedFileName}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: r2FileKey,
      Body: fileBuffer,
      ContentType: file.type,
    });

    await s3.send(command);

    const rawCdn = (config.publicCdnDomain || "").replace(/\/$/, "");
    const publicUrl = rawCdn
      ? rawCdn.startsWith("http")
        ? `${rawCdn}/${r2FileKey}`
        : `https://${rawCdn}/${r2FileKey}`
      : `https://${config.bucketName}.${config.accountId}.r2.cloudflarestorage.com/${r2FileKey}`;

    return NextResponse.json({
      success: true,
      r2FileKey,
      publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal mengunggah file ke R2 server-side" },
      { status: 500 }
    );
  }
}
