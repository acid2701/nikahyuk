import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from "@/lib/utils/rate-limiter";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, pin } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimitKey = `${ip}:${token}`;

    const rateCheck = checkRateLimit(rateLimitKey, 5);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan PIN. Akses dikunci selama ${rateCheck.lockoutRemainingSeconds} detik.`,
        },
        { status: 429 }
      );
    }

    const supabase = await createClient();

    const { data: tokenRecord } = await supabase
      .from("shareable_tokens")
      .select("*")
      .eq("token_hash", token)
      .eq("is_active", true)
      .single();

    if (!tokenRecord) {
      return NextResponse.json({ error: "Token akses tidak valid atau telah dinonaktifkan." }, { status: 404 });
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: "Token akses telah kadaluwarsa." }, { status: 410 });
    }

    if (tokenRecord.pin_hash) {
      if (!pin) {
        return NextResponse.json({ error: "PIN diperlukan." }, { status: 401 });
      }

      const match = await bcrypt.compare(pin, tokenRecord.pin_hash);
      if (!match) {
        const failedResult = recordFailedAttempt(rateLimitKey, 5);
        if (failedResult.isLockedOut) {
          return NextResponse.json(
            { error: "PIN salah. Terlalu banyak percobaan, akses dikunci 15 menit." },
            { status: 429 }
          );
        }
        return NextResponse.json({ error: "PIN yang Anda masukkan salah." }, { status: 401 });
      }
    }

    clearRateLimit(rateLimitKey);

    const response = NextResponse.json({
      success: true,
      weddingId: tokenRecord.wedding_id,
      moduleAccess: tokenRecord.module_access,
    });

    response.cookies.set(`token_session_${token}`, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
