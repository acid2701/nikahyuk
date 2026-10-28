import type { Metadata } from "next";
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";
import { getAppBranding } from "@/lib/branding";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getAppBranding();
  return {
    title: `Autentikasi - ${branding.appName}`,
    description: `Masuk atau daftar ke platform ${branding.appName} Companion SaaS.`,
  };
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = await getAppBranding();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4 py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          {branding.logoUrl ? (
            <div className="flex justify-center mb-2">
              <img
                src={branding.logoUrl}
                alt={branding.appName}
                className="h-12 w-auto max-w-[180px] object-contain rounded-lg"
              />
            </div>
          ) : null}
          <h1 className="font-sans text-3xl font-bold tracking-tight text-primary">
            {branding.appName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {branding.tagline}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
