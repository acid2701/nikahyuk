import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const row = await prisma.systemSetting.findUnique({
      where: { key: "qris_donasi_config" },
    });

    if (row && row.value) {
      return NextResponse.json({ config: row.value });
    }

    return NextResponse.json({
      config: {
        isActive: true,
        merchantName: "NikahYuk Platform - Donasi Sukarela",
        qrisImageUrl:
          "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Donasi%20NikahYuk%20QRIS%20Tip%20Jar",
        notes: "Menerima GoPay, OVO, ShopeePay, DANA, BCA, Mandiri, BRI, BNI (QRIS Standard)",
      },
    });
  } catch {
    return NextResponse.json({
      config: {
        isActive: true,
        merchantName: "NikahYuk Platform - Donasi Sukarela",
        qrisImageUrl:
          "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Donasi%20NikahYuk%20QRIS%20Tip%20Jar",
        notes: "Menerima GoPay, OVO, ShopeePay, DANA, BCA, Mandiri, BRI, BNI (QRIS Standard)",
      },
    });
  }
}
