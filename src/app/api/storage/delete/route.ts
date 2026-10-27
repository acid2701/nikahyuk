import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { deletePhysicalR2File } from "@/lib/cloudflare-r2/cleanup-helper";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { r2FileKey } = body;

    if (!r2FileKey) {
      return NextResponse.json(
        { error: "r2FileKey wajib diisi." },
        { status: 400 }
      );
    }

    await deletePhysicalR2File(r2FileKey);

    return NextResponse.json({
      success: true,
      message: `File fisik '${r2FileKey}' berhasil dihapus dari Cloudflare R2.`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
