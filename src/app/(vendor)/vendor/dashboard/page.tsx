import { Metadata } from "next";
import { getCurrentUserVendorPartnerAction } from "@/actions/vendor-partner-actions";
import { VendorPartnerDashboard } from "@/components/modules/vendors/vendor-partner-dashboard";
import { SetupVendorProfileForm } from "@/components/modules/vendors/setup-vendor-profile-form";
import { redirect } from "next/navigation";
import { getAppBranding } from "@/lib/branding";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getAppBranding();
  return {
    title: `Dashboard Mitra Vendor | ${branding.appName}`,
    description: `Portal mandiri mitra vendor ${branding.appName}.`,
  };
}

export default async function VendorDashboardPage() {
  const { user, partner } = await getCurrentUserVendorPartnerAction();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background py-8">
      {partner ? (
        <VendorPartnerDashboard partner={partner} />
      ) : (
        <SetupVendorProfileForm
          userEmail={user.email}
          defaultPicName={user.fullName}
        />
      )}
    </div>
  );
}
