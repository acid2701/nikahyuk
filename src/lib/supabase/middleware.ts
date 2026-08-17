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
    pathname.startsWith("/admin");

  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  if (!user && isProtectedRoute) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAdminRoute) {
    const isSuperadmin =
      user.app_metadata?.role === "superadmin" ||
      user.user_metadata?.role === "superadmin";

    if (!isSuperadmin) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  if (user && isAuthRoute) {
    const isSuperadmin =
      user.app_metadata?.role === "superadmin" ||
      user.user_metadata?.role === "superadmin";

    url.pathname = isSuperadmin ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
