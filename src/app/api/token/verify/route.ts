import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const tokenRecord = await prisma.shareableToken.findFirst({
      where: {
        tokenHash: token,
        isActive: true,
      },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Token akses tidak valid atau telah dinonaktifkan." }, { status: 404 });
    }

    if (new Date(tokenRecord.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Token akses telah kadaluwarsa." }, { status: 410 });
    }

    if (tokenRecord.pinHash) {
      if (!pin) {
        return NextResponse.json({ error: "PIN diperlukan." }, { status: 401 });
      }

      const match = await bcrypt.compare(pin, tokenRecord.pinHash);
      if (!match) {
        const failedResult = recordFailedAttempt(rateLimitKey, 5);
        if (failedResult.isLockedOut) {
          return NextResponse.json(
            { error: "PIN salah. Terlalu banyak percobaan, akses dikunci 15 menit." },
            { status: 429 }
          );
        }

        return NextResponse.json(
          {
            error: "PIN salah. Silakan coba kembali.",
          },
          { status: 401 }
        );
      }
    }

    clearRateLimit(rateLimitKey);

    return NextResponse.json({
      success: true,
      weddingId: tokenRecord.weddingId,
      moduleAccess: tokenRecord.moduleAccess,
      hideInternalNotes: tokenRecord.hideInternalNotes,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
