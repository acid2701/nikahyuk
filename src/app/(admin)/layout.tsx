import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Superadmin Control Plane - NikahYuk",
  description: "Pengaturan infrastruktur dinamis dan rbac global.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/storage-config" className="font-serif text-xl font-bold text-primary">
            NikahYuk Admin
          </Link>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium">
            Superadmin Control Plane
          </span>
        </div>
        <nav className="flex space-x-4 text-sm font-medium text-muted-foreground">
          <Link href="/admin/storage-config" className="hover:text-foreground transition-colors">
            Konfigurasi R2 Storage
          </Link>
          <Link href="/admin/rbac-templates" className="hover:text-foreground transition-colors">
            Template Hak Akses (RBAC)
          </Link>
          <Link href="/dashboard" className="text-xs text-primary hover:underline">
            ← Kembali ke Dashboard
          </Link>
        </nav>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        {children}
      </main>
    </div>
  );
}
