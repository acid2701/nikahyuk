import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

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

  const isSuperadmin =
    user.app_metadata?.role === "superadmin" ||
    user.user_metadata?.role === "superadmin";

  if (!isSuperadmin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar userEmail={user.email || "superadmin@nikahyuk.com"} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-6 max-w-6xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
