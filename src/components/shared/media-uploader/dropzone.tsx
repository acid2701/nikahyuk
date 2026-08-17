"use client";

import * as React from "react";
import imageCompression from "browser-image-compression";
import { UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UploadedFileMeta {
  r2_file_key: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  public_url?: string;
}

export interface MediaUploaderDropzoneProps {
  weddingId: string;
  folder: "invoices" | "contracts" | "proofs" | "documents";
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  onUploadSuccess: (meta: UploadedFileMeta) => void;
  onUploadError?: (errorMessage: string) => void;
  isProcessing?: boolean;
  className?: string;
}

export function MediaUploaderDropzone({
  weddingId,
  folder,
  maxSizeBytes = 10 * 1024 * 1024,
  allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ],
  onUploadSuccess,
  onUploadError,
  isProcessing = false,
  className,
}: MediaUploaderDropzoneProps) {
  const [uploading, setUploading] = React.useState(false);
  const [progressText, setProgressText] = React.useState("");
  const [dragActive, setDragActive] = React.useState(false);
  const [lastUploaded, setLastUploaded] = React.useState<UploadedFileMeta | null>(
    null
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function processAndUploadFile(file: File) {
    if (!allowedMimeTypes.includes(file.type)) {
      const err = `Tipe file '${file.type}' tidak diizinkan. Mohon pilih format gambar atau PDF.`;
      onUploadError?.(err);
      return;
    }

    if (file.size > maxSizeBytes) {
      const err = `Ukuran file (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas ${(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB.`;
      onUploadError?.(err);
      return;
    }

    setUploading(true);
    setLastUploaded(null);

    try {
      let finalFile: File = file;

      if (file.type.startsWith("image/")) {
        setProgressText("Mengompresi gambar ke WebP...");
        try {
          const options = {
            maxSizeMB: 2,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: "image/webp",
          };
          const compressedBlob = await imageCompression(file, options);
          const webpName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          finalFile = new File([compressedBlob], webpName, {
            type: "image/webp",
          });
        } catch (compressionErr) {
          console.warn("Client-side compression warning, uploading original:", compressionErr);
        }
      }

      setProgressText("Meminta URL pengunggahan aman...");
      const presignRes = await fetch("/api/storage/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weddingId,
          folder,
          fileName: finalFile.name,
          fileSize: finalFile.size,
          mimeType: finalFile.type,
        }),
      });

      if (!presignRes.ok) {
        const errJson = await presignRes.json();
        throw new Error(errJson.error || "Gagal mendapatkan presigned URL");
      }

      const { presignedUrl, r2FileKey, publicUrl } = await presignRes.json();

      setProgressText("Mengunggah langsung ke Cloudflare R2...");
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": finalFile.type,
        },
        body: finalFile,
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload S3 gagal (HTTP ${uploadRes.status})`);
      }

      const meta: UploadedFileMeta = {
        r2_file_key: r2FileKey,
        file_name: finalFile.name,
        file_size_bytes: finalFile.size,
        mime_type: finalFile.type,
        public_url: publicUrl,
      };

      setLastUploaded(meta);
      onUploadSuccess(meta);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah file.";
      onUploadError?.(msg);
    } finally {
      setUploading(false);
      setProgressText("");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      processAndUploadFile(e.target.files[0]);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAndUploadFile(e.dataTransfer.files[0]);
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer bg-card/50 hover:bg-accent/40",
        dragActive && "border-primary bg-primary/5",
        (uploading || isProcessing) && "pointer-events-none opacity-80",
        className
      )}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedMimeTypes.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />

      {uploading || isProcessing ? (
        <div className="flex flex-col items-center space-y-2 py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">{progressText}</p>
          <p className="text-xs text-muted-foreground">
            Mohon tunggu hingga proses selesai...
          </p>
        </div>
      ) : lastUploaded ? (
        <div className="flex flex-col items-center space-y-2 py-2">
          <CheckCircle2 className="h-8 w-8 text-success" />
          <p className="text-sm font-medium text-foreground">
            Berhasil Diunggah: {lastUploaded.file_name}
          </p>
          <p className="text-xs text-muted-foreground">
            {(lastUploaded.file_size_bytes / 1024).toFixed(1)} KB • Klik untuk mengunggah file baru
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2 py-2">
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Tarik & Lepas file di sini, atau{" "}
              <span className="text-primary font-semibold hover:underline">
                pilih file
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Mendukung Gambar (JPG, PNG, WebP) & Dokumen PDF (Maksimal {(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
