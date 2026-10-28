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
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden h-8 w-8 text-foreground hover:bg-muted cursor-pointer rounded-full shrink-0 flex items-center justify-center z-30"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="Buka Menu Admin"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-card border-r border-border/80 shadow-lg flex flex-col z-50 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border/70">
              <div className="flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-[#ff385c]" />
                <span className="font-sans font-bold text-sm text-foreground">
                  Control Plane
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <AdminSidebar
                userEmail={userEmail}
                onNavigate={() => setOpen(false)}
                className="flex w-full border-r-0 h-auto static min-h-0"
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
