import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getDynamicR2Client } from "@/lib/cloudflare-r2/dynamic-config";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createGunzip } from "zlib";
import { pipeline } from "stream/promises";

const BACKUP_DIR = path.join(process.cwd(), "backups");

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

function decryptFileAes256Cbc(encryptedBuffer: Buffer, secretKeyHex: string): Buffer {
  const key = crypto.createHash("sha256").update(secretKeyHex).digest();
  const iv = encryptedBuffer.subarray(0, 16);
  const data = encryptedBuffer.subarray(16);

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

async function runSafePsqlRestore(decompressedSqlPath: string): Promise<void> {
  const dbConfig = getDbConnectionConfig();
  const psqlPath = "/www/server/pgsql/bin/psql";

  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(decompressedSqlPath);
    const psqlProcess = spawn(
      psqlPath,
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
        stdio: ["pipe", "ignore", "pipe"],
      }
    );

    let stderrOutput = "";
    psqlProcess.stderr.on("data", (chunk) => {
      stderrOutput += chunk.toString();
    });

    fileStream.pipe(psqlProcess.stdin);

    psqlProcess.on("error", reject);
    psqlProcess.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`psql restore gagal dengan code ${code}: ${stderrOutput}`));
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "superadmin" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename, source } = await req.json();

    if (!filename) {
      return NextResponse.json({ error: "Nama file backup wajib diisi." }, { status: 400 });
    }

    // Sanitasi nama file untuk mencegah directory traversal
    const safeFilename = path.basename(filename);
    let encryptedBuffer: Buffer | null = null;

    if (source === "local") {
      const localPath = path.join(BACKUP_DIR, safeFilename);
      if (!fs.existsSync(localPath)) {
        return NextResponse.json({ error: "File backup lokal tidak ditemukan." }, { status: 404 });
      }
      encryptedBuffer = fs.readFileSync(localPath);
    } else {
      // Default: ambil dari Cloudflare R2
      const { s3, config } = await getDynamicR2Client();
      const r2Key = safeFilename.startsWith("backups/") ? safeFilename : `backups/${safeFilename}`;

      const res = await s3.send(
        new GetObjectCommand({
          Bucket: config.bucketName,
          Key: r2Key,
        })
      );

      const bytes = await res.Body?.transformToByteArray();
      if (!bytes) {
        return NextResponse.json({ error: "Gagal mengambil data dari Cloudflare R2." }, { status: 500 });
      }
      encryptedBuffer = Buffer.from(bytes);
    }

    // 1. Dekripsi AES-256-CBC
    const secretKey = process.env.BACKUP_ENCRYPTION_SECRET || "nikahyuk_backup_secret_key_32_bytes!!";
    const decompressedGzip = decryptFileAes256Cbc(encryptedBuffer, secretKey);

    // 2. Uncompress GZIP ke SQL temporary
    const tempSqlPath = path.join(BACKUP_DIR, `restore-${Date.now()}.sql`);
    const tempGzipPath = path.join(BACKUP_DIR, `restore-${Date.now()}.gz`);
    fs.writeFileSync(tempGzipPath, decompressedGzip);

    const gunzip = createGunzip();
    const readStream = fs.createReadStream(tempGzipPath);
    const writeStream = fs.createWriteStream(tempSqlPath);
    await pipeline(readStream, gunzip, writeStream);

    // 3. Eksekusi Restore psql
    await runSafePsqlRestore(tempSqlPath);

    // Cleanup temp files
    if (fs.existsSync(tempGzipPath)) fs.unlinkSync(tempGzipPath);
    if (fs.existsSync(tempSqlPath)) fs.unlinkSync(tempSqlPath);

    // Catat di audit log
    await prisma.auditLog.create({
      data: {
        weddingId: "00000000-0000-0000-0000-000000000000",
        userId: user.userId,
        userDisplayName: user.fullName || user.email,
        moduleName: "Database Restore Engine",
        actionType: "UPDATE",
        changeDiff: {
          filename: safeFilename,
          source: source || "r2",
          timestamp: new Date().toISOString(),
        },
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: `Database PostgreSQL berhasil dipulihkan dari snapshot ${safeFilename}!`,
    });
  } catch (err) {
    console.error("[Restore Error]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Restore database gagal" },
      { status: 500 }
    );
  }
}
