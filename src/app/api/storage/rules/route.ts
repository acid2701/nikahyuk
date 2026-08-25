import { NextResponse } from "next/server";
import { getDynamicStorageRules } from "@/lib/cloudflare-r2/dynamic-config";

export async function GET() {
  try {
    const rules = await getDynamicStorageRules();
    return NextResponse.json({ success: true, rules });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        rules: {
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
        },
      },
      { status: 200 }
    );
  }
}
