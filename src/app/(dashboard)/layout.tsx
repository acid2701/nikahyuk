import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Workspace - NikahYuk",
  description: "Kelola acara pernikahan, rundown live, anggaran, dan daftar tamu.",
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>;
}
