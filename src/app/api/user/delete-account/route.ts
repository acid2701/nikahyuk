import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deletePhysicalR2File } from "@/lib/cloudflare-r2/cleanup-helper";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const weddingId = searchParams.get("weddingId");

    if (!weddingId) {
      return NextResponse.json({ error: "weddingId diperlukan" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the wedding workspace
    const { data: wedding } = await supabase
      .from("weddings")
      .select("id, created_by")
      .eq("id", weddingId)
      .single();

    if (!wedding || wedding.created_by !== user.id) {
      return NextResponse.json({ error: "Hanya pemilik workspace (owner) yang dapat menghapus workspace." }, { status: 403 });
    }

    // Cleanup vendor R2 documents
    const { data: vendors } = await supabase.from("vendors").select("id").eq("wedding_id", weddingId);
    const vendorIds = (vendors || []).map((v) => v.id);

    if (vendorIds.length > 0) {
      const { data: docs } = await supabase.from("vendor_documents").select("r2_file_key").in("vendor_id", vendorIds);
      for (const doc of docs || []) {
        if (doc.r2_file_key) {
          await deletePhysicalR2File(doc.r2_file_key);
        }
      }
    }

    // Delete wedding record (Cascades DB records)
    const { error: delErr } = await supabase.from("weddings").delete().eq("id", weddingId);

    if (delErr) {
      throw new Error(delErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Workspace dan seluruh data penyimpanan Cloudflare R2 telah dihapus permanen.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Deletion failed" },
      { status: 500 }
    );
  }
}
