import { Metadata } from "next";
import { getVendorPartnersAdminAction } from "@/actions/vendor-partner-actions";
import { VendorPartnerApprovalManager } from "@/components/modules/admin/vendor-partner-approval-manager";

export const metadata: Metadata = {
  title: "Moderasi & Approval Mitra Vendor | Admin NikahYuk",
  description: "Halaman peninjauan dan persetujuan mitra vendor pendaftaran publik NikahYuk SaaS.",
};

export default async function AdminVendorPartnersPage() {
  const partners = await getVendorPartnersAdminAction("all");

  return (
    <div className="p-6 space-y-6">
      <VendorPartnerApprovalManager initialPartners={partners} />
    </div>
  );
}
