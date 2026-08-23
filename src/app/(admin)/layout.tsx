import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileDrawer } from "@/components/admin/admin-mobile-drawer";

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
        <main className="p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
