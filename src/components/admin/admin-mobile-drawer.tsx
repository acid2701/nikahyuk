"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Menu, X, Crown } from "lucide-react";

export function AdminMobileDrawer({
  userEmail,
  appName = "NikahYuk",
  logoUrl,
}: {
  userEmail: string;
  appName?: string;
  logoUrl?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close drawer automatically when route/pathname changes (smooth SPA transition)
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="lg:hidden h-8 w-8 text-foreground hover:bg-muted cursor-pointer rounded-full shrink-0 flex items-center justify-center transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Buka Menu Admin"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-card border-r border-border/80 shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-3.5 border-b border-border/70 shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#ff385c]/10 text-[#ff385c] border border-[#ff385c]/20 flex items-center justify-center">
                  <Crown className="h-3.5 w-3.5" />
                </div>
                <span className="font-sans font-bold text-sm text-foreground">
                  Control Plane
                </span>
              </div>
              <button
                type="button"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <AdminSidebar
                userEmail={userEmail}
                onNavigate={() => {
                  setTimeout(() => setOpen(false), 80);
                }}
                className="w-full border-r-0 h-auto"
                appName={appName}
                logoUrl={logoUrl}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
