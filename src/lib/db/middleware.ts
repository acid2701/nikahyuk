import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "nikahyuk_session";
const AUTH_SECRET_STRING =
  process.env.AUTH_SECRET || "nikahyuk_default_auth_secret_key_32_bytes_2026!";
const encodedKey = new TextEncoder().encode(AUTH_SECRET_STRING);

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
    } catch {
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
