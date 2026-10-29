"use client";

import * as React from "react";
import imageCompression from "browser-image-compression";
import {
  UploadCloud,
  CheckCircle2,
  Loader2,
  FileText,
  Eye,
  Trash2,
  RefreshCw,
  Plus,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ImageCropModal } from "./image-crop-modal";

export interface UploadedFileMeta {
  r2_file_key: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  public_url?: string;
}

export interface DynamicRules {
  maxImageSizeMb: number;
  maxPdfSizeMb: number;
  targetImageFormat: string;
  imageQualityRatio: number;
  allowedMimeTypes: string[];
}

export interface MediaUploaderDropzoneProps {
  weddingId: string;
  folder: "invoices" | "contracts" | "proofs" | "documents" | "moodboard";
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  multiple?: boolean;
  onUploadSuccess: (meta: UploadedFileMeta) => void;
  onMultiUploadChange?: (files: UploadedFileMeta[]) => void;
  onUploadError?: (errorMessage: string) => void;
  isProcessing?: boolean;
  className?: string;
}

export function MediaUploaderDropzone({
  weddingId,
  folder,
  maxSizeBytes,
  allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ],
  multiple = false,
  onUploadSuccess,
  onMultiUploadChange,
  onUploadError,
  isProcessing = false,
  className,
}: MediaUploaderDropzoneProps) {
  const [uploading, setUploading] = React.useState(false);
  const [progressText, setProgressText] = React.useState("");
  const [dragActive, setDragActive] = React.useState(false);
  const [uploadedList, setUploadedList] = React.useState<UploadedFileMeta[]>([]);
  const [replaceIndex, setReplaceIndex] = React.useState<number | null>(null);

  // IMAGE CROP STATE
  const [pendingCropFile, setPendingCropFile] = React.useState<File | null>(null);
  const [cropModalOpen, setCropModalOpen] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // DYNAMIC STORAGE RULES FETCHED FROM ADMIN PANEL (POSTGRESQL SYSTEM_SETTINGS)
  const [dynamicRules, setDynamicRules] = React.useState<DynamicRules>({
    maxImageSizeMb: 2,
    maxPdfSizeMb: 3,
    targetImageFormat: "webp",
    imageQualityRatio: 0.8,
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
  });

  React.useEffect(() => {
    async function fetchDynamicRules() {
      try {
        const res = await fetch("/api/storage/rules");
        if (res.ok) {
          const json = await res.json();
          if (json.rules) {
            setDynamicRules(json.rules);
          }
        }
      } catch (e) {
        console.warn("Failed fetching dynamic storage rules, using fallback:", e);
      }
    }
    fetchDynamicRules();
  }, []);

  const effectiveMaxImageMb = dynamicRules.maxImageSizeMb || 2;
  const effectiveMaxPdfMb = dynamicRules.maxPdfSizeMb || 3;
  const allowsPdf = allowedMimeTypes.includes("application/pdf");
  const allowsImage = allowedMimeTypes.some((t) => t.startsWith("image/"));

  async function processAndUploadFile(file: File) {
    const isPdf = file.type === "application/pdf";
    const allowedTypes = dynamicRules.allowedMimeTypes || allowedMimeTypes;

    if (!allowedTypes.includes(file.type)) {
      const err = `Tipe file '${file.type}' tidak diizinkan. Mohon pilih format gambar (JPG/PNG/WebP) atau PDF.`;
      onUploadError?.(err);
      return;
    }

    const maxMb = isPdf ? effectiveMaxPdfMb : effectiveMaxImageMb;
    const maxBytes = maxSizeBytes || maxMb * 1024 * 1024;

    if (file.size > maxBytes) {
      const err = `Ukuran file (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal ${isPdf ? "PDF" : "Gambar"} ${maxMb} MB sesuai aturan Admin.`;
      onUploadError?.(err);
      return;
    }

    setUploading(true);

    try {
      let finalFile: File = file;

      if (file.type.startsWith("image/")) {
        const targetFormat = dynamicRules.targetImageFormat || "webp";
        const qualityRatio = dynamicRules.imageQualityRatio || 0.8;

        setProgressText(`Mengompresi gambar ke ${targetFormat.toUpperCase()} (Kualitas ${Math.round(qualityRatio * 100)}%)...`);
        try {
          const options = {
            maxSizeMB: effectiveMaxImageMb,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: qualityRatio,
            fileType: `image/${targetFormat}`,
          };
          const compressedBlob = await imageCompression(file, options);
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + `.${targetFormat}`;
          finalFile = new File([compressedBlob], newFileName, {
            type: `image/${targetFormat}`,
          });
        } catch (compressionErr) {
          console.warn("Client-side compression warning, uploading original:", compressionErr);
        }
      }

      setProgressText("Meminta URL pengunggahan aman R2...");
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
        const presignErr = await presignRes.json();
        throw new Error(presignErr.error || "Gagal mendapatkan izin unggah ke R2");
      }

      const { presignedUrl, r2FileKey, publicUrl } = await presignRes.json();

      let uploadSuccess = false;
      let r2KeyResult = r2FileKey;
      let publicUrlResult = publicUrl;

      setProgressText("Mengunggah ke Cloudflare R2...");
      try {
        const uploadRes = await fetch(presignedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": finalFile.type,
          },
          body: finalFile,
        });

        if (uploadRes.ok) {
          uploadSuccess = true;
        }
      } catch (corsOrNetworkErr) {
        console.warn("Direct R2 upload CORS block detected, switching to server proxy fallback...", corsOrNetworkErr);
      }

      // SERVER-SIDE PROXY FALLBACK (100% IMMUNE TO CORS)
      if (!uploadSuccess) {
        setProgressText("Mengunggah via Server Proxy (Cloudflare R2)...");
        const proxyFormData = new FormData();
        proxyFormData.append("file", finalFile);
        proxyFormData.append("weddingId", weddingId);
        proxyFormData.append("folder", folder);

        const proxyRes = await fetch("/api/storage/upload", {
          method: "POST",
          body: proxyFormData,
        });

        if (!proxyRes.ok) {
          const pErr = await proxyRes.json();
          throw new Error(pErr.error || "Gagal mengunggah file via server proxy");
        }

        const pData = await proxyRes.json();
        r2KeyResult = pData.r2FileKey;
        publicUrlResult = pData.publicUrl;
      }

      const meta: UploadedFileMeta = {
        r2_file_key: r2KeyResult,
        file_name: finalFile.name,
        file_size_bytes: finalFile.size,
        mime_type: finalFile.type,
        public_url: publicUrlResult,
      };

      if (replaceIndex !== null) {
        // REPLACE SINGLE FILE AT INDEX
        setUploadedList((prev) => {
          const updated = [...prev];
          updated[replaceIndex] = meta;
          onMultiUploadChange?.(updated);
          return updated;
        });
        setReplaceIndex(null);
      } else if (multiple) {
        // ADD TO MULTI-FILE LIST
        setUploadedList((prev) => {
          const updated = [...prev, meta];
          onMultiUploadChange?.(updated);
          return updated;
        });
      } else {
        // SINGLE FILE MODE
        setUploadedList([meta]);
      }

      onUploadSuccess(meta);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah file.";
      onUploadError?.(msg);
    } finally {
      setUploading(false);
      setProgressText("");
    }
  }

  function handleFileSelected(file: File) {
    if (file.type.startsWith("image/")) {
      // Trigger interactive crop modal for images
      setPendingCropFile(file);
      setCropModalOpen(true);
    } else {
      // Documents/PDFs proceed directly
      processAndUploadFile(file);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
    // Reset input so same file can be re-selected if canceled
    e.target.value = "";
  }

  function handleRemoveFile(index: number) {
    setUploadedList((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      onMultiUploadChange?.(updated);
      return updated;
    });
  }

  function handleTriggerReplace(index: number, e: React.MouseEvent) {
    e.stopPropagation();
    setReplaceIndex(index);
    fileInputRef.current?.click();
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
      handleFileSelected(e.dataTransfer.files[0]);
    }
  }

  return (
    <div className="space-y-3 w-full text-xs">
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedMimeTypes.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* LIST OF UPLOADED FILES WITH 1-CLICK PREVIEW, REPLACE, & REMOVE ACTIONS BEFORE SAVING */}
      {uploadedList.length > 0 && (
        <div className="space-y-2 flex flex-col">
          <span className="font-semibold text-foreground text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <FileCheck className="h-4 w-4" /> Berkas Terunggah di R2 ({uploadedList.length}):
            </span>
            <span className="text-[10px] text-muted-foreground">Siap Disimpan</span>
          </span>

          {uploadedList.map((item, idx) => (
            <div
              key={item.r2_file_key + idx}
              className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-xs leading-snug truncate">
                    {item.file_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {(item.file_size_bytes / 1024).toFixed(1)} KB • {item.mime_type}
                  </p>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-1.5 shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-500/20">
                <Badge className="bg-emerald-600 text-white text-[9px] px-2 py-0.5">
                  R2 Active
                </Badge>

                {/* 👁️ PREVIEW BUTTON */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  asChild
                  className="h-7 text-[10px] px-2 gap-1 border-border hover:bg-muted font-semibold"
                >
                  <a
                    href={item.public_url || `/api/storage/presign?key=${encodeURIComponent(item.r2_file_key)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Eye className="h-3 w-3 text-primary" /> Lihat
                  </a>
                </Button>

                {/* 🔄 REPLACE BUTTON */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleTriggerReplace(idx, e)}
                  title="Ganti berkas ini"
                  className="h-7 text-[10px] px-2 gap-1 border-border hover:bg-muted font-semibold"
                >
                  <RefreshCw className="h-3 w-3 text-amber-500" /> Ganti
                </Button>

                {/* 🗑️ REMOVE DRAFT BUTTON */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveFile(idx)}
                  title="Hapus berkas ini dari antrean"
                  className="h-7 w-7 p-0 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DROPZONE DRAG & DROP AREA */}
      {(multiple || uploadedList.length === 0) && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center transition-colors cursor-pointer bg-card/50 hover:bg-accent/40",
            dragActive && "border-primary bg-primary/5",
            (uploading || isProcessing) && "pointer-events-none opacity-80",
            className
          )}
          onClick={() => {
            setReplaceIndex(null);
            fileInputRef.current?.click();
          }}
        >
          {uploading || isProcessing ? (
            <div className="flex flex-col items-center space-y-2 py-3">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">{progressText}</p>
              <p className="text-xs text-muted-foreground">
                Mohon tunggu hingga proses pengunggahan selesai...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 py-1">
              <UploadCloud className="h-7 w-7 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {uploadedList.length > 0 && multiple ? (
                    <span className="text-amber-600 font-semibold flex items-center gap-1 justify-center">
                      <Plus className="h-4 w-4" /> Tambah Berkas Lain ke Antrean
                    </span>
                  ) : (
                    <>
                      Tarik & Lepas file di sini, atau{" "}
                      <span className="text-primary font-semibold hover:underline">
                        pilih file
                      </span>
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {allowsImage && allowsPdf ? (
                    `Mendukung Gambar (maks. ${effectiveMaxImageMb} MB) & Dokumen PDF (maks. ${effectiveMaxPdfMb} MB)`
                  ) : allowsImage ? (
                    `Format Gambar (maks. ${effectiveMaxImageMb} MB) • Auto-Crop & WebP`
                  ) : allowsPdf ? (
                    `Dokumen PDF (maks. ${effectiveMaxPdfMb} MB)`
                  ) : (
                    `Maksimal ${effectiveMaxImageMb} MB`
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* INTERACTIVE CROP MODAL BEFORE UPLOAD */}
      <ImageCropModal
        open={cropModalOpen}
        imageFile={pendingCropFile}
        onConfirmCrop={(croppedFile) => {
          setCropModalOpen(false);
          setPendingCropFile(null);
          processAndUploadFile(croppedFile);
        }}
        onUseOriginal={(originalFile) => {
          setCropModalOpen(false);
          setPendingCropFile(null);
          processAndUploadFile(originalFile);
        }}
        onCancel={() => {
          setCropModalOpen(false);
          setPendingCropFile(null);
          setReplaceIndex(null);
        }}
      />
    </div>
  );
}
