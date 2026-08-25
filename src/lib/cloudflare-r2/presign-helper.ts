import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getDynamicR2Client } from "./dynamic-config";

export interface PresignedUrlResult {
  presignedUrl: string;
  r2FileKey: string;
  publicUrl: string;
}

export async function generatePresignedUploadUrl(
  weddingId: string,
  folder: "invoices" | "contracts" | "proofs" | "documents",
  fileName: string,
  mimeType: string
): Promise<PresignedUrlResult> {
  const { s3, config } = await getDynamicR2Client();

  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const r2FileKey = `${weddingId}/${folder}/${timestamp}-${sanitizedFileName}`;

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: r2FileKey,
    ContentType: mimeType,
  });

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  const rawCdn = (config.publicCdnDomain || "").replace(/\/$/, "");
  const publicUrl = rawCdn
    ? rawCdn.startsWith("http")
      ? `${rawCdn}/${r2FileKey}`
      : `https://${rawCdn}/${r2FileKey}`
    : `https://${config.bucketName}.${config.accountId}.r2.cloudflarestorage.com/${r2FileKey}`;

  return {
    presignedUrl,
    r2FileKey,
    publicUrl,
  };
}
