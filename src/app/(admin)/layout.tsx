import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getAppBranding } from "@/lib/branding";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileDrawer } from "@/components/admin/admin-mobile-drawer";
import { AdminNotificationBell } from "@/components/admin/admin-notification-bell";
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";
import { Crown, LogOut } from "lucide-react";
import { Suspense } from "react";
import AdminLoading from "./loading";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getAppBranding();
  return {
    title: `Control Plane - ${branding.appName}`,
    description: "Pengaturan infrastruktur dinamis dan rbac global.",
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isAdminOrSuperadmin =
    user.role === "superadmin" || user.role === "admin";

  if (!isAdminOrSuperadmin) {
    redirect("/dashboard");
  }

  const email = user.email || "superadmin@nikahyu.my.id";
  const branding = await getAppBranding();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:block w-64 shrink-0 h-full">
        <AdminSidebar
          userEmail={email}
          appName={branding.appName}
          logoUrl={branding.logoUrl}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Admin Header */}
        <header className="h-14 border-b border-border/60 bg-background/95 backdrop-blur-xs px-3 sm:px-6 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center space-x-2">
            <AdminMobileDrawer userEmail={email} appName={branding.appName} logoUrl={branding.logoUrl} />
            <div className="p-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <Crown className="h-4 w-4" />
            </div>
            <div className="flex items-center space-x-1.5 font-mono text-xs">
              <span className="font-semibold text-foreground">Control Plane</span>
              <span className="text-muted-foreground/50">/</span>
              <span className="text-muted-foreground hidden sm:inline">Infrastructure & Governance</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeToggle />
            <form action="/api/auth/logout" method="POST" className="sm:hidden">
              <button
                type="submit"
                className="h-8 px-2.5 rounded-full text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 flex items-center gap-1 cursor-pointer"
                title="Keluar dari Akun"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </form>
            <AdminNotificationBell />
            <div className="hidden sm:block text-right pl-3 border-l border-border/50">
              <p className="text-xs font-semibold text-foreground leading-none">{email}</p>
              <div className="flex items-center justify-end space-x-1.5 mt-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff385c]/10 text-[#ff385c] border border-[#ff385c]/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff385c] animate-pulse" />
                  SUPERADMIN
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-6xl w-full mx-auto space-y-6 min-w-0">
          <Suspense fallback={<AdminLoading />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
