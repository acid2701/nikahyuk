import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface PublicAuthConfig {
  googleEnabled: boolean;
  appBaseUrl: string;
  googleClientId: string;
}

export async function GET() {
  const defaultConfig: PublicAuthConfig = {
    googleEnabled: true,
    appBaseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    googleClientId: "",
  };

  try {
    const supabase = await createClient();

    const { data: row } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "auth_provider_config")
      .maybeSingle();

    if (row && row.value) {
      const val = row.value as Record<string, unknown>;
      return NextResponse.json({
        config: {
          googleEnabled: typeof val.googleEnabled === "boolean" ? val.googleEnabled : true,
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
