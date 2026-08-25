import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileDrawer } from "@/components/admin/admin-mobile-drawer";
import { AdminNotificationBell } from "@/components/admin/admin-notification-bell";
import { Crown } from "lucide-react";

export const metadata: Metadata = {
  title: "Superadmin Control Plane - NikahYuk",
  description: "Pengaturan infrastruktur dinamis dan rbac global.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userRole = user.app_metadata?.role || user.user_metadata?.role;
  const isAdminOrSuperadmin =
    userRole === "superadmin" || userRole === "admin";

  if (!isAdminOrSuperadmin) {
    redirect("/dashboard");
  }

  const email = user.email || "superadmin@nikahyuk.com";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <AdminMobileDrawer userEmail={email} />
      <AdminSidebar userEmail={email} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Admin Header */}
        <header className="h-14 border-b border-border/80 bg-card px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div className="flex items-center space-x-2">
            <Crown className="h-4 w-4 text-amber-500 fill-amber-500/20" />
            <span className="font-serif font-bold text-sm text-foreground">
              NikahYuk Superadmin Control Plane
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <AdminNotificationBell />
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-foreground leading-none">{email}</p>
              <p className="text-[10px] text-muted-foreground">Role: Superadmin</p>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
