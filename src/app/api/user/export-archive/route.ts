import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
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

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch data for CSV tables
    const guests = await prisma.guest.findMany({ where: { weddingId } });
    const vendors = await prisma.vendor.findMany({ where: { weddingId } });
    const weddingEvents = await prisma.weddingEvent.findMany({
      where: { weddingId },
      include: {
        rundowns: true,
        budgetItems: true,
        giftsLog: true,
      },
    });

    const rundowns = weddingEvents.flatMap((e) => e.rundowns);
    const budgetItems = weddingEvents.flatMap((e) => e.budgetItems);
    const gifts = weddingEvents.flatMap((e) => e.giftsLog);

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
    const readmeText = `NikahYuk — Official Data Export Archive\nExport Date: ${new Date().toISOString()}\nWedding ID: ${weddingId}\nUser ID: ${user.userId}\n`;
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
