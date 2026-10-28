import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "nikahyuk_session";
function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.trim().length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL SECURITY ERROR: AUTH_SECRET must be set and at least 32 characters long in production"
      );
    }
  }
  return new TextEncoder().encode(
    secret || "nikahyuk_dev_temporary_fallback_secret_key_32_bytes_safe!"
  );
}

const encodedKey = getAuthSecret();

export async function updateSession(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let user: { role?: string; userType?: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, encodedKey, {
        algorithms: ["HS256"],
      });
      user = {
        role: payload.role as string,
        userType: payload.userType as string,
      };
    } catch (e) {
      console.error("MIDDLEWARE JWT ERROR:", e);
      // Invalid/expired token
      user = null;
    }
  }

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/vendor/dashboard");

  const isAdminRoute = pathname.startsWith("/admin");
  const isVendorRoute = pathname.startsWith("/vendor/dashboard");
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/vendor/login";

  // 0. API Route Protection (Khusus rute /api/*)
  if (pathname.startsWith("/api/")) {
    const isPublicApi =
      pathname.startsWith("/api/public") ||
      pathname.startsWith("/api/auth/login") ||
      pathname.startsWith("/api/auth/register") ||
      pathname.startsWith("/api/auth/logout") ||
      pathname.startsWith("/api/token/verify");

    if (isPublicApi) {
      return NextResponse.next();
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (pathname.startsWith("/api/admin")) {
      const isSuperadmin = user.role === "superadmin" || user.role === "admin";
      if (!isSuperadmin) {
        return NextResponse.json(
          { error: "Forbidden: Superadmin/Admin role required" },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  }

  // 1. Unauthenticated users trying to access protected routes
  if (!user && isProtectedRoute) {
    url.pathname = isVendorRoute ? "/vendor/login" : "/login";
    return NextResponse.redirect(url);
  }

  // 2. Admin Route Protection (hanya superadmin dan admin)
  if (user && isAdminRoute) {
    const isSuperadmin = user.role === "superadmin" || user.role === "admin";
    if (!isSuperadmin) {
      url.pathname = user.userType === "vendor" ? "/vendor/dashboard" : "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // 3. Logged-in users hitting Auth pages (/login, /register, /vendor/login)
  if (user && isAuthRoute) {
    const isSuperadmin = user.role === "superadmin" || user.role === "admin";
    const isVendor = user.userType === "vendor";

    if (isSuperadmin) {
      url.pathname = "/admin";
    } else if (isVendor) {
      url.pathname = "/vendor/dashboard";
    } else {
      url.pathname = "/dashboard";
    }

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
