import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { VendorSidebar } from "@/components/vendor/vendor-sidebar";
import { VendorMobileDrawer } from "@/components/vendor/vendor-mobile-drawer";
import { VendorHeader } from "@/components/vendor/vendor-header";

export const metadata: Metadata = {
  title: "Portal Mitra Vendor - NikahYuk SaaS",
  description: "Dashboard mandiri pengelola paket penawaran dan profil usaha vendor resmi NikahYuk.",
};

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email || "vendor@nikahyuk.com";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
      <VendorMobileDrawer userEmail={email} />
      <VendorSidebar userEmail={email} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <VendorHeader userEmail={email} />

        <main className="p-6 space-y-6 flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
