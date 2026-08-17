import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autentikasi - NikahYuk",
  description: "Masuk atau daftar ke platform NikahYuk Companion SaaS.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-primary">
            NikahYuk
          </h1>
          <p className="text-sm text-muted-foreground">
            Wedding & Event Companion SaaS
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
