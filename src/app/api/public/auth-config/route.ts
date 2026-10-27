import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface PublicAuthConfig {
  googleEnabled: boolean;
  appBaseUrl: string;
  googleClientId: string;
}

export async function GET() {
  const defaultConfig: PublicAuthConfig = {
    googleEnabled: false,
    appBaseUrl: process.env.NEXT_PUBLIC_APP_URL || "https://nikahyuk.pilihmenumu.com",
    googleClientId: "",
  };

  try {
    const row = await prisma.systemSetting.findUnique({
      where: { key: "auth_provider_config" },
    });

    if (row && row.value) {
      const val = row.value as Record<string, unknown>;
      return NextResponse.json({
        config: {
          googleEnabled: typeof val.googleEnabled === "boolean" ? val.googleEnabled : false,
          appBaseUrl: (val.appBaseUrl as string) || defaultConfig.appBaseUrl,
          googleClientId: (val.googleClientId as string) || "",
        },
      });
    }

    return NextResponse.json({ config: defaultConfig });
  } catch {
    return NextResponse.json({ config: defaultConfig });
  }
}
