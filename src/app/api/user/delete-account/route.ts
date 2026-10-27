import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { deletePhysicalR2File } from "@/lib/cloudflare-r2/cleanup-helper";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const weddingId = searchParams.get("weddingId");

    if (!weddingId) {
      return NextResponse.json({ error: "weddingId diperlukan" }, { status: 400 });
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the wedding workspace
    const wedding = await prisma.wedding.findUnique({
      where: { id: weddingId },
      select: { id: true, createdBy: true },
    });

    if (!wedding || wedding.createdBy !== user.userId) {
      return NextResponse.json({ error: "Hanya pemilik workspace (owner) yang dapat menghapus workspace." }, { status: 403 });
    }

    // Cleanup vendor R2 documents
    const vendors = await prisma.vendor.findMany({
      where: { weddingId },
      include: { documents: true },
    });

    for (const v of vendors) {
      for (const doc of v.documents) {
        if (doc.r2FileKey) {
          await deletePhysicalR2File(doc.r2FileKey);
        }
      }
    }

    // Delete wedding record (Cascades DB records via Prisma onDelete: Cascade)
    await prisma.wedding.delete({
      where: { id: weddingId },
    });

    return NextResponse.json({
      success: true,
      message: "Workspace pernikahan berhasil dihapus secara permanen.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
