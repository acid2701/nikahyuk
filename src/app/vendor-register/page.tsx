import { Metadata } from "next";
import { getAppBranding } from "@/lib/branding";
import { AuthCardShell } from "@/components/shared/auth/auth-card-shell";
import { PublicVendorRegistrationForm } from "@/components/modules/vendors/public-vendor-registration-form";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getAppBranding();
  return {
    title: `Pendaftaran Mitra Vendor Pernikahan | ${branding.appName}`,
    description: `Daftarkan layanan usaha vendor pernikahan Anda di platform ${branding.appName} dan jangkau ribuan calon pasangan pengantin.`,
  };
}

export default async function VendorRegisterPage() {
  const branding = await getAppBranding();

  return (
    <AuthCardShell maxWidth="xl">
      <PublicVendorRegistrationForm
        appName={branding.appName}
        logoUrl={branding.logoUrl}
      />
    </AuthCardShell>
  );
}
