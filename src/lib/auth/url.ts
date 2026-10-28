import { type NextRequest } from "next/server";

/**
 * Returns the absolute canonical base URL of the application.
 * Respects Cloudflare and reverse-proxy headers (x-forwarded-proto, x-forwarded-host)
 * and falls back to NEXT_PUBLIC_APP_URL or canonical https://nikahyu.my.id.
 * Never leaks internal reverse proxy origin (e.g. http://localhost:3600).
 */
export function getAppBaseUrl(request?: Request | NextRequest): string {
  if (request) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost || request.headers.get("host");

    if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      const proto = request.headers.get("x-forwarded-proto") || "https";
      return `${proto}://${host}`;
    }
  }

  return process.env.NEXT_PUBLIC_APP_URL || "https://nikahyu.my.id";
}

/**
 * Create a safe absolute URL for redirects that never targets internal localhost/127.0.0.1.
 */
export function getSafeRedirectUrl(pathname: string, request?: Request | NextRequest): URL {
  const base = getAppBaseUrl(request);
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(cleanPath, base);
}
