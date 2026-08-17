import crypto from "crypto";
import zlib from "zlib";

const ALGORITHM = "aes-256-cbc";

export function compressAndEncrypt(data: string, secretKey: string): { encryptedBuffer: Buffer; ivHex: string } {
  // Ensure key is 32 bytes
  const key = crypto.createHash("sha256").update(secretKey).digest();
  const iv = crypto.randomBytes(16);

  const compressed = zlib.gzipSync(Buffer.from(data, "utf-8"));
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);

  return {
    encryptedBuffer: encrypted,
    ivHex: iv.toString("hex"),
  };
}

export function decryptAndDecompress(encryptedBuffer: Buffer, ivHex: string, secretKey: string): string {
  const key = crypto.createHash("sha256").update(secretKey).digest();
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decompressedGzip = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

  const decompressedText = zlib.gunzipSync(decompressedGzip).toString("utf-8");
  return decompressedText;
}
