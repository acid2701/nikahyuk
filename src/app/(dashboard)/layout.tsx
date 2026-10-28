import type { Metadata } from "next";
import { getAppBranding } from "@/lib/branding";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getAppBranding();
  return {
    title: `Dashboard Workspace - ${branding.appName}`,
    description: `Kelola acara pernikahan, rundown live, anggaran, dan daftar tamu di ${branding.appName}.`,
  };
}

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>;
}
