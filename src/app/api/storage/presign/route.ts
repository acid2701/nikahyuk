import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDynamicStorageRules } from "@/lib/cloudflare-r2/dynamic-config";
import { generatePresignedUploadUrl } from "@/lib/cloudflare-r2/presign-helper";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { weddingId, folder, fileName, fileSize, mimeType } = body;

    if (!weddingId || !folder || !fileName || !fileSize || !mimeType) {
      return NextResponse.json(
        { error: "Parameter tidak lengkap (weddingId, folder, fileName, fileSize, mimeType wajib diisi)." },
        { status: 400 }
      );
    }

    const rules = await getDynamicStorageRules();

    if (
      rules.allowedMimeTypes.length > 0 &&
      !rules.allowedMimeTypes.includes(mimeType)
    ) {
      return NextResponse.json(
        {
          error: `Tipe file '${mimeType}' tidak diizinkan. Tipe yang diizinkan: ${rules.allowedMimeTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const isPdf = mimeType === "application/pdf";
    const maxMb = isPdf ? rules.maxPdfSizeMb : rules.maxImageSizeMb;
    const maxBytes = maxMb * 1024 * 1024;

    if (fileSize > maxBytes) {
      return NextResponse.json(
        {
          error: `Ukuran file (${(fileSize / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal ${maxMb} MB.`,
        },
        { status: 400 }
      );
    }

    const presignedData = await generatePresignedUploadUrl(
      weddingId,
      folder,
      fileName,
      mimeType
    );

    return NextResponse.json({ success: true, ...presignedData });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
