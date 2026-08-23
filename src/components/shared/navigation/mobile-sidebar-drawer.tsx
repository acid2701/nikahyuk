"use client";

import * as React from "react";
import { AppSidebar } from "./app-sidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export interface MobileSidebarDrawerProps {
  weddingId?: string;
}

export function MobileSidebarDrawer({ weddingId }: MobileSidebarDrawerProps) {
  const [open, setOpen] = React.useState(false);

  // Prevent background body scroll when mobile drawer is open
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
        variant="ghost"
        size="icon"
        className="lg:hidden h-9 w-9 text-foreground hover:bg-accent cursor-pointer"
        onClick={() => setOpen(true)}
        aria-label="Buka Menu Navigasi"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setOpen(false)}
          />

          {/* Slide-over Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-card border-r border-border shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-serif font-bold text-sm text-primary">
                Menu Navigasi
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <AppSidebar
                weddingId={weddingId}
                onNavigate={() => setOpen(false)}
                className="w-full border-r-0 h-auto"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
