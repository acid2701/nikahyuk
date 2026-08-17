import { createClient } from "@/lib/supabase/server";
import { S3Client } from "@aws-sdk/client-s3";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicCdnDomain: string;
}

export interface StorageRules {
  maxImageSizeMb: number;
  maxPdfSizeMb: number;
  targetImageFormat: "webp" | "jpeg";
  imageQualityRatio: number;
  allowedMimeTypes: string[];
}

let cachedR2Config: R2Config | null = null;
let cachedS3Client: S3Client | null = null;
let cachedStorageRules: StorageRules | null = null;
let lastFetchedTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000;

export async function getDynamicR2Client(): Promise<{
  s3: S3Client;
  config: R2Config;
}> {
  const now = Date.now();
  if (
    cachedS3Client &&
    cachedR2Config &&
    now - lastFetchedTimestamp < CACHE_TTL_MS
  ) {
    return { s3: cachedS3Client, config: cachedR2Config };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("system_settings")
    .select("key, value")
    .in("key", ["r2_credentials", "storage_rules"]);

  if (error || !data) {
    throw new Error(
      "Gagal memuat konfigurasi sistem dinamis dari database: " +
        (error?.message || "Data tidak ditemukan")
    );
  }

  const r2Row = data.find((r) => r.key === "r2_credentials");
  if (!r2Row || !r2Row.value) {
    throw new Error(
      "Kredensial Cloudflare R2 belum dikonfigurasi di panel Superadmin."
    );
  }

  const r2Val = r2Row.value as unknown as R2Config;
  cachedR2Config = r2Val;
  cachedS3Client = new S3Client({
    region: "auto",
    endpoint: `https://${r2Val.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2Val.accessKeyId,
      secretAccessKey: r2Val.secretAccessKey,
    },
  });

  const storageRow = data.find((r) => r.key === "storage_rules");
  if (storageRow && storageRow.value) {
    cachedStorageRules = storageRow.value as unknown as StorageRules;
  }

  lastFetchedTimestamp = now;
  return { s3: cachedS3Client, config: cachedR2Config };
}

export async function getDynamicStorageRules(): Promise<StorageRules> {
  const now = Date.now();
  if (cachedStorageRules && now - lastFetchedTimestamp < CACHE_TTL_MS) {
    return cachedStorageRules;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("system_settings")
    .select("key, value")
    .eq("key", "storage_rules")
    .maybeSingle();

  if (error || !data || !data.value) {
    const defaultRules: StorageRules = {
      maxImageSizeMb: 10,
      maxPdfSizeMb: 20,
      targetImageFormat: "webp",
      imageQualityRatio: 0.8,
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ],
    };
    cachedStorageRules = defaultRules;
    return defaultRules;
  }

  const rules = data.value as unknown as StorageRules;
  cachedStorageRules = rules;
  return rules;
}

export function invalidateSystemConfigCache(): void {
  cachedR2Config = null;
  cachedS3Client = null;
  cachedStorageRules = null;
  lastFetchedTimestamp = 0;
}
