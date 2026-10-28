import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDynamicR2Client } from "@/lib/cloudflare-r2/dynamic-config";
import { HeadBucketCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function POST() {
  const startTime = Date.now();

  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "superadmin" && user.role !== "admin")) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak: Hanya Admin/Superadmin." },
        { status: 403 }
      );
    }

    const { s3, config } = await getDynamicR2Client();

    if (!config.bucketName || !config.accountId || !config.accessKeyId || !config.secretAccessKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Kredensial Cloudflare R2 belum lengkap diisi. Mohon lengkapi dan simpan terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    // Ping Cloudflare R2 S3 API
    const listRes = await s3.send(
      new ListObjectsV2Command({
        Bucket: config.bucketName,
        MaxKeys: 1,
      })
    );

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `Koneksi ke Cloudflare R2 Berhasil! Latensi: ${latencyMs}ms.`,
      details: {
        bucketName: config.bucketName,
        accountId: config.accountId,
        latencyMs,
        cdnDomain: config.publicCdnDomain || "(Belum diisi)",
        keyCount: listRes.KeyCount ?? 0,
      },
    });
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    console.error("Test R2 connection failed:", err);

    let friendlyError = err?.message || "Gagal menghubungi endpoint Cloudflare R2.";
    if (err?.name === "NoSuchBucket") {
      friendlyError = `Bucket "${err?.Bucket || "yang dituju"}" tidak ditemukan di akun Cloudflare Anda. Pastikan nama bucket tepat.`;
    } else if (err?.name === "InvalidAccessKeyId" || err?.Code === "InvalidAccessKeyId") {
      friendlyError = "Access Key ID tidak valid atau sudah kedaluwarsa.";
    } else if (err?.name === "SignatureDoesNotMatch") {
      friendlyError = "Secret Access Key tidak cocok. Periksa kembali Secret Access Key.";
    }

    return NextResponse.json(
      {
        success: false,
        error: friendlyError,
        rawError: err?.name || "UnknownError",
        latencyMs,
      },
      { status: 500 }
    );
  }
}
