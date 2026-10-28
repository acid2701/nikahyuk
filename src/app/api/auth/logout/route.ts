import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth/session";
import { getSafeRedirectUrl } from "@/lib/auth/url";

export async function POST(request: Request) {
  await clearAuthCookie();
  const url = getSafeRedirectUrl("/login", request);
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(request: Request) {
  await clearAuthCookie();
  const url = getSafeRedirectUrl("/login", request);
  return NextResponse.redirect(url, { status: 303 });
}
