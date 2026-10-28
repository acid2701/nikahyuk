import { Metadata } from "next";
import { VendorLoginForm } from "@/components/modules/vendors/vendor-login-form";
import { getAppBranding } from "@/lib/branding";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getAppBranding();
  return {
    title: `Portal Login Mitra Vendor | ${branding.appName}`,
    description: `Masuk ke akun vendor Anda di platform ${branding.appName}.`,
  };
}

export default function VendorLoginPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4 flex items-center justify-center">
      <VendorLoginForm />
    </div>
  );
}
