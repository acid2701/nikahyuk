import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { getAppBranding } from "@/lib/branding";
import { VendorSidebar } from "@/components/vendor/vendor-sidebar";
import { VendorMobileDrawer } from "@/components/vendor/vendor-mobile-drawer";
import { VendorHeader } from "@/components/vendor/vendor-header";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getAppBranding();
  return {
    title: `Portal Mitra Vendor - ${branding.appName}`,
    description: `Dashboard mandiri pengelola paket penawaran dan profil usaha vendor resmi ${branding.appName}.`,
  };
}

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const email = user?.email || "vendor@nikahyu.my.id";
  const branding = await getAppBranding();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
      <VendorMobileDrawer userEmail={email} appName={branding.appName} logoUrl={branding.logoUrl} />
      <VendorSidebar userEmail={email} appName={branding.appName} logoUrl={branding.logoUrl} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <VendorHeader userEmail={email} />

        <main className="p-6 space-y-6 flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
