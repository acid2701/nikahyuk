import { Metadata } from "next";
import { PublicVendorRegistrationForm } from "@/components/modules/vendors/public-vendor-registration-form";

export const metadata: Metadata = {
  title: "Pendaftaran Mitra Vendor Pernikahan | NikahYuk SaaS",
  description:
    "Daftarkan layanan usaha vendor pernikahan Anda di NikahYuk SaaS dan dapatkan jangkauan ke ribuan calon pasangan pengantin di seluruh Indonesia.",
};

export default function VendorRegisterPage() {
  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <PublicVendorRegistrationForm />
    </div>
  );
}
