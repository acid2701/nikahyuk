import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionToken } from "@/lib/auth/session";
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from "@/lib/utils/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const rateLimitKey = `login:${ip}:${cleanEmail}`;
    const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan masuk yang gagal. Mohon tunggu ${rateCheck.lockoutRemainingSeconds} detik lagi.`,
        },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      recordFailedAttempt(rateLimitKey, 5, 15 * 60 * 1000);
      return NextResponse.json(
        { error: "Email atau kata sandi tidak sesuai." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const failStatus = recordFailedAttempt(rateLimitKey, 5, 15 * 60 * 1000);
      if (failStatus.isLockedOut) {
        return NextResponse.json(
          {
            error: "Terlalu banyak percobaan salah. Akun dikunci sementara selama 15 menit demi keamanan.",
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "Email atau kata sandi tidak sesuai." },
        { status: 401 }
      );
    }

    clearRateLimit(rateLimitKey);

    // Set cookie
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      userType: user.userType,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        userType: user.userType,
      },
    });

    response.cookies.set("nikahyuk_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terjadi kesalahan saat masuk." },
      { status: 500 }
    );
  }
}
