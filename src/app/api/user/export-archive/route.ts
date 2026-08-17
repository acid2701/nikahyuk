import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as archiverModule from "archiver";
import { stringify } from "csv-stringify/sync";
import { PassThrough } from "stream";

const archiver = (archiverModule as any).default || archiverModule;

export async function GET(req: NextRequest) {
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

    // Fetch data for CSV tables
    const { data: guests } = await supabase.from("guests").select("*").eq("wedding_id", weddingId);
    const { data: vendors } = await supabase.from("vendors").select("*").eq("wedding_id", weddingId);
    const { data: weddingEvents } = await supabase.from("wedding_events").select("id").eq("wedding_id", weddingId);

    const eventIds = (weddingEvents || []).map((e) => e.id);

    const { data: rundowns } = await supabase.from("rundowns").select("*").in("event_id", eventIds.length > 0 ? eventIds : ["none"]);
    const { data: budgetItems } = await supabase.from("budget_items").select("*").in("event_id", eventIds.length > 0 ? eventIds : ["none"]);
    const { data: gifts } = await supabase.from("gifts_log").select("*").in("event_id", eventIds.length > 0 ? eventIds : ["none"]);

    // Generate CSV strings
    const guestsCsv = stringify(guests || [], { header: true });
    const vendorsCsv = stringify(vendors || [], { header: true });
    const rundownsCsv = stringify(rundowns || [], { header: true });
    const budgetCsv = stringify(budgetItems || [], { header: true });
    const giftsCsv = stringify(gifts || [], { header: true });

    const archive = archiver("zip", { zlib: { level: 9 } });
    const passThrough = new PassThrough();

    archive.pipe(passThrough);

    // Append CSV files
    archive.append(guestsCsv, { name: "csv/guests.csv" });
    archive.append(vendorsCsv, { name: "csv/vendors.csv" });
    archive.append(rundownsCsv, { name: "csv/rundowns.csv" });
    archive.append(budgetCsv, { name: "csv/budget_items.csv" });
    archive.append(giftsCsv, { name: "csv/gifts_log.csv" });

    // Append README info
    const readmeText = `NikahYuk — Official Data Export Archive\nExport Date: ${new Date().toISOString()}\nWedding ID: ${weddingId}\nUser ID: ${user.id}\n`;
    archive.append(readmeText, { name: "README.txt" });

    await archive.finalize();

    const responseStream = new ReadableStream({
      start(controller) {
        passThrough.on("data", (chunk) => controller.enqueue(chunk));
        passThrough.on("end", () => controller.close());
        passThrough.on("error", (err) => controller.error(err));
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="nikahyuk-backup-${weddingId}.zip"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Export failed" },
      { status: 500 }
    );
  }
}
