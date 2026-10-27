import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setAuthCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, groomName, brideName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan gunakan email lain atau masuk." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        fullName: fullName || null,
        role: "user",
        userType: "organizer",
      },
    });

    // Auto-create wedding jika pengantin pria & wanita diisi
    if (groomName && brideName) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const weddingSlug = `${groomName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${brideName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${randomSuffix}`;

      await prisma.wedding.create({
        data: {
          createdBy: user.id,
          groomName,
          brideName,
          weddingSlug,
        },
      });
    }

    await setAuthCookie({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      userType: user.userType,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        userType: user.userType,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terjadi kesalahan saat pendaftaran." },
      { status: 500 }
    );
  }
}
