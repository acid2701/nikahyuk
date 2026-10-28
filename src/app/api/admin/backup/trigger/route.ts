import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, verifySessionToken } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getDynamicR2Client } from "@/lib/cloudflare-r2/dynamic-config";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";
import { createGzip } from "zlib";

const BACKUP_DIR = path.join(process.cwd(), "backups");
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function getDbConnectionConfig() {
  const dbUrl = process.env.DATABASE_URL || "";
  try {
    const parsed = new URL(dbUrl);
    return {
      user: decodeURIComponent(parsed.username || "nikahyuk_user"),
      password: decodeURIComponent(parsed.password || ""),
      host: parsed.hostname || "127.0.0.1",
      port: parsed.port || "5432",
      database: parsed.pathname.replace(/^\//, "") || "nikahyuk_db",
    };
  } catch {
    return {
      user: "nikahyuk_user",
      password: "",
      host: "127.0.0.1",
      port: "5432",
      database: "nikahyuk_db",
    };
  }
}

async function runSafePgDump(outputPath: string): Promise<void> {
  const dbConfig = getDbConnectionConfig();
  const pgDumpPath = "/www/server/pgsql/bin/pg_dump";

  const dumpProcess = spawn(
    pgDumpPath,
    [
      "-h", dbConfig.host,
      "-p", String(dbConfig.port),
      "-U", dbConfig.user,
      "-d", dbConfig.database,
    ],
    {
      env: {
        ...process.env,
        PGPASSWORD: dbConfig.password,
      },
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  let stderrOutput = "";
  dumpProcess.stderr.on("data", (chunk) => {
    stderrOutput += chunk.toString();
  });

  const gzipStream = createGzip();
  const fileWriteStream = fs.createWriteStream(outputPath);
  const pipePromise = pipeline(dumpProcess.stdout, gzipStream, fileWriteStream);

  const [exitCode] = await Promise.all([
    new Promise<number>((resolve, reject) => {
      dumpProcess.on("error", reject);
      dumpProcess.on("close", resolve);
    }),
    pipePromise,
  ]);

  if (exitCode !== 0) {
    throw new Error(`pg_dump gagal dengan exit code ${exitCode}: ${stderrOutput}`);
  }
}

function encryptFileAes256Cbc(inputPath: string, outputPath: string, secretKeyHex: string) {
  const key = crypto.createHash("sha256").update(secretKeyHex).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  const input = fs.readFileSync(inputPath);
  const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);

  // Format: [16 bytes IV] + [Encrypted Data]
  const combined = Buffer.concat([iv, encrypted]);
  fs.writeFileSync(outputPath, combined);
  return { ivHex: iv.toString("hex"), sizeBytes: combined.length };
}

export async function POST(req: NextRequest) {
  try {
    const rawCookie = req.headers.get("cookie") || "";
    const authHeader = req.headers.get("authorization") || "";
    const isCronAuthorized =
      (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) ||
      (process.env.AUTH_SECRET && authHeader === `Bearer ${process.env.AUTH_SECRET}`);

    let user = null;
    if (!isCronAuthorized) {
      const tokenFromHeader = rawCookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("nikahyuk_session="))
        ?.split("=")[1];

      user = await getCurrentUser();
      if (!user && tokenFromHeader) {
        user = await verifySessionToken(tokenFromHeader);
      }
      if (!user) {
        const token = req.cookies.get("nikahyuk_session")?.value;
        if (token) {
          user = await verifySessionToken(token);
        }
      }
      if (!user) {
        return NextResponse.json(
          { error: "Unauthorized", debug: { hasCookie: !!rawCookie, hasToken: !!tokenFromHeader } },
          { status: 401 }
        );
      }

      if (user.role !== "superadmin" && user.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden: Hanya superadmin/admin yang dapat mentrigger backup." },
          { status: 403 }
        );
      }
    }

    const timestampStr = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
    const rawSqlGzName = `temp-${timestampStr}.sql.gz`;
    const encryptedFilename = `backup-db-${timestampStr}.sql.gz.enc`;
    const localRawPath = path.join(BACKUP_DIR, rawSqlGzName);
    const localEncPath = path.join(BACKUP_DIR, encryptedFilename);

    // 1. Eksekusi pg_dump binary stream ke GZIP
    await runSafePgDump(localRawPath);

    // 2. Enkripsi AES-256-CBC dengan IV dinamis
    const secretKey = process.env.BACKUP_ENCRYPTION_SECRET || "nikahyuk_backup_secret_key_32_bytes!!";
    const { ivHex, sizeBytes } = encryptFileAes256Cbc(localRawPath, localEncPath, secretKey);

    // Hapus raw temp sql.gz demi keamanan
    if (fs.existsSync(localRawPath)) {
      fs.unlinkSync(localRawPath);
    }

    // 3. Upload ke Cloudflare R2 bucket jika storage configured
    const r2Key = `backups/${encryptedFilename}`;
    let uploadedToR2 = false;

    try {
      const { s3, config } = await getDynamicR2Client();
      const encBuffer = fs.readFileSync(localEncPath);

      await s3.send(
        new PutObjectCommand({
          Bucket: config.bucketName,
          Key: r2Key,
          Body: encBuffer,
          ContentType: "application/octet-stream",
          Metadata: {
            "iv-hex": ivHex,
            "created-by": user ? user.email || "superadmin" : "system-cron",
            "algo": "aes-256-cbc",
          },
        })
      );
      uploadedToR2 = true;

      // Auto-prune R2 backups lama (simpan 30 snapshot terbaru)
      try {
        const listRes = await s3.send(
          new ListObjectsV2Command({
            Bucket: config.bucketName,
            Prefix: "backups/backup-",
          })
        );
        if (listRes.Contents && listRes.Contents.length > 30) {
          const sorted = listRes.Contents.filter((c) => c.Key).sort((a, b) => {
            const timeA = a.LastModified ? new Date(a.LastModified).getTime() : 0;
            const timeB = b.LastModified ? new Date(b.LastModified).getTime() : 0;
            return timeA - timeB;
          });
          const toDelete = sorted.length - 30;
          for (let i = 0; i < toDelete; i++) {
            if (sorted[i].Key) {
              await s3.send(
                new DeleteObjectCommand({
                  Bucket: config.bucketName,
                  Key: sorted[i].Key!,
                })
              );
            }
          }
        }
      } catch (pruneErr) {
        console.warn("[R2 Prune Warning]:", pruneErr);
      }
    } catch (r2Err) {
      console.warn("[R2 Upload Warning]:", r2Err instanceof Error ? r2Err.message : r2Err);
    }

    // 4. Catat di tabel system_backups
    await prisma.systemBackup.create({
      data: {
        fileName: encryptedFilename,
        r2FileKey: r2Key,
        fileSizeBytes: BigInt(sizeBytes),
        encryptionAlgo: "aes-256-cbc",
        status: "success",
      },
    });

    return NextResponse.json({
      success: true,
      filename: encryptedFilename,
      sizeBytes,
      timestamp: new Date().toISOString(),
      uploadedToR2,
      message: `Backup database terenkripsi AES-256-CBC berhasil dibuat!${
        uploadedToR2 ? " Dan otomatis tersinkron ke Cloudflare R2." : " (Tersimpan di Local VPS)."
      }`,
    });
  } catch (err) {
    console.error("[Backup Trigger Error]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Backup failed" },
      { status: 500 }
    );
  }
}
