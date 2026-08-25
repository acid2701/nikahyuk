import { Metadata } from "next";
import { VendorLoginForm } from "@/components/modules/vendors/vendor-login-form";

export const metadata: Metadata = {
  title: "Portal Login Mitra Vendor | NikahYuk SaaS",
  description: "Masuk ke akun vendor Anda untuk mengelola paket penawaran interaktif dan profil usaha.",
};

export default function VendorLoginPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4 flex items-center justify-center">
      <VendorLoginForm />
    </div>
  );
}
