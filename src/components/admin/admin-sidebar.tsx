"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HardDrive,
  ShieldCheck,
  Database,
  History,
  ArrowLeft,
  Crown,
  Users,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Overview Platform",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "User Pendaftar Platform",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Akses Staf Admin (RBAC)",
      href: "/admin/staff-permissions",
      icon: UserCheck,
    },
    {
      title: "Konfigurasi Storage R2",
      href: "/admin/storage-config",
      icon: HardDrive,
    },
    {
      title: "Template Role Defaults",
      href: "/admin/rbac-templates",
      icon: ShieldCheck,
    },
    {
      title: "Encrypted Backups",
      href: "/admin/backups",
      icon: Database,
    },
    {
      title: "Cross-Tenant Audit Logs",
      href: "/admin/audit-logs",
      icon: History,
    },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-amber-500 fill-amber-500/20" />
            <span className="font-serif text-lg font-bold text-foreground">
              NikahYuk Admin
            </span>
          </div>
          <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold tracking-wider uppercase">
            Control Plane
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border space-y-3">
        <div className="text-[11px] text-muted-foreground truncate">
          <p className="font-medium text-foreground truncate">{userEmail}</p>
          <p className="text-[10px]">Role: Superadmin</p>
        </div>

        <Button asChild variant="outline" size="sm" className="w-full text-xs gap-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Dashboard
          </Link>
        </Button>
      </div>
    </aside>
  );
}
