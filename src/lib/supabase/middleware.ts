import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  // 2. Admin Route Protection
  if (user && isAdminRoute) {
    const isSuperadmin =
      user.app_metadata?.role === "superadmin" ||
      user.user_metadata?.role === "superadmin";

    if (!isSuperadmin) {
      url.pathname = user.user_metadata?.user_type === "vendor" ? "/vendor/dashboard" : "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // 3. Logged-in users hitting Auth pages (/login, /register, /vendor/login)
  if (user && isAuthRoute) {
    const isSuperadmin =
      user.app_metadata?.role === "superadmin" ||
      user.user_metadata?.role === "superadmin";
    const isVendor = user.user_metadata?.user_type === "vendor";

    if (isSuperadmin) {
      url.pathname = "/admin";
    } else if (isVendor) {
      url.pathname = "/vendor/dashboard";
    } else {
      url.pathname = "/dashboard";
    }

    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
