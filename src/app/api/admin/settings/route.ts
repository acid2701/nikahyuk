import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { invalidateSystemConfigCache } from "@/lib/cloudflare-r2/dynamic-config";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "superadmin" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Superadmin access required" }, { status: 403 });
  }

  const rows = await prisma.systemSetting.findMany();
  const data = rows.map((r) => ({
    id: r.id,
    key: r.key,
    value: r.value,
    updated_at: r.updatedAt.toISOString(),
  }));

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  return PUT(request);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "superadmin" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Superadmin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || !value) {
      return NextResponse.json(
        { error: "Key and value are required" },
        { status: 400 }
      );
    }

    const row = await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    invalidateSystemConfigCache();

    // Invalidate whole Next.js layout cache so branding changes apply globally & instantly
    if (key === "app_branding_config") {
      revalidatePath("/", "layout");
    }

    return NextResponse.json({
      success: true,
      data: {
        id: row.id,
        key: row.key,
        value: row.value,
        updated_at: row.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
