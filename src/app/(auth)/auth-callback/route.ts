import { NextResponse } from "next/server";
import { getSafeRedirectUrl } from "@/lib/auth/url";

export async function GET(request: Request) {
  const url = getSafeRedirectUrl("/dashboard", request);
  return NextResponse.redirect(url);
}
